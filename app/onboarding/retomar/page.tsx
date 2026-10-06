// Enlace del correo "envíame el plato" (ver /api/leads/plato) — retoma
// directo la pantalla de precios con el plato ya calculado, sin repetir el
// cuestionario. Reutiliza el MISMO componente Paywall del flujo normal.

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { Paywall } from '@/components/onboarding/Paywall';
import type { Actividad, Dieta, Edad, Frecuencia, Plato } from '@/lib/plato';

export default async function RetomarPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect('/onboarding');

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from('leads_plato')
    .select('nombre_perro, peso_kg, edad, actividad, dieta, frecuencia, plato')
    .eq('id', id)
    .maybeSingle();

  // Enlace vencido, mal copiado, o ya borrado — se manda de vuelta al
  // cuestionario en vez de mostrar una pantalla rota.
  if (!lead) redirect('/onboarding');

  return (
    <main
      className="flex min-h-dvh flex-col"
      style={{
        background:
          'radial-gradient(640px 420px at 50% -8%, color-mix(in oklab, var(--accent) 15%, transparent), transparent 62%), radial-gradient(520px 360px at 100% 100%, color-mix(in oklab, var(--cat-green) 8%, transparent), transparent 60%), var(--bg)',
      }}
    >
      <Paywall
        nombrePerro={lead.nombre_perro}
        pesoKg={lead.peso_kg}
        edad={lead.edad as Edad}
        actividad={lead.actividad as Actividad}
        dieta={lead.dieta as Dieta}
        plato={lead.plato as Plato}
        frecuencia={lead.frecuencia as Frecuencia}
      />
    </main>
  );
}
