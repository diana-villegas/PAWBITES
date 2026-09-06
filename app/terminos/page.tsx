export default function Terminos() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Términos y Condiciones
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">
        Borrador — pendiente de revisión legal completa antes del lanzamiento.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          PawBites es una calculadora y planificador de porciones para perros. Las
          recomendaciones se basan en promedios nutricionales estándar para perros sanos.
        </p>
        <p>
          El servicio se cobra por suscripción mensual o anual a través de Hotmart. Puedes
          cancelar tu suscripción cuando quieras desde tu cuenta de Hotmart.
        </p>
        <p>
          No garantizamos resultados de salud específicos. Ante cualquier condición médica de tu
          perro, consulta siempre a tu veterinario antes de cambiar su alimentación.
        </p>
      </div>
    </main>
  );
}
