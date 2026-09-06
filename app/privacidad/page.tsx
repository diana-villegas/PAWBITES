export default function Privacidad() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">
        Borrador — pendiente de revisión legal completa antes del lanzamiento.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          En PawBites recopilamos únicamente los datos necesarios para calcular el plato de tu
          perro: tu correo, y los datos que nos das de tu mascota (nombre, peso, edad, raza,
          nivel de actividad). No compartimos ni vendemos tus datos a terceros.
        </p>
        <p>
          El pago lo procesa Hotmart — nosotros nunca vemos ni guardamos los datos de tu tarjeta.
        </p>
        <p>
          Puedes pedirnos borrar tu cuenta y tus datos en cualquier momento escribiendo a{' '}
          <a href="mailto:hola@pawbites.app" className="text-[var(--accent)]">
            hola@pawbites.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
