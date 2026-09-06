'use client';

// E. LOGIN — spec: 50-DISENO-ONBOARDING-PAYWALL.md §E. Magic link/OTP por email
// (passwordless, jerarquía Hotmart-first de 26-AUTH-MODERNO). Conectado a
// Supabase Auth real (Sesión 6): signInWithOtp + callback en /auth/callback.

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Estado = 'form' | 'enviando' | 'enviado' | 'error';

export default function EntrarPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('form');
  const [reenviarEn, setReenviarEn] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || estado === 'enviando') return;
    setEstado('enviando');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // No crear cuentas nuevas desde aquí: solo puede entrar quien ya compró
        // (el webhook de Hotmart crea el auth.users) — evita que cualquiera
        // "regale" una prueba entrando con un correo cualquiera.
        shouldCreateUser: false,
      },
    });
    // Anti-enumeración (26-AUTH-MODERNO): si el correo NO existe, Supabase con
    // shouldCreateUser:false responde con error — pero mostrárselo distinto al
    // usuario revelaría qué correos están registrados. Se muestra SIEMPRE el
    // mismo "revisa tu correo"; solo un fallo real (red, rate limit) muestra error.
    const esCorreoInexistente = error?.code === 'otp_disabled' || error?.status === 400;
    if (error && !esCorreoInexistente) {
      setEstado('error');
      return;
    }
    setEstado('enviado');
    setReenviarEn(60);
    const t = window.setInterval(() => {
      setReenviarEn((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5">
      <div className="w-full max-w-sm">
        <a href="/" className="mb-8 flex items-center justify-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <span aria-hidden="true" className="size-6 rounded-lg bg-[var(--accent)]" />
          PawBites
        </a>

        {estado !== 'enviado' ? (
          <>
            <h1 className="text-center text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
              Entra a tu plan
            </h1>
            <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
              Para guardarlo y verlo en cualquier dispositivo — sin contraseñas.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
              <motion.button
                type="submit"
                disabled={estado === 'enviando' || !email.includes('@')}
                whileTap={{ scale: 0.97 }}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-white disabled:opacity-60"
              >
                {estado === 'enviando' && (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                )}
                {estado === 'enviando' ? 'Enviando…' : 'Enviarme mi enlace de acceso'}
              </motion.button>
            </form>

            {estado === 'error' && (
              <p className="mt-3 text-center text-sm text-[var(--error)]">
                No pudimos enviar el correo — revisa tu conexión e inténtalo de nuevo.
              </p>
            )}

            <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
              Sin contraseñas: te llegará un enlace de un solo uso.
              <br />
              ¿Compraste PawBites? Usa el correo de tu compra.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl" style={{ background: 'var(--chip-bg)' }}>
              <Mail size={26} color="var(--accent)" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
              Revisa tu correo
            </h1>
            <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
              Te enviamos el enlace a <strong className="text-[var(--text-primary)]">{email}</strong>. Ábrelo en
              este mismo dispositivo.
            </p>
            <button
              type="button"
              disabled={reenviarEn > 0}
              onClick={handleSubmit}
              className="mt-6 text-sm font-semibold text-[var(--accent)] disabled:text-[var(--text-tertiary)]"
            >
              {reenviarEn > 0 ? `Reenviar en ${reenviarEn}s` : 'Reenviar enlace'}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          ¿Compraste y no te llega el acceso?{' '}
          <a href="mailto:hola@pawbites.app" className="font-semibold text-[var(--accent)]">
            Escríbenos
          </a>
        </p>
      </div>
    </main>
  );
}
