// Trae los datos reales del perro de la cuenta (nombre, peso, edad, etc.)
// desde el servidor — hasta ahora Hoy/Plan/Lista/Perfil solo leían esto del
// navegador (localStorage), así que un dispositivo nuevo (o sin el estado
// local de cuando se hizo el cuestionario) mostraba el ejemplo de muestra en
// vez del perro real, aunque la cuenta SÍ lo tuviera guardado (bug real
// encontrado con Karen entrando desde el navegador de Outlook — ver ESTADO.md
// 2026-10-07). El user_id sale siempre del JWT de la sesión (26-AUTH-MODERNO).

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 401 });

  // v1: un perro por cuenta (misma suposición que /api/onboarding/migrate y /api/checkins).
  const { data: perro } = await supabase
    .from('dogs')
    .select('name, breed, weight_kg, age_group, activity_level, diet_type, prep_frequency_days, transition_started_at, already_real_food')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!perro) return NextResponse.json({ perro: null });

  return NextResponse.json({
    perro: {
      nombrePerro: perro.name,
      raza: perro.breed ?? undefined,
      pesoKg: perro.weight_kg,
      edad: perro.age_group,
      actividad: perro.activity_level,
      dieta: perro.diet_type,
      frecuencia: perro.prep_frequency_days,
      transitionStartedAt: perro.transition_started_at,
      yaComeComidaReal: perro.already_real_food,
    },
  });
}
