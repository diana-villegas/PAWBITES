'use client';

// PANTALLA "PLAN" — calendario de transición de 14 días. Objeto principal: la
// fila del día de hoy, resaltada. El resto del calendario da contexto (de dónde
// viene, hacia dónde va) sin competir por atención.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { loadAppState, diaDeTransicion, type AppState } from '@/lib/appData';

const FASES = [
  { rango: [1, 3] as const, etiqueta: '25% real · 75% concentrado' },
  { rango: [4, 7] as const, etiqueta: '50% real · 50% concentrado' },
  { rango: [8, 11] as const, etiqueta: '75% real · 25% concentrado' },
  { rango: [12, 14] as const, etiqueta: '100% comida real' },
];

export default function PlanPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    setEstado(loadAppState());
  }, []);

  if (!estado) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 pt-6">
        <div className="animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)] p-5">
          <div className="h-3 w-40 rounded-full bg-[var(--bg)]" />
          <div className="mt-4 h-64 rounded-[var(--radius-card)] bg-[var(--bg)]" />
        </div>
      </div>
    );
  }

  const diaHoy = diaDeTransicion(estado.transitionStartedAt);

  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
        className="flex flex-col gap-4"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Plan</p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Transición de {estado.nombrePerro}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">14 días de croquetas a comida real, sin diarreas por ir muy rápido.</p>
        </motion.div>

        {FASES.map((fase) => {
          const [desde, hasta] = fase.rango;
          return (
            <motion.div
              key={desde}
              variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                Días {desde}–{hasta} · {fase.etiqueta}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i).map((dia) => {
                  const esHoy = dia === diaHoy;
                  const pasado = dia < diaHoy;
                  return (
                    <div
                      key={dia}
                      className={`flex size-11 flex-col items-center justify-center rounded-xl text-sm font-bold ${
                        esHoy
                          ? 'bg-[var(--accent)] text-white'
                          : pasado
                            ? 'bg-[var(--chip-bg)] text-[var(--accent)]'
                            : 'bg-[var(--bg)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {pasado ? <Check size={16} aria-hidden="true" /> : dia}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        <motion.p
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="pb-4 text-center text-xs text-[var(--text-tertiary)]"
        >
          Guía general para perros sanos — no reemplaza a tu veterinario
        </motion.p>
      </motion.div>
    </div>
  );
}
