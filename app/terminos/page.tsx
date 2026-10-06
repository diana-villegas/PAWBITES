export default function Terminos() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Términos y Condiciones
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: 5 de octubre de 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">El servicio</h2>
          <p>
            PawBites es operado por Diana Patricia Villegas Peña, desde Colombia. Es una
            calculadora y planificador de porciones para perros: calcula el plato exacto en
            gramos, arma un plan de transición de 14 días y genera tu lista de compras. Las
            recomendaciones se basan en promedios nutricionales estándar para perros sanos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Suscripción y pago</h2>
          <p>
            PawBites se cobra por suscripción mensual o anual, procesada por Hotmart. Empiezas con
            7 días de prueba gratis; si no cancelas antes de que termine, se hace el primer cobro
            automáticamente. Puedes cancelar cuando quieras desde tu cuenta de Hotmart (correo de
            confirmación de tu compra → gestionar suscripción) — la cancelación detiene los
            próximos cobros, pero no interrumpe el acceso que ya pagaste.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Límite de responsabilidad</h2>
          <p>
            PawBites es una guía general para perros sanos — no reemplaza a tu veterinario. No
            garantizamos resultados de salud específicos. Ante cualquier condición médica previa
            de tu perro, o si notas cualquier señal de malestar, consulta siempre a tu veterinario
            antes de cambiar su alimentación.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Contacto</h2>
          <p>
            Preguntas sobre estos términos:{' '}
            <a href="mailto:soportepawbites@gmail.com" className="text-[var(--accent)]">
              soportepawbites@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
