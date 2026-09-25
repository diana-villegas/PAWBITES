export default function Reembolsos() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Política de Reembolso
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">
        Borrador — pendiente de revisión legal completa antes del lanzamiento.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          <strong className="font-semibold text-[var(--text-primary)]">
            La Garantía del Primer Plato:
          </strong>{' '}
          si en tus primeros 14 días PawBites no te da el desglose correcto para tu perro,
          escríbenos y te devolvemos tu dinero. Sin preguntas.
        </p>
        <p>
          Más allá de la política de reembolso estándar de Hotmart, nuestra plataforma de pago,
          PawBites respalda esta garantía directamente. Escribe a{' '}
          <a href="mailto:hola@paw-bites.com" className="text-[var(--accent)]">
            hola@paw-bites.com
          </a>{' '}
          o gestiona el reembolso directamente desde tu recibo de compra de Hotmart.
        </p>
      </div>
    </main>
  );
}
