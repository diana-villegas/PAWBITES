'use client';

// B. LOADING "CONSTRUYENDO TU PLAN" — spec: 50-DISENO-ONBOARDING-PAYWALL.md §B.
// No es relleno: es la apertura del paywall (patrón Noom). 3 líneas personalizadas
// con las respuestas reales, anillo con mesetas (nunca linear), 4-6s de duración.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { ETIQUETA_ACTIVIDAD, ETIQUETA_EDAD, type Actividad, type Edad } from '@/lib/plato';

interface Props {
  nombrePerro: string;
  edad: Edad;
  actividad: Actividad;
  onListo: () => void;
}

export function LoadingPlan({ nombrePerro, edad, actividad, onListo }: Props) {
  const reduce = useReducedMotion();
  const lineas = [
    `Revisando la edad de ${nombrePerro}: ${ETIQUETA_EDAD[edad].split(' (')[0].toLowerCase()}`,
    `Ajustando a su nivel: ${ETIQUETA_ACTIVIDAD[actividad].split(' —')[0].toLowerCase()}`,
    `Calculando los gramos por grupo de alimento`,
    `Armando el plan de transición de 14 días`,
  ];
  const [activa, setActiva] = useState(0);
  const [pct, setPct] = useState(8);

  useEffect(() => {
    if (reduce) {
      setActiva(lineas.length);
      setPct(100);
      const t = setTimeout(onListo, 400);
      return () => clearTimeout(t);
    }
    const pasos = lineas.length;
    let i = 0;
    const avanzarLinea = () => {
      i += 1;
      setActiva(i);
      setPct(Math.round((i / pasos) * 100));
      if (i < pasos) {
        setTimeout(avanzarLinea, 750 + Math.random() * 300);
      } else {
        setTimeout(onListo, 900);
      }
    };
    const inicio = setTimeout(avanzarLinea, 700);
    return () => clearTimeout(inicio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const circunferencia = 2 * Math.PI * 52;

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 text-center"
      role="status"
      aria-live="polite"
      aria-busy={activa < lineas.length}
    >
      <div className="relative flex size-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            initial={{ strokeDashoffset: circunferencia }}
            animate={{ strokeDashoffset: circunferencia * (1 - pct / 100) }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute text-2xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
          {pct}%
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Construyendo el plato de {nombrePerro}…
      </h1>

      <ul className="mt-8 flex w-full max-w-xs flex-col gap-3 text-left">
        {lineas.map((linea, i) => {
          const estado = i < activa ? 'hecha' : i === activa ? 'activa' : 'pendiente';
          return (
            <li key={linea} className="flex items-center gap-3">
              {estado === 'hecha' ? (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
                >
                  <Check size={12} strokeWidth={3} color="var(--bg)" aria-hidden="true" />
                </motion.span>
              ) : estado === 'activa' ? (
                <motion.span
                  animate={reduce ? {} : { opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="size-5 shrink-0 rounded-full bg-[var(--accent)]"
                />
              ) : (
                <span className="size-5 shrink-0 rounded-full border-2 border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]" />
              )}
              <span
                className={`text-sm ${estado === 'pendiente' ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}
              >
                {linea}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
