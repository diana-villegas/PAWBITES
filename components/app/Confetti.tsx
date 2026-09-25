'use client';

// Confetti sutil en hitos de racha — N2 de FICHA-ARTE.md (obligatorio: la
// propia ficha exige "confetti sutil en hitos de racha"). Compartido entre
// "Hoy" y "Plan" para no duplicar la animación de celebración.

import { motion, useReducedMotion } from 'motion/react';

const PARTICULAS = [
  { x: -40, y: -30, color: 'var(--cat-green)' },
  { x: 36, y: -34, color: 'var(--cat-yellow)' },
  { x: -30, y: 24, color: 'var(--cat-purple)' },
  { x: 42, y: 14, color: 'var(--cat-blue)' },
  { x: 4, y: -42, color: 'var(--accent)' },
] as const;

export default function Confetti({ activo }: { activo: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {PARTICULAS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-2 rounded-full"
          style={{ background: p.color }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={activo ? { opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
