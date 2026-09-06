'use client';

// Mini-demo HONESTO del mecanismo real (jerarquía de fidelidad, nivel 2 — 19 §5):
// no es un screenshot de la app (que todavía no existe, Sesión 5), pero SÍ reproduce
// el mecanismo real ("el Plato Exacto" calcula gramos por ingrediente) con datos del
// dominio. Usa el dispositivo ownable de FICHA-ARTE.md: tarjetas satélite rotadas
// (-3° a 3°) + icon-chip soft-3D — el mismo lenguaje visual aprobado en Sesión 2.
// Colores de categoría: tokens --cat-* de tokens.css (etiquetan ingrediente, no son marca).
// Los números héroe cuentan de 0 al valor (baseline de movimiento #2 — DESIGN-CORE §6).

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUp, Mail } from 'lucide-react';

export const INGREDIENTES = [
  { g: 220, label: 'Pollo', c1: 'var(--cat-green-2)', c2: 'var(--cat-green)', rotate: '-rotate-3' },
  { g: 45, label: 'Hígado', c1: 'var(--cat-purple-2)', c2: 'var(--cat-purple)', rotate: 'rotate-2' },
  { g: 60, label: 'Zanahoria', c1: 'var(--cat-yellow-2)', c2: 'var(--cat-yellow)', rotate: '-rotate-2' },
  { g: 55, label: 'Hueso', c1: 'var(--cat-blue-2)', c2: 'var(--cat-blue)', rotate: 'rotate-3' },
] as const;

export function useCountUp(target: number, durationMs = 700) {
  const reduce = useReducedMotion();
  const [valor, setValor] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setValor(target);
      return;
    }
    // Sin guard de "ya arrancó": si el efecto se re-ejecuta (p.ej. doble-invocación
    // de Strict Mode en desarrollo), simplemente reinicia la cuenta desde 0 — es
    // idempotente y el cleanup cancela el rAF anterior. Un guard con ref aquí
    // dejaba el contador congelado en 0 en desarrollo (el segundo setup veía el
    // ref ya en `true` y no programaba ningún frame).
    let raf = 0;
    let vivo = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (!vivo) return;
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      setValor(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, reduce]);

  return valor;
}

function IngredienteChip({ ing }: { ing: (typeof INGREDIENTES)[number] }) {
  const g = useCountUp(ing.g, 800);
  return (
    <div
      className={`rounded-2xl bg-[var(--bg)] p-2 text-center shadow-[var(--shadow-1)] ${ing.rotate}`}
    >
      <div
        className="mx-auto mb-1 size-7 rounded-xl"
        style={{ background: `linear-gradient(145deg, ${ing.c1}, ${ing.c2})` }}
        aria-hidden="true"
      />
      <p className="text-xs font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
        {g}g
      </p>
      <p className="text-[9.5px] font-semibold text-[var(--text-tertiary)]">{ing.label}</p>
    </div>
  );
}

/** Segunda aparición del dispositivo ownable (tarjetas satélite) — refuerza la
 * firma visual de FICHA-ARTE.md en una sección distinta a la del Hero, sin
 * animación (estática, más liviana) para no repetir el mismo movimiento dos veces. */
export function IngredientesBand({ titulo }: { titulo: string }) {
  return (
    <div className="mx-auto mt-8 max-w-sm">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
        {titulo}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {INGREDIENTES.map((ing) => (
          <div
            key={ing.label}
            className={`rounded-2xl bg-[var(--surface)] p-2 text-center shadow-[var(--shadow-1)] ${ing.rotate}`}
          >
            <div
              className="mx-auto mb-1 size-7 rounded-xl"
              style={{ background: `linear-gradient(145deg, ${ing.c1}, ${ing.c2})` }}
              aria-hidden="true"
            />
            <p className="text-xs font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
              {ing.g}g
            </p>
            <p className="text-[9.5px] font-semibold text-[var(--text-tertiary)]">{ing.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barra segmentada que se DIBUJA al entrar en viewport (baseline de movimiento #3 —
 * DESIGN-CORE §6) — reutiliza el dispositivo satélite (color por categoría) integrado
 * dentro de la card Anual de la Oferta, no como una coda separada más. */
export function CategoriaBar() {
  const reduce = useReducedMotion();
  const total = INGREDIENTES.reduce((s, i) => s + i.g, 0);
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--text-tertiary)]">
        Calculado por categoría, cada semana
      </p>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg)]">
        {INGREDIENTES.map((ing) => {
          const pct = (ing.g / total) * 100;
          return (
            <motion.div
              key={ing.label}
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${ing.c1}, ${ing.c2})` }}
              initial={{ width: reduce ? `${pct}%` : '0%' }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {INGREDIENTES.map((ing) => (
          <span key={ing.label} className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[var(--text-tertiary)]">
            <span
              className="size-2 rounded-full"
              style={{ background: `linear-gradient(145deg, ${ing.c1}, ${ing.c2})` }}
              aria-hidden="true"
            />
            {ing.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Botón flotante "volver arriba" — aparece tras salir del hero (h3/h8 usabilidad:
 * control y libertad del usuario en páginas largas). Respeta reduced-motion. */
export function BackToTop({ heroId = 'hero' }: { heroId?: string }) {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = document.getElementById(heroId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [heroId]);

  return (
    <motion.a
      href={`#${heroId}`}
      aria-label="Volver arriba"
      className="fixed bottom-24 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-2)] md:bottom-8"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: reduce ? 0 : 0.2 }}
      whileTap={{ scale: 0.94 }}
    >
      <ArrowUp size={18} aria-hidden="true" />
    </motion.a>
  );
}

/** Línea de ayuda/documentación (h10) con el tratamiento del kit (IconChip + ritmo
 * de sección), en vez de un párrafo suelto entre dos secciones con distinto fondo. */
export function AyudaContacto({ email }: { email: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-2 pb-10 text-center">
      <div
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ background: 'var(--chip-bg)' }}
        aria-hidden="true"
      >
        <Mail size={18} color="var(--accent)" />
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        ¿Tienes otra duda?{' '}
        <a href={`mailto:${email}`} className="font-semibold text-[var(--accent)]">
          Escríbenos a {email}
        </a>
      </p>
    </div>
  );
}

export function PlatoMockup() {
  const total = useCountUp(380, 800);

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-5">
      <p className="mb-3 text-sm font-semibold text-[var(--text-tertiary)]">
        Así calcula el Plato Exacto — ejemplo real de la fórmula
      </p>

      {/* Tarjeta héroe del plato — degradé tonal del acento (60-30-10) */}
      <div
        className="rounded-[var(--radius-card)] p-5 text-white"
        style={{
          background:
            'linear-gradient(155deg, color-mix(in oklab, var(--accent) 78%, white), var(--accent))',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
          Hoy · Labrador · 22 kg
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums leading-none [font-family:var(--font-display)]">
          {total}
          <span className="ml-1 text-sm font-semibold text-white/80">g totales</span>
        </p>
      </div>

      {/* Dispositivo ownable: tarjetas satélite rotadas por ingrediente, con conteo animado */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {INGREDIENTES.map((ing) => (
          <IngredienteChip key={ing.label} ing={ing} />
        ))}
      </div>
    </div>
  );
}
