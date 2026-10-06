// Registro diario del plan de transición (calidad de las heces + "ya lo
// preparé"), ligado al perro de la cuenta real — ver migración 0011. El
// user_id SIEMPRE sale del JWT de la sesión (26-AUTH-MODERNO), nunca de algo
// que mande el navegador; el cliente RLS (no admin) hace que Postgres mismo
// rechace cualquier intento de leer o escribir el perro de otra cuenta.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

async function perroDeLaSesion(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'No hay sesión activa.' }, { status: 401 }) } as const;

  // v1: un perro por cuenta (misma suposición que /api/onboarding/migrate).
  const { data: perro } = await supabase.from('dogs').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (!perro) return { error: NextResponse.json({ error: 'Todavía no tienes un perro registrado.' }, { status: 404 }) } as const;

  return { dogId: perro.id as string } as const;
}

export async function GET() {
  const supabase = await createClient();
  const r = await perroDeLaSesion(supabase);
  if ('error' in r) return r.error;

  const { data, error } = await supabase
    .from('checkins')
    .select('day_number, quality, preparado')
    .eq('dog_id', r.dogId)
    .order('day_number', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'No se pudieron leer los registros.' }, { status: 500 });
  }
  return NextResponse.json({
    dogId: r.dogId,
    checkins: (data ?? []).map((c) => ({ dayNumber: c.day_number, quality: c.quality, preparado: c.preparado })),
  });
}

const payloadSchema = z.object({
  dayNumber: z.number().int().min(1).max(14),
  quality: z.enum(['bien', 'blanda', 'diarrea']).nullable(),
  preparado: z.boolean(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const r = await perroDeLaSesion(supabase);
  if ('error' in r) return r.error;

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos de registro inválidos.' }, { status: 400 });
  }
  const { dayNumber, quality, preparado } = parsed.data;

  const { error } = await supabase
    .from('checkins')
    .upsert(
      { dog_id: r.dogId, day_number: dayNumber, quality, preparado },
      { onConflict: 'dog_id,day_number' }
    );

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar el registro.' }, { status: 500 });
  }
  return NextResponse.json({ status: 'guardado' });
}
