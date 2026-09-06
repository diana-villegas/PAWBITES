// Migra el estado anónimo (localStorage, ver lib/appData.ts) a la cuenta real
// tras el primer login — 26-AUTH-MODERNO.md § "USUARIO ANÓNIMO → CUENTA".
// Reglas de ese archivo aplicadas aquí:
// (a) el payload es input NO CONFIABLE (viene del navegador) — se valida con zod.
// (b) el user_id SIEMPRE sale del JWT de la sesión — nunca de algo que venga en el body.
// (c) si la cuenta YA tenía un perro, se conserva el del servidor (no se pisa en silencio).

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const payloadSchema = z.object({
  nombrePerro: z.string().trim().min(1).max(60),
  pesoKg: z.number().positive().max(120),
  edad: z.enum(['cachorro', 'adulto', 'senior']),
  actividad: z.enum(['bajo', 'moderado', 'alto']),
  dieta: z.enum(['barf', 'cocinada']),
  frecuencia: z.union([z.literal(7), z.literal(15)]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos de onboarding inválidos.' }, { status: 400 });
  }
  const r = parsed.data;

  // (c) conservar lo del servidor si la cuenta YA tiene un perro — nunca pisar en silencio.
  const { data: existente } = await supabase.from('dogs').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (existente) {
    return NextResponse.json({ status: 'ya_existe', dogId: existente.id });
  }

  const { data: creado, error } = await supabase
    .from('dogs')
    .insert({
      user_id: user.id,
      name: r.nombrePerro,
      weight_kg: r.pesoKg,
      age_group: r.edad,
      activity_level: r.actividad,
      diet_type: r.dieta,
      prep_frequency_days: r.frecuencia,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar el perro.' }, { status: 500 });
  }

  return NextResponse.json({ status: 'creado', dogId: creado.id });
}
