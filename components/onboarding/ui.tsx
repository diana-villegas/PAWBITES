'use client';

// Piezas compartidas del funnel de onboarding/paywall (spec: 50-DISENO-ONBOARDING-PAYWALL.md).
// Reutiliza los tokens del kit de landing (mismo brand kit, misma FICHA-ARTE).

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, ChevronLeft, X } from 'lucide-react';

/** Barra de progreso fina (2-3px), SIEMPRE visible, arranca en 5-8% (efecto Zeigarnik). */
export function BarraProgreso({ pct }: { pct: number }) {
  const reduce = useReducedMotion();
  const valor = Math.max(pct, 6);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
      <motion.div
        className="h-full rounded-full bg-[var(--accent)]"
        initial={false}
        animate={{ width: `${valor}%` }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Header del funnel: logo + atrás + progreso — presencia de marca en toda pantalla (52 §6). */
export function FunnelHeader({
  pct,
  onBack,
  appName = 'PawBites',
}: {
  pct: number;
  onBack?: () => void;
  appName?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-4">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Atrás"
            className="flex size-11 shrink-0 items-center justify-center text-[var(--text-secondary)]"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        ) : (
          <a
            href="/"
            aria-label="Volver al inicio"
            className="flex size-11 shrink-0 items-center justify-center text-[var(--text-secondary)]"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </a>
        )}
        <BarraProgreso pct={pct} />
        <a
          href="/"
          aria-label="Salir del cuestionario"
          className="flex size-11 shrink-0 items-center justify-center text-[var(--text-tertiary)]"
        >
          <X size={18} aria-hidden="true" />
        </a>
      </div>
      <p className="mt-1 text-center text-xs font-semibold text-[var(--text-tertiary)]">{appName}</p>
    </div>
  );
}

/** Contenedor de pantalla del funnel — mismo shell en toda la secuencia. */
export function PantallaFunnel({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-8 pt-8">{children}</div>;
}

/** Chip de opción — ancho completo, estado seleccionado con check + borde + fondo acento.
 * `index` opcional: entra con stagger 50-60ms respecto a los chips anteriores
 * (baseline de movimiento #1 — DESIGN-CORE §6), respeta reduced-motion. */
export function ChipOpcion({
  label,
  icon,
  seleccionado,
  onClick,
  index = 0,
  deshabilitado = false,
}: {
  label: string;
  icon?: ReactNode;
  seleccionado: boolean;
  onClick: () => void;
  index?: number;
  /** Bloquea taps repetidos durante la pausa de auto-avance (evita doble selección). */
  deshabilitado?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      whileTap={deshabilitado ? undefined : { scale: 0.97 }}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: deshabilitado && !seleccionado ? 0.45 : 1, y: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.3, delay: reduce ? 0 : index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`flex h-14 w-full items-center gap-3 rounded-[var(--radius-button)] border px-4 text-left shadow-[var(--shadow-1)] transition-colors duration-150 [touch-action:manipulation] ${
        seleccionado
          ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)]'
      }`}
      style={seleccionado ? { borderWidth: '1.5px' } : undefined}
    >
      {icon && (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--chip-bg)' }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="flex-1 text-base font-medium text-[var(--text-primary)]">{label}</span>
      {seleccionado && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex size-5 items-center justify-center rounded-full bg-[var(--accent)]"
        >
          <Check size={13} strokeWidth={3} color="var(--bg)" aria-hidden="true" />
        </motion.span>
      )}
    </motion.button>
  );
}

/** CTA fijo del funnel — mismo tratamiento que el CTA de la landing. */
export function CtaFunnel({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] text-base font-semibold [touch-action:manipulation] ${
        disabled
          ? 'bg-[color-mix(in_oklab,var(--accent)_35%,transparent)] text-white/70'
          : 'bg-[var(--accent)] text-white shadow-[0_8px_24px_color-mix(in_oklab,var(--accent)_30%,transparent)]'
      }`}
    >
      {children}
    </motion.button>
  );
}

/** Transición estándar entre pasos del funnel (A4 de 50). */
export const VARIANTES_PASO = {
  entra: { opacity: 0, x: 24 },
  centro: { opacity: 1, x: 0 },
  sale: { opacity: 0, x: -24 },
};
