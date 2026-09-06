export default function AvisoNutricional() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Aviso Nutricional
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">
        Borrador — pendiente de revisión legal completa antes del lanzamiento.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          Las porciones que genera PawBites son recomendaciones nutricionales basadas en
          promedios estándar para perros sanos. No sustituyen el diagnóstico ni la supervisión de
          un médico veterinario.
        </p>
        <p>
          Si tu perro tiene una condición médica previa, está en tratamiento, o notas cualquier
          señal de malestar durante la transición de alimento, consulta a tu veterinario antes de
          continuar.
        </p>
      </div>
    </main>
  );
}
