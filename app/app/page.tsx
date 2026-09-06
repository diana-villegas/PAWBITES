'use client';

// PANTALLA "HOY" — protagonista de la app interna (una de las 4 pantallas que
// deciden el dinero: pasa por revisor-visual). Objeto principal: el plato exacto
// de HOY para el perro del usuario. Segundo bloque: dónde va en el plan de 14
// días. Tercer bloque: la racha (loop de retención de ESTADO.md).
//
// spec:
// pantalla: hoy
// objeto_principal: tarjeta héroe del plato de hoy (gramos totales + categorías)
// niveles: {display: 40px, title: 20px, body: 15px, label: 12px}
// acento_en: gramos totales + botón "Ya lo preparé"
// baseline_aplican: [stagger, conteo_hero, anillo_barras, tap, celebracion]
// dispositivo_ownable: tarjetas satélite rotadas por categoría (FICHA-ARTE)
// estados: [empty(fallback a semilla demo), loading(skeleton), success, error(boundary), disabled(botón ya marcado), offline(localStorage)]

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Bone, Check, ChevronRight, Drumstick, HeartPulse, Leaf, ShoppingBasket, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '@/components/landing/PlatoMockup';
import { loadAppState, guardarAppState, diaDeTransicion, porcentajeTransicion, type AppState } from '@/lib/appData';
import type { Plato } from '@/lib/plato';

function categorias(p: Plato): { g: number; label: string; icon: LucideIcon; c1: string; c2: string; rotate: string }[] {
  return [
    { g: p.carneG, label: 'Carne', icon: Drumstick, c1: 'var(--cat-green-2)', c2: 'var(--cat-green)', rotate: '-rotate-6' },
    ...(p.huesoG > 0
      ? [{ g: p.huesoG, label: 'Hueso', icon: Bone, c1: 'var(--cat-blue-2)', c2: 'var(--cat-blue)', rotate: 'rotate-6' }]
      : []),
    { g: p.visceraG, label: 'Vísceras', icon: HeartPulse, c1: 'var(--cat-purple-2)', c2: 'var(--cat-purple)', rotate: 'rotate-3' },
    { g: p.vegetalG, label: 'Vegetales', icon: Leaf, c1: 'var(--cat-yellow-2)', c2: 'var(--cat-yellow)', rotate: '-rotate-3' },
  ];
}

function CategoriaSatelite({ cat }: { cat: ReturnType<typeof categorias>[number] }) {
  const g = useCountUp(cat.g, 800);
  const Icono = cat.icon;
  return (
    <div className={`rounded-2xl bg-[var(--surface)] p-3 text-center shadow-[var(--shadow-1)] ${cat.rotate}`}>
      <div
        className="mx-auto mb-1.5 flex size-8 items-center justify-center rounded-xl"
        style={{ background: `linear-gradient(145deg, ${cat.c1}, ${cat.c2})` }}
        aria-hidden="true"
      >
        <Icono size={15} color="white" aria-hidden="true" />
      </div>
      <p className="text-sm font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{g}g</p>
      <p className="text-[12px] font-semibold text-[var(--text-tertiary)]">{cat.label}</p>
    </div>
  );
}

function PlatoHoySkeleton() {
  return (
    <div className="animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)] p-5">
      <div className="h-3 w-32 rounded-full bg-[var(--bg)]" />
      <div className="mt-4 h-24 rounded-[var(--radius-card)] bg-[var(--bg)]" />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--bg)]" />
        ))}
      </div>
    </div>
  );
}

