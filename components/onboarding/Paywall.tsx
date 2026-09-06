'use client';

// C. PAYWALL — spec: 50-DISENO-ONBOARDING-PAYWALL.md §C. Responde las 7 preguntas
// de 02B, con el visual del valor = el plato REAL calculado (no el de ejemplo de
// la landing) + timeline del trial (C4, patrón Blinkist: sube inicios de trial y
// baja la queja #1 "miedo a olvidar cancelar"). CTA guarda el estado local y
// lleva a /entrar — el checkout real de Hotmart se conecta en la Sesión 6 (C3ter:
// simular con estado local, nunca un checkout falso).

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Bone, Check, Drumstick, HeartPulse, Leaf, ShieldCheck, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Plato, Frecuencia } from '@/lib/plato';
import { useCountUp } from '@/components/landing/PlatoMockup';

/** Stagger de entrada de los bloques del paywall (baseline de movimiento #1). */
function useEntrada(): { contenedor: Variants; item: Variants } {
  const reduce = useReducedMotion();
  return {
    contenedor: { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } } },
    item: {
      hidden: { opacity: 0, y: reduce ? 0 : 14 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduce ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] as const },
      },
    },
  };
}

interface Props {
  nombrePerro: string;
  pesoKg: number;
  plato: Plato;
  frecuencia: Frecuencia;
}

type PlanId = 'anual' | 'mensual';

const CATEGORIAS = (p: Plato) =>
  [
    { g: p.carneG, label: 'Carne', icon: Drumstick, c1: 'var(--cat-green-2)', c2: 'var(--cat-green)', rotate: '-rotate-3' },
    p.huesoG > 0
      ? { g: p.huesoG, label: 'Hueso', icon: Bone, c1: 'var(--cat-blue-2)', c2: 'var(--cat-blue)', rotate: 'rotate-3' }
      : null,
    { g: p.visceraG, label: 'Vísceras', icon: HeartPulse, c1: 'var(--cat-purple-2)', c2: 'var(--cat-purple)', rotate: 'rotate-2' },
    { g: p.vegetalG, label: 'Vegetales', icon: Leaf, c1: 'var(--cat-yellow-2)', c2: 'var(--cat-yellow)', rotate: '-rotate-2' },
  ].filter((x): x is NonNullable<typeof x> => x !== null);

const PLANES: Record<PlanId, { nombre: string; ctaLabel: string; recap: string }> = {
  anual: { nombre: 'Anual', ctaLabel: 'Empezar mis 3 días gratis', recap: '1er cobro: $2.50/mes · cancela antes sin costo' },
  mensual: { nombre: 'Mensual', ctaLabel: 'Empezar mis 3 días gratis', recap: '1er cobro: $4.99/mes · cancela antes sin costo' },
};

/** Mismo tratamiento de check que `ChipOpcion` (components/onboarding/ui.tsx) —
 * consistencia de componente entre el onboarding y el paywall (defecto #5). */
