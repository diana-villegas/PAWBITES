// "Envíame el plato al correo" — lo que ofrece el paywall cuando alguien toca
// "Ahora no" en vez de salir sin dejar rastro. Guarda el lead (solo el servidor
// puede leer esa tabla, ver migración 0010) y manda UN correo con el enlace
// para retomar la pantalla de precios sin repetir el cuestionario.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { enviarCorreo } from '@/lib/email/send';
import { plantillaPlatoPorCorreo } from '@/lib/email/templates';
import { SITE_URL } from '@/lib/email/config';

const platoSchema = z.object({
  totalG: z.number(),
  carneG: z.number(),
  huesoG: z.number(),
  higadoG: z.number(),
  otraVisceraG: z.number(),
  vegetalG: z.number(),
});

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  nombrePerro: z.string().trim().min(1).max(60),
  pesoKg: z.number().positive().max(120),
  edad: z.enum(['cachorro', 'adulto', 'senior']),
  actividad: z.enum(['bajo', 'moderado', 'alto']),
  dieta: z.enum(['barf', 'cocinada']),
  frecuencia: z.union([z.literal(7), z.literal(15)]),
  plato: platoSchema,
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Escribe un correo válido para enviarte el plato.' }, { status: 400 });
  }
  const r = parsed.data;
  const admin = createAdminClient();

  const { data: lead, error } = await admin
    .from('leads_plato')
    .insert({
      email: r.email,
      nombre_perro: r.nombrePerro,
      peso_kg: r.pesoKg,
      edad: r.edad,
      actividad: r.actividad,
      dieta: r.dieta,
      frecuencia: r.frecuencia,
      plato: r.plato,
    })
    .select('id')
    .single();

  if (error || !lead) {
    console.error('leads/plato: no se pudo guardar', { code: error?.code });
    return NextResponse.json({ error: 'No pudimos guardar tu correo — intenta de nuevo.' }, { status: 500 });
  }

  const enlace = `${SITE_URL}/onboarding/retomar?id=${lead.id}`;
  const plantilla = plantillaPlatoPorCorreo({ perro: r.nombrePerro, plato: r.plato, enlace });
  // ref = id del lead: un solo correo por este envío concreto, aunque el
  // botón se toque dos veces por error (mismo patrón de email_log, 0006).
  const estado = await enviarCorreo({ to: r.email, kind: 'plato_correo', ref: lead.id, plantilla });

  if (estado === 'failed' || estado === 'disabled') {
    return NextResponse.json({ error: 'No pudimos enviar el correo — intenta de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ status: 'enviado' });
}