export default function HoyPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const [marcado, setMarcado] = useState(false);
  const [pulso, setPulso] = useState(0);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const reduce = useReducedMotion();
  // El conteo animado es un hook: se llama SIEMPRE en el mismo orden (nunca tras un
  // return condicional) — con 0 mientras `estado` todavía no cargó de localStorage.
  const total = useCountUpSafe(estado?.plato.totalG ?? 0);

  useEffect(() => {
    setEstado(loadAppState());
  }, []);

  if (!estado) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 pt-6">
        <PlatoHoySkeleton />
      </div>
    );
  }

  const dia = diaDeTransicion(estado.transitionStartedAt);
  const pct = porcentajeTransicion(dia);
  const cats = categorias(estado.plato);

  function marcarPreparado() {
    if (!estado) return;
    const nuevoValor = !marcado;
    setMarcado(nuevoValor);
    const ok = guardarAppState(estado);
    setErrorGuardado(!ok);
    if (nuevoValor && ok) {
      setPulso((p) => p + 1);
      setMostrarExito(true);
      window.setTimeout(() => setMostrarExito(false), 1800);
    }
  }

  /** Reintenta el guardado sin tocar el estado de "marcado" (el toggle ya se aplicó). */
  function reintentarGuardado() {
    if (!estado) return;
    setErrorGuardado(!guardarAppState(estado));
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
        className="flex flex-col gap-4"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Hoy</p>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
              El plato de {estado.nombrePerro}
            </h1>
          </div>
          <motion.div
            key={pulso}
            initial={pulso > 0 ? { scale: 1.3 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1.5"
          >
            <Sparkles size={13} color="var(--accent)" aria-hidden="true" />
            <span className="text-xs font-bold text-[var(--accent)]">Racha: {estado.streakWeeks} sem</span>
          </motion.div>
        </motion.div>

        {/* Objeto principal: tarjeta héroe del plato de hoy — también se puede
            deslizar hacia la izquierda para marcarlo preparado (heurística 7:
            atajo para el usuario recurrente; el botón de abajo sigue siendo
            el método accesible por tap). */}
        <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, visible: { opacity: 1, y: 0 } }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) marcarPreparado();
            }}
            className="rounded-[var(--radius-card)] p-5 text-white shadow-[var(--shadow-1)] [touch-action:pan-y]"
            style={{ background: 'linear-gradient(155deg, color-mix(in oklab, var(--accent) 78%, white), var(--accent))' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
              Día {dia} de 14 · {estado.pesoKg} kg
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums leading-none [font-family:var(--font-display)]">
              {total}
              <span className="ml-1 text-sm font-semibold text-white/80">g totales</span>
            </p>
            <p className="mt-2 text-xs font-semibold text-white/85">
              {pct.real}% comida real · {pct.concentrado}% concentrado hoy
            </p>
            {!marcado && (
              <p className="mt-3 text-xs font-semibold text-white/70">‹‹ Desliza o toca abajo para marcarlo preparado</p>
            )}
          </motion.div>

          <div className={`mt-3 grid gap-2 ${cats.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {cats.map((c) => (
              <CategoriaSatelite key={c.label} cat={c} />
            ))}
          </div>
        </motion.div>

        {/* Acción primaria — se puede deshacer con un segundo tap (control y libertad) */}
        <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}>
          <motion.button
            type="button"
            onClick={marcarPreparado}
            whileTap={{ scale: 0.97 }}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-base font-semibold [touch-action:manipulation] ${
              marcado
                ? 'bg-[var(--chip-bg)] text-[var(--accent)]'
                : 'bg-[var(--accent)] text-white shadow-[0_8px_24px_color-mix(in_oklab,var(--accent)_30%,transparent)]'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {marcado ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check size={18} aria-hidden="true" /> Preparado hoy — deshacer
                </motion.span>
              ) : (
                <motion.span key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Ya lo preparé
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <AnimatePresence>
            {mostrarExito && !errorGuardado && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-center text-xs font-semibold text-[var(--accent)]"
              >
                ✓ Guardado
              </motion.p>
            )}
          </AnimatePresence>
          {errorGuardado && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-xs text-[var(--text-tertiary)]">No se pudo guardar — revisa el espacio del dispositivo.</p>
              <button
                type="button"
                onClick={reintentarGuardado}
                className="text-xs font-semibold text-[var(--accent)] underline [touch-action:manipulation]"
              >
                Reintentar
              </button>
            </div>
          )}
        </motion.div>

        {/* Segundo bloque, fusionado: próximos pasos (plan de transición + lista de
            compras en una sola card — antes eran 2 bloques separados, bajaba la
            carga cognitiva de la primera vista). */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-1)]"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Tu plan de transición</p>
              <Link
                href="/app/plan"
                className="flex items-center gap-0.5 text-xs font-semibold text-[var(--accent)] [touch-action:manipulation]"
              >
                Ver calendario <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: reduce ? `${(dia / 14) * 100}%` : '0%' }}
                animate={{ width: `${(dia / 14) * 100}%` }}
                transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Día {dia} de 14 — {dia >= 14 ? 'transición completa' : `faltan ${14 - dia} días para comida 100% real`}
            </p>
          </div>

          <Link
            href="/app/lista"
            className="flex items-center gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] p-4 [touch-action:manipulation]"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--chip-bg)' }}
              aria-hidden="true"
            >
              <ShoppingBasket size={18} color="var(--accent)" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[var(--text-primary)]">Lista de compras</span>
              <span className="block text-xs text-[var(--text-tertiary)]">
                Preparas cada {estado.frecuencia} días — revisa antes de tu próxima tanda
              </span>
            </span>
            <ChevronRight size={18} color="var(--text-tertiary)" aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** useCountUp normal, pero sin re-renderizar en cada frame durante el estado de carga. */
function useCountUpSafe(target: number) {
  return useCountUp(target, 800);
}