function PlanCheck({ seleccionado }: { seleccionado: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
        seleccionado ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-transparent'
      }`}
    >
      {seleccionado && <Check size={12} strokeWidth={3} color="var(--bg)" aria-hidden="true" />}
    </span>
  );
}

/** Celebración N2 (compilador de personalidad, FICHA-ARTE.md): confetti sutil en el
 * momento de mayor revelación de valor — 5 partículas que estallan desde el centro
 * y se desvanecen, UNA sola vez, cuando el conteo del plato termina. */
function Celebracion({ totalG }: { totalG: number }) {
  const valor = useCountUp(totalG, 700);
  const reduce = useReducedMotion();
  const listo = valor === totalG;
  if (reduce) return null;
  const particulas = [
    { x: -34, y: -18, r: -20 },
    { x: 30, y: -26, r: 15 },
    { x: -22, y: 20, r: -10 },
    { x: 36, y: 12, r: 25 },
    { x: 4, y: -34, r: 0 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {particulas.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-1.5 rounded-full bg-white"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={listo ? { opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.r } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

function TotalHero({ totalG }: { totalG: number }) {
  const valor = useCountUp(totalG, 700);
  const listo = valor === totalG;
  return (
    <motion.p
      animate={listo ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="mt-1 text-4xl font-bold tabular-nums leading-none [font-family:var(--font-display)]"
    >
      {valor}
      <span className="ml-1 text-sm font-semibold text-white/80">g totales</span>
    </motion.p>
  );
}

function CategoriaChip({
  g,
  label,
  icon: Icono,
  c1,
  c2,
  rotate,
}: {
  g: number;
  label: string;
  icon: LucideIcon;
  c1: string;
  c2: string;
  rotate: string;
}) {
  const valor = useCountUp(g, 700);
  return (
    <div className={`rounded-2xl bg-[var(--surface)] p-2 text-center shadow-[var(--shadow-1)] ${rotate}`}>
      <div
        className="mx-auto mb-1 flex size-7 items-center justify-center rounded-lg"
        style={{ background: `linear-gradient(145deg, ${c1}, ${c2})` }}
        aria-hidden="true"
      >
        <Icono size={14} strokeWidth={2.2} color="white" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{valor}g</p>
      <p className="text-[12px] font-semibold text-[var(--text-tertiary)]">{label}</p>
    </div>
  );
}

export function Paywall({ nombrePerro, pesoKg, plato, frecuencia }: Props) {
  const categorias = CATEGORIAS(plato);
  const [plan, setPlan] = useState<PlanId>('anual');
  const { contenedor, item } = useEntrada();

  // Estado anónimo → cuenta (26-AUTH-MODERNO): se guarda para que /entrar y el
  // futuro webhook de Hotmart puedan recuperar el plan sin repetir el quiz.
  useEffect(() => {
    try {
      localStorage.setItem(
        'pawbites_onboarding',
        JSON.stringify({ v: 1, nombrePerro, pesoKg, plato, frecuencia, plan, fecha: new Date().toISOString() })
      );
    } catch {
      // localStorage puede fallar (modo privado) — no bloquea el flujo
    }
  }, [nombrePerro, pesoKg, plato, frecuencia, plan]);

  return (
    <div className="flex flex-1 flex-col px-4 pb-8">
      <div className="flex items-center justify-between pt-4">
        <a
          href="/"
          aria-label="Cerrar"
          className="flex size-11 items-center justify-center text-[var(--text-secondary)]"
        >
          <X size={20} aria-hidden="true" />
        </a>
      </div>

      <motion.div variants={contenedor} initial="hidden" animate="visible">
      <motion.h1 variants={item} className="mt-2 text-balance text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
        El <span className="text-[var(--accent)]">Plato Exacto</span> de {nombrePerro} ya está listo
      </motion.h1>
      <motion.p variants={item} className="mt-1 text-sm text-[var(--text-secondary)]">Hecho con su peso, su edad y su actividad.</motion.p>

      {/* Visual del valor: el plato REAL calculado (no un ejemplo genérico) — cuenta de 0 al valor (baseline de movimiento #2) */}
      <motion.div
        variants={item}
        className="relative mt-5 overflow-hidden rounded-[var(--radius-card)] p-5 text-white"
        style={{ background: 'linear-gradient(155deg, color-mix(in oklab, var(--accent) 78%, white), var(--accent))' }}
      >
        <Celebracion totalG={plato.totalG} />
        <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{pesoKg} kg · hoy</p>
        <TotalHero totalG={plato.totalG} />
      </motion.div>
      <motion.div variants={item} className={`mt-3 grid gap-2 ${categorias.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {categorias.map((c) => (
          <CategoriaChip key={c.label} {...c} />
        ))}
      </motion.div>

      {/* Ancla emocional (dolor #3/#4 de FICHA-AVATAR.md: miedo a enfermar/hacerlo mal) —
          se nombra el miedo y se conecta con lo que la app ya resolvió arriba. */}
      <motion.p variants={item} className="mt-4 text-sm font-medium text-[var(--text-primary)]">
        Nada de adivinar cantidades ni arriesgarte a una diarrea por un mal cálculo.
      </motion.p>

      {/* Value stack — máx 3 beneficios en lenguaje de resultado */}
      <motion.ul variants={item} className="mt-3 flex flex-col gap-2.5">
        {[
          'Plan de transición de 14 días, sin diarreas por ir muy rápido',
          `Lista del súper cada ${frecuencia} días, lista para marcar`,
          'Sustituto de ingredientes si algo no lo consigues',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-primary)]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
              <Check size={12} strokeWidth={2.5} color="var(--accent)" aria-hidden="true" />
            </span>
            {f}
          </li>
        ))}
      </motion.ul>

      {/* Ancla de precio (objeción #4 de FICHA-AVATAR.md: "es caro / no sé si lo voy a usar") */}
      <motion.p variants={item} className="mt-3 text-xs text-[var(--text-secondary)]">
        Menos que una consulta con nutricionista veterinario (<span className="font-semibold text-[var(--text-primary)]">$80+</span>) o la comida precocinada (<span className="font-semibold text-[var(--text-primary)]">$150+/mes</span>).
      </motion.p>

      {/* C4 — timeline del trial (patrón Blinkist): responde "¿puedo cancelar?" de un vistazo */}
      <motion.div
        variants={item}
        className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_20%,transparent)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)] p-4"
        style={{ boxShadow: 'inset 0 1px 4px color-mix(in oklab, var(--text-primary) 6%, transparent)' }}
      >
        <TimelineItem activo label="Hoy" detalle={`El plato de ${nombrePerro}, sin límites`} />
        <TimelineItem label="Día 2" detalle="Te avisamos por correo antes de cualquier cobro" />
        <TimelineItem ultimo label="Día 3" detalle={PLANES[plan].recap} />
      </motion.div>

      {/* Plan recomendado — tocable, ambas cards seleccionables (h5: control real, no solo visual) */}
      <motion.div variants={item} className="relative mt-6">
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Más popular
        </span>
        <button
          type="button"
          onClick={() => setPlan('anual')}
          aria-pressed={plan === 'anual'}
          className={`w-full rounded-[var(--radius-card)] bg-[var(--surface)] p-5 pt-6 text-left transition-colors duration-150 ${
            plan === 'anual' ? 'border-2 border-[var(--accent)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <PlanCheck seleccionado={plan === 'anual'} />
              Anual
            </span>
            <span className="text-xs font-bold text-[var(--accent)]">6 meses gratis</span>
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
            $2.50<span className="text-sm font-semibold text-[var(--text-secondary)]">/mes</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Se cobra $29.99/año</p>
        </button>
      </motion.div>
      <motion.button
        variants={item}
        type="button"
        onClick={() => setPlan('mensual')}
        aria-pressed={plan === 'mensual'}
        className={`mt-3 w-full rounded-[var(--radius-card)] p-4 text-left transition-colors duration-150 ${
          plan === 'mensual' ? 'border-2 border-[var(--accent)] bg-[var(--surface)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <PlanCheck seleccionado={plan === 'mensual'} />
            Mensual
          </span>
          <span className="text-xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
            $4.99<span className="text-sm font-semibold text-[var(--text-secondary)]">/mes</span>
          </span>
        </div>
      </motion.button>

      <motion.div variants={item} className="mt-6">
        <motion.a
          whileTap={{ scale: 0.97 }}
          href="/entrar"
          className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-white shadow-[0_8px_24px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
        >
          {PLANES[plan].ctaLabel}
        </motion.a>
        <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
          Hoy no pagas nada · te avisamos antes del cobro · cancela en 1 tap
        </p>
      </motion.div>

      <motion.div variants={item} className="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
        <a href="/">Ahora no</a>
        <span aria-hidden="true">·</span>
        <a href="/entrar">Restaurar compra</a>
      </motion.div>

      <motion.div variants={item} className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <ShieldCheck size={14} aria-hidden="true" />
        Pago seguro con Hotmart · Garantía de 7 días
      </motion.div>
      </motion.div>
    </div>
  );
}

function TimelineItem({
  label,
  detalle,
  activo = false,
  ultimo = false,
}: {
  label: string;
  detalle: string;
  activo?: boolean;
  ultimo?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`size-3 shrink-0 rounded-full ${activo ? 'bg-[var(--accent)]' : 'border-2 border-[var(--accent)] bg-[var(--bg)]'}`}
        />
        {!ultimo && <span className="w-px flex-1 bg-[color-mix(in_oklab,var(--accent)_35%,transparent)]" />}
      </div>
      <div className={ultimo ? 'pb-0' : 'pb-4'}>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-secondary)]">{detalle}</p>
      </div>
    </div>
  );
}
