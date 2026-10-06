export default function Privacidad() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-[var(--bg)] px-6 py-16">
      <a href="/" className="text-sm font-semibold text-[var(--accent)]">
        ← PawBites
      </a>
      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: 5 de octubre de 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Responsable</h2>
          <p>
            PawBites es operado por Diana Patricia Villegas Peña, con sede en Colombia. Para
            cualquier pregunta sobre esta política o tus datos, escribe a{' '}
            <a href="mailto:soportepawbites@gmail.com" className="text-[var(--accent)]">
              soportepawbites@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Qué datos recogemos</h2>
          <p>
            El correo con el que creas tu cuenta, y los datos que nos das de tu perro: nombre,
            peso, edad, raza, nivel de actividad y tipo de dieta. No pedimos datos de salud humana
            ni información financiera — el pago lo procesa Hotmart directamente (ver abajo).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Para qué los usamos</h2>
          <p>
            Para calcular el plato exacto de tu perro, armar su plan de transición de 14 días y
            tu lista de compras, mandarte el enlace de acceso a tu cuenta y avisarte sobre tu
            suscripción (confirmación, próximo cobro, cancelación). Nunca usamos tus datos para
            otro fin sin avisarte primero.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Con quién los compartimos</h2>
          <p>
            No vendemos tus datos. Los únicos que procesan información para que PawBites funcione
            son:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 pl-5 [list-style-type:disc]">
            <li><strong className="text-[var(--text-primary)]">Vercel</strong> — aloja la página y la app.</li>
            <li><strong className="text-[var(--text-primary)]">Supabase</strong> — guarda tu cuenta y los datos de tu perro.</li>
            <li><strong className="text-[var(--text-primary)]">Hotmart</strong> — procesa tu pago; nosotros nunca vemos ni guardamos los datos de tu tarjeta.</li>
            <li><strong className="text-[var(--text-primary)]">Resend</strong> — envía los correos de acceso y avisos de tu suscripción.</li>
            <li><strong className="text-[var(--text-primary)]">Meta (Pixel)</strong> — mide qué pantallas visitas antes de comprar, para mejorar nuestros anuncios. Nunca le mandamos tu correo, el nombre de tu perro ni ningún dato del cuestionario — solo en qué paso vas.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Cuánto tiempo los guardamos</h2>
          <p>
            Mientras tu cuenta esté activa. Si cancelas o nos pides borrarla, eliminamos tus datos
            en un plazo máximo de 30 días.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Tus derechos</h2>
          <p>
            Puedes pedirnos ver, corregir o borrar tus datos en cualquier momento, escribiendo a{' '}
            <a href="mailto:soportepawbites@gmail.com" className="text-[var(--accent)]">
              soportepawbites@gmail.com
            </a>
            . Respondemos en un plazo máximo de 10 días hábiles.
          </p>
        </section>
      </div>
    </main>
  );
}
