// Temporizador diario (vercel.json → 14:00 UTC). Siete trabajos:
//  1) cola: 2º correo de carrito abandonado (a las 24 h) si el lead no compró;
//  2) reintento del acceso: quien pagó y no recibió su correo (el bug caro del archivo 18);
//  3) prueba día 3: recordatorio de activación;
//  4) prueba día 6: aviso honesto antes del cobro (fecha + monto exactos si se conoce el plan);
//  5) recordatorio diario del plan (días 1-14, salvo si ya se marcó "Ya lo preparé");
//  6) recordatorio el día antes de que se acabe la tanda de compra (cada 7/15 días);
//  7) recordatorio mensual para actualizar el peso, después del día 14.
// Los días del 3/4 se cuentan desde profiles.created_at; los de 5/6/7 desde
// dogs.transition_started_at (el día real del plan de transición de ESE perro).
// Todo es idempotente (email_log): correr dos veces no manda dos veces. Los
// trabajos 5/6/7 además respetan profiles.email_reminders_enabled y, entre
// ellos (y con cualquier otro correo que ya se haya mandado hoy), un máximo
// de 1 por cuenta por día — se prioriza tanda_compra > actualizar_peso > plan_diario.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { CART_CHECKOUT_DEFAULT } from '@/lib/hotmart-membership';
import { urlDeBaja, urlDeBajaRecordatorios } from '@/lib/email/sign';
import { enviarAcceso } from '@/lib/email/acceso';
import { enviarCorreo } from '@/lib/email/send';
import {
  plantillaCarrito2,
  plantillaTrialD3,
  plantillaTrialD6,
  plantillaRecordatorioDiario,
  plantillaRecordatorioCompras,
  plantillaActualizarPeso,
} from '@/lib/email/templates';
import { diaParaPorcentaje, porcentajeTransicion, type CalidadHeces } from '@/lib/plato';

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
  const resumen = {
    carrito2: 0,
    accesoReintentado: 0,
    trialD3: 0,
    trialD6: 0,
    planDiario: 0,
    tandaCompra: 0,
    actualizarPeso: 0,
    fallos: 0,
  };
  // "Como máximo un correo por día por usuario" — se llena con cada envío
  // exitoso (de cualquiera de los trabajos de abajo) y los recordatorios
  // nuevos (5/6/7) lo consultan antes de mandar el suyo.
  const yaEnviadoHoy = new Set<string>();

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
    if (estado === 'sent') {
      resumen.accesoReintentado++;
      yaEnviadoHoy.add(p.email);
    } else if (estado === 'failed') resumen.fallos++;
  }

  // 3 y 4) Prueba: día 3 (ventana de 2 días para no perderlo si un día falla) y día 6.
  async function ventana(desdeDias: number, hastaDias: number) {
    const { data } = await admin
      .from('profiles')
      .select('id, email, trial_ends_at, pending_plan')
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
    if (estado === 'sent') {
      resumen.trialD3++;
      yaEnviadoHoy.add(p.email);
    } else if (estado === 'failed') resumen.fallos++;
  }
  for (const p of await ventana(6, 7)) {
    const monto = p.pending_plan === 'mensual' ? '$4.99 USD' : p.pending_plan === 'anual' ? '$29.99 USD' : null;
    const fechaCobro = p.trial_ends_at
      ? new Date(p.trial_ends_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
      : null;
    const estado = await enviarCorreo({
      to: p.email,
      kind: 'trial_d6',
      plantilla: plantillaTrialD6({ perro: await nombreDelPerro(p.id), fechaCobro, monto }),
    });
    if (estado === 'sent') {
      resumen.trialD6++;
      yaEnviadoHoy.add(p.email);
    } else if (estado === 'failed') resumen.fallos++;
  }

  // 5, 6 y 7) Recordatorios del plan de transición — ligados a CADA PERRO (no a la
  // cuenta): día a día, día antes de la tanda de compra, y mensual tras el día 14.
  // Se prioriza en ese orden (tanda_compra > actualizar_peso > plan_diario) y se
  // respeta el interruptor + el máximo de 1 correo por cuenta por día.
  const { data: cuentasActivas } = await admin
    .from('profiles')
    .select('id, email, email_reminders_enabled')
    .neq('plan', 'cancelado')
    .eq('email_reminders_enabled', true)
    .limit(LOTE);

  for (const cuenta of cuentasActivas ?? []) {
    if (yaEnviadoHoy.has(cuenta.email)) continue;

    const { data: perro } = await admin
      .from('dogs')
      .select('id, name, transition_started_at, prep_frequency_days')
      .eq('user_id', cuenta.id)
      .limit(1)
      .maybeSingle();
    if (!perro) continue;

    const diaCalendario = Math.floor((ahora - new Date(perro.transition_started_at).getTime()) / DIA) + 1;
    const frecuencia = perro.prep_frequency_days as 7 | 15;

    // a) El día anterior a que se acabe la tanda actual (se repite cada `frecuencia` días).
    const tandaTerminaManana = diaCalendario >= 1 && diaCalendario % frecuencia === frecuencia - 1;
    // c) Mensual, después de terminar la transición de 14 días.
    const tocaAvisoPeso = diaCalendario > 14;

    if (tandaTerminaManana) {
      const estado = await enviarCorreo({
        to: cuenta.email,
        kind: 'tanda_compra',
        ref: `${perro.id}:${diaCalendario}`,
        plantilla: plantillaRecordatorioCompras({ perro: perro.name, bajaUrl: urlDeBajaRecordatorios(cuenta.email) }),
      });
      if (estado === 'sent') {
        resumen.tandaCompra++;
        yaEnviadoHoy.add(cuenta.email);
      } else if (estado === 'failed') resumen.fallos++;
      continue;
    }

    if (tocaAvisoPeso) {
      const mesActual = new Date(ahora).toISOString().slice(0, 7); // YYYY-MM
      const estado = await enviarCorreo({
        to: cuenta.email,
        kind: 'actualizar_peso',
        ref: `${perro.id}:${mesActual}`,
        plantilla: plantillaActualizarPeso({ perro: perro.name, bajaUrl: urlDeBajaRecordatorios(cuenta.email) }),
      });
      if (estado === 'sent') {
        resumen.actualizarPeso++;
        yaEnviadoHoy.add(cuenta.email);
      } else if (estado === 'failed') resumen.fallos++;
      continue;
    }

    // b) Recordatorio diario (días 1-14) — nunca si ese día ya se marcó "Ya lo preparé".
    if (diaCalendario >= 1 && diaCalendario <= 14) {
      const { data: checkinHoy } = await admin
        .from('checkins')
        .select('preparado')
        .eq('dog_id', perro.id)
        .eq('day_number', diaCalendario)
        .maybeSingle();
      if (checkinHoy?.preparado) continue;

      const { data: checkinsRows } = await admin.from('checkins').select('day_number, quality').eq('dog_id', perro.id);
      const checkins: Record<number, CalidadHeces> = {};
      for (const c of checkinsRows ?? []) if (c.quality) checkins[c.day_number] = c.quality as CalidadHeces;
      const diaPct = diaParaPorcentaje(checkins, diaCalendario);
      const pctReal = porcentajeTransicion(diaPct).real;

      const estado = await enviarCorreo({
        to: cuenta.email,
        kind: 'plan_diario',
        ref: `${perro.id}:${diaCalendario}`,
        plantilla: plantillaRecordatorioDiario({ perro: perro.name, dia: diaCalendario, pctReal, bajaUrl: urlDeBajaRecordatorios(cuenta.email) }),
      });
      if (estado === 'sent') {
        resumen.planDiario++;
        yaEnviadoHoy.add(cuenta.email);
      } else if (estado === 'failed') resumen.fallos++;
    }
  }

  return NextResponse.json({ ok: true, ...resumen });
}
