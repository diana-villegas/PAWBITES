// Temporizador diario (vercel.json → 14:00 UTC). Cuatro trabajos:
//  1) cola: 2º correo de carrito abandonado (a las 24 h) si el lead no compró;
//  2) reintento del acceso: quien pagó y no recibió su correo (el bug caro del archivo 18);
//  3) prueba día 3: recordatorio de activación;
//  4) prueba día 6: aviso honesto antes del cobro.
// Los días se cuentan desde profiles.created_at (la cuenta nace al llegar la compra):
// no dependen de qué evento exacto manda Hotmart al iniciar la prueba (aún sin verificar).
// Todo es idempotente (email_log): correr dos veces no manda dos veces.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { CART_CHECKOUT_DEFAULT } from '@/lib/hotmart-membership';
import { urlDeBaja } from '@/lib/email/sign';
import { enviarAcceso } from '@/lib/email/acceso';
import { enviarCorreo } from '@/lib/email/send';
import { plantillaCarrito2, plantillaTrialD3, plantillaTrialD6 } from '@/lib/email/templates';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DIA = 24 * 60 * 60 * 1000;
const LOTE = 100;

function autorizado(req: NextRequest): boolean {
  const secreto = process.env.CRON_SECRET;
  const recibido = req.headers.get('authorization');
  if (!secreto || !recibido) return false;
  const esperado = Buffer.from(`Bearer ${secreto}`, 'utf8');
  const actual = Buffer.from(recibido, 'utf8');
  if (esperado.length !== actual.length) return false;
  return crypto.timingSafeEqual(esperado, actual);
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'cron no configurado' }, { status: 503 }); // fail-closed
  }
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const ahora = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const resumen = { carrito2: 0, accesoReintentado: 0, trialD3: 0, trialD6: 0, fallos: 0 };

  // 1) Cola de carrito abandonado — solo si esa persona sigue sin ser cliente.
  const { data: cola } = await admin
    .from('email_queue')
    .select('id, email, name, kind')
    .is('sent_at', null)
    .is('cancelled_at', null)
    .lte('send_after', iso(ahora))
    .limit(LOTE);
  for (const item of cola ?? []) {
    const { data: cliente } = await admin.from('profiles').select('id').eq('email', item.email).maybeSingle();
    if (cliente) {
      await admin.from('email_queue').update({ cancelled_at: iso(ahora) }).eq('id', item.id);
      continue;
    }
    if (item.kind !== 'carrito_2') continue;
    let estado;
    try {
      estado = await enviarCorreo({
        to: item.email,
        kind: 'carrito_2',
        plantilla: plantillaCarrito2({ nombre: item.name, checkoutUrl: CART_CHECKOUT_DEFAULT, bajaUrl: urlDeBaja(item.email) }),
      });
    } catch {
      estado = 'failed' as const;
    }
    if (estado === 'sent' || estado === 'duplicate') {
      await admin.from('email_queue').update({ sent_at: iso(ahora) }).eq('id', item.id);
      if (estado === 'sent') resumen.carrito2++;
    } else if (estado === 'suppressed') {
      await admin.from('email_queue').update({ cancelled_at: iso(ahora) }).eq('id', item.id);
    } else {
      resumen.fallos++;
    }
  }

  // 2) Reintento del acceso (cuentas de los últimos 3 días sin correo de acceso enviado).
  const { data: recientes } = await admin
    .from('profiles')
    .select('email')
    .gte('created_at', iso(ahora - 3 * DIA))
    .neq('plan', 'cancelado')
    .limit(LOTE);
  for (const p of recientes ?? []) {
    const estado = await enviarAcceso(admin, p.email);
    if (estado === 'sent') resumen.accesoReintentado++;
    else if (estado === 'failed') resumen.fallos++;
  }

  // 3 y 4) Prueba: día 3 (ventana de 2 días para no perderlo si un día falla) y día 6.
  async function ventana(desdeDias: number, hastaDias: number) {
    const { data } = await admin
      .from('profiles')
      .select('id, email')
      .lte('created_at', iso(ahora - desdeDias * DIA))
      .gt('created_at', iso(ahora - hastaDias * DIA))
      .neq('plan', 'cancelado')
      .limit(LOTE);
    return data ?? [];
  }
  async function nombreDelPerro(userId: string): Promise<string | null> {
    const { data } = await admin.from('dogs').select('name').eq('user_id', userId).limit(1).maybeSingle();
    return data?.name ?? null;
  }

  for (const p of await ventana(3, 5)) {
    const estado = await enviarCorreo({ to: p.email, kind: 'trial_d3', plantilla: plantillaTrialD3({ perro: await nombreDelPerro(p.id) }) });
    if (estado === 'sent') resumen.trialD3++;
    else if (estado === 'failed') resumen.fallos++;
  }
  for (const p of await ventana(6, 7)) {
    const estado = await enviarCorreo({ to: p.email, kind: 'trial_d6', plantilla: plantillaTrialD6({ perro: await nombreDelPerro(p.id) }) });
    if (estado === 'sent') resumen.trialD6++;
    else if (estado === 'failed') resumen.fallos++;
  }

  return NextResponse.json({ ok: true, ...resumen });
}
