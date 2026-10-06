export default function Reembolsos() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Política de Reembolso
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: 5 de octubre de 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            La Garantía del Primer Plato
          </h2>
          <p>
            Si en tus primeros 14 días PawBites no te da el desglose correcto para tu perro,
            escríbenos y te devolvemos tu dinero. Sin preguntas. Esta garantía la respalda
            PawBites directamente, además de la política de reembolso estándar de Hotmart.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Cómo pedirla</h2>
          <ol className="flex flex-col gap-2 pl-5 [list-style-type:decimal]">
            <li>Escríbenos dentro de los 14 días desde tu primer pago, a{' '}
              <a href="mailto:soportepawbites@gmail.com" className="text-[var(--accent)]">
                soportepawbites@gmail.com
              </a>
              .
            </li>
            <li>Cuéntanos brevemente qué no te funcionó — no necesitas dar una razón detallada.</li>
            <li>
              Te devolvemos el dinero. También puedes gestionar el reembolso directamente desde tu
              recibo de compra de Hotmart (botón "Solicitar reembolso").
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
