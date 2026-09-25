// Webhook de Hotmart — crea/actualiza el plan del usuario cuando Hotmart avisa
// de una compra, cancelación, reembolso, etc., y dispara los correos de cada evento.
// Ver docs/sistema/18-VENTA-HOTMART.md "SEGURIDAD DEL WEBHOOK DE HOTMART" — las 4
// defensas en orden: autenticidad, frescura, idempotencia, autorización (máquina de
// estados). Los correos NUNCA cambian la respuesta: si Resend falla, el evento ya quedó
// aplicado y el cron de reintento (app/api/cron/emails) recupera el acceso.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyHotmart } from '@/lib/hotmart-verify';
import {
  planForEvent,
  checkoutUrlForOffer,
  CART_ABANDON_EVENT,
  TRIAL_START_EVENT,
  PLAN_CHANGE_EVENT,
} from '@/lib/hotmart-membership';
import { createAdminClient } from '@/lib/supabase/admin';
import { enviarAcceso } from '@/lib/email/acceso';
import { enviarCorreo } from '@/lib/email/send';
import { urlDeBaja } from '@/lib/email/sign';
import { plantillaCancelacion, plantillaCarrito1, plantillaPagoFallido } from '@/lib/email/templates';

export const runtime = 'nodejs'; // node:crypto + raw body — no Edge

const REPLAY_WINDOW_MS = 5 * 60 * 1000;
const DIA = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const admin = createAdminClient();

  // 1. RAW body — antes de parsear (hash de auditoría; y si algún día Hotmart documenta
  //    una firma propia, se verifica sobre los bytes exactos).
  const rawBody = await req.text();

  // 2. Autenticidad — hottok en tiempo constante.
  const hottok = req.headers.get('x-hotmart-hottok') ?? undefined;
  if (!verifyHotmart({ hottok })) {
    await admin.from('webhook_log').insert({ result: 'unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 3. Parsear SOLO después de verificar.
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  // 4. Frescura (anti-replay).
  const ts: number | undefined = payload.creation_date ?? payload.data?.purchase?.approved_date;
  if (ts && Date.now() - Number(ts) > REPLAY_WINDOW_MS) {
    return NextResponse.json({ error: 'stale' }, { status: 400 });
  }

  // 5. Datos del evento — nombres de campo según la doc de Hotmart; si esta cuenta envía
  //    otra forma, ajustar SOLO aquí.
  const event: string = payload.event;
  const eventId: string =
    payload.id ??
    payload.event_id ??
    payload.data?.purchase?.transaction ??
    `${event}:${payload.data?.buyer?.email}:${ts ?? ''}`;
  const email: string | undefined = (payload.data?.buyer?.email ?? payload.email)?.toString().trim().toLowerCase();
  const nombre: string | undefined = payload.data?.buyer?.name;
  const subscriberCode: string | undefined = payload.data?.subscription?.subscriber?.code;
  const offerCode: string | undefined = payload.data?.purchase?.offer?.code ?? payload.data?.offer?.code;

  if (!email) {
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'no email in payload' }, { status: 400 });
  }

  // 5b. Abandono de carrito: NO es una compra — no crea cuenta ni cambia ningún plan.
  //     Solo dispara la secuencia de recuperación (1º ahora, 2º en 24 h vía cron).
  if (event === CART_ABANDON_EVENT) {
    const { data: yaCliente } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    if (!yaCliente) {
      try {
        const checkoutUrl = checkoutUrlForOffer(offerCode);
        const bajaUrl = urlDeBaja(email);
        await enviarCorreo({ to: email, kind: 'carrito_1', plantilla: plantillaCarrito1({ nombre, checkoutUrl, bajaUrl }) });
        await admin
          .from('email_queue')
          .upsert(
            { email, name: nombre ?? null, kind: 'carrito_2', send_after: new Date(Date.now() + DIA).toISOString() },
            { onConflict: 'email,kind,ref', ignoreDuplicates: true }
          );
      } catch (e) {
        console.error('hotmart webhook: fallo la secuencia de carrito', { error: (e as Error).name });
      }
    }
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'applied' });
    return NextResponse.json({ received: true, result: 'cart' });
  }

  const decision = planForEvent(event, offerCode);
  const isKnownEvent =
    decision.plan !== null ||
    event === TRIAL_START_EVENT ||
    event === PLAN_CHANGE_EVENT ||
    event === 'SUBSCRIPTION_CANCELLATION' ||
    event === 'PURCHASE_DELAYED';
  if (!isKnownEvent) {
    // Evento que no nos interesa — 200 para que Hotmart no reintente.
    return NextResponse.json({ received: true, ignored: event });
  }

  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

  // 6. Asegurar que la cuenta de auth exista ANTES de aplicar el cambio de plan: si no
  //    existe se crea (dispara handle_new_user(), que crea profiles con plan='trial').
  //    Es lo que deja lista la cuenta para el login sin contraseña (/entrar).
  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  if (!existingProfile) {
    const { error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (createErr && !/already.*regist(ered|istered)/i.test(createErr.message ?? '')) {
      console.error('hotmart webhook: no se pudo crear la cuenta', { event, code: createErr.code });
      await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
      return NextResponse.json({ error: 'user creation failed' }, { status: 500 }); // 5xx → Hotmart reintenta
    }
  }

  // 7. Idempotencia + cambio de plan, atómico en la RPC transaccional.
  const { data, error } = await admin.rpc('apply_hotmart_event', {
    p_event_id: eventId,
    p_event_type: event,
    p_payload_hash: payloadHash,
    p_email: email,
    p_subscriber_code: subscriberCode ?? null,
    p_new_plan: decision.plan,
    p_trial_ends_at: decision.trialEndsAt?.toISOString() ?? null,
  });

  if (error) {
    console.error('hotmart webhook: fallo la RPC', { event, code: error.code });
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }

  const status: string = data?.status ?? 'applied';
  const result = status === 'duplicate' ? 'duplicate' : status === 'illegal_transition' ? 'illegal' : 'applied';
  await admin.from('webhook_log').insert({ event_id: eventId, type: event, result });

  // 8. Correos — SOLO si el evento se aplicó (nunca en duplicados ni transiciones ilegales)
  //    y sin poder romper la respuesta.
  if (status === 'applied') {
    try {
      if (decision.plan === 'trial' || decision.plan === 'mensual' || decision.plan === 'anual') {
        await enviarAcceso(admin, email, nombre);
      } else if (event === 'PURCHASE_DELAYED') {
        await enviarCorreo({ to: email, kind: 'pago_fallido', ref: eventId, plantilla: plantillaPagoFallido({ nombre }) });
      } else if (event === 'SUBSCRIPTION_CANCELLATION') {
        await enviarCorreo({ to: email, kind: 'cancelacion', ref: eventId, plantilla: plantillaCancelacion({ nombre }) });
      }
    } catch (e) {
      console.error('hotmart webhook: fallo el correo', { event, error: (e as Error).name });
    }
  }

  // 9. Siempre 200 cuando se tomó una decisión (incluido duplicate/illegal): Hotmart
  //    deja de reintentar.
  return NextResponse.json({ received: true, result: status });
}
