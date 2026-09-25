// Webhook de Hotmart — crea/actualiza el plan del usuario cuando Hotmart avisa
// de una compra, cancelación, reembolso, etc. Ver docs/sistema/18-VENTA-HOTMART.md
// "SEGURIDAD DEL WEBHOOK DE HOTMART" — las 4 defensas en orden: autenticidad,
// frescura, idempotencia, autorización (máquina de estados).

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyHotmart } from '@/lib/hotmart-verify';
import { planForEvent, TRIAL_START_EVENT, PLAN_CHANGE_EVENT } from '@/lib/hotmart-membership';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs'; // node:crypto + raw body — no Edge

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const admin = createAdminClient();

  // 1. RAW body — antes de parsear (necesario si algún día se verifica una
  //    firma documentada por Hotmart, y para el hash de auditoría).
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

  // 5. Datos del evento — nombres de campo verificados contra la doc de
  //    Hotmart; si tu cuenta envía otra forma, ajustar aquí (no en 3 lugares).
  const event: string = payload.event;
  const eventId: string =
    payload.id ??
    payload.event_id ??
    payload.data?.purchase?.transaction ??
    `${event}:${payload.data?.buyer?.email}:${ts ?? ''}`;
  const email: string | undefined = payload.data?.buyer?.email ?? payload.email;
  const subscriberCode: string | undefined = payload.data?.subscription?.subscriber?.code;
  const offerCode: string | undefined = payload.data?.purchase?.offer?.code ?? payload.data?.offer?.code;

  if (!email) {
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'no email in payload' }, { status: 400 });
  }

  const decision = planForEvent(event, offerCode);
  const isKnownEvent =
    decision.plan !== null ||
    event === TRIAL_START_EVENT ||
    event === PLAN_CHANGE_EVENT ||
    event === 'SUBSCRIPTION_CANCELLATION' ||
    event === 'PURCHASE_DELAYED';
  if (!isKnownEvent) {
    // Evento que no nos interesa (ej. abandono de carrito) — 200 para que
    // Hotmart no reintente, pero no se dedupe (no cambia nada en la app).
    return NextResponse.json({ received: true, ignored: event });
  }

  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

  // 6. Asegurar que la cuenta de auth exista ANTES de aplicar el cambio de
  //    plan — si no existe, la creamos (dispara handle_new_user(), que crea
  //    la fila de profiles con plan='trial' por defecto). admin.createUser
  //    deja la cuenta lista para el login passwordless existente (/entrar).
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

  // 8. Siempre 200 cuando se tomó una decisión (incluido duplicate/illegal):
  //    Hotmart deja de reintentar.
  return NextResponse.json({ received: true, result: status });
}
