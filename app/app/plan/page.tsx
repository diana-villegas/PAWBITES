'use client';

// PANTALLA "PLAN" — Mapa de Transición de 14 días (estilo Duolingo): un camino
// de nodos donde cada día registra un check-in de digestión. El check-in de
// hoy AJUSTA el plato de mañana (lib/plato.ts → ajustarPorDigestion) — la app
// reacciona a lo que el usuario reporta, no es un calendario decorativo.
// Primera pantalla de este patrón (pasa por revisor-visual aunque sea secundaria).

import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Award, Check, AlertTriangle, CircleAlert, Lock, Sparkles, X } from 'lucide-react';
import Confetti from '@/components/app/Confetti';
import { useCountUp } from '@/components/landing/PlatoMockup';
import {
  loadAppState,
  guardarAppState,
  guardarCheckin,
  quitarCheckin,
  calcularRachaDias,
  diaDeTransicion,
  HITOS_RACHA,
  type AppState,
} from '@/lib/appData';
import { ETIQUETA_CALIDAD, type CalidadHeces } from '@/lib/plato';

const FASES = [
  { rango: [1, 3] as const, etiqueta: '25% real · 75% concentrado' },
  { rango: [4, 7] as const, etiqueta: '50% real · 50% concentrado' },
  { rango: [8, 11] as const, etiqueta: '75% real · 25% concentrado' },
  { rango: [12, 14] as const, etiqueta: '100% comida real' },
];

const OPCIONES_CALIDAD: { valor: CalidadHeces; icon: typeof Check; color: string; bg: string; gradiente: string }[] = [
  {
    valor: 'bien',
    icon: Check,
    color: 'white',
    bg: 'color-mix(in oklab, var(--success) 14%, transparent)',
    gradiente: 'linear-gradient(145deg, color-mix(in oklab, var(--success) 70%, white), var(--success))',
  },
  {
    valor: 'blanda',
    icon: CircleAlert,
    color: 'white',
    bg: 'color-mix(in oklab, var(--warning) 16%, transparent)',
    gradiente: 'linear-gradient(145deg, color-mix(in oklab, var(--warning) 70%, white), var(--warning))',
  },
  {
    valor: 'diarrea',
    icon: AlertTriangle,
    color: 'white',
    bg: 'color-mix(in oklab, var(--error) 12%, transparent)',
    gradiente: 'linear-gradient(145deg, color-mix(in oklab, var(--error) 70%, white), var(--error))',
  },
];

/** Sendero punteado detrás de los nodos — recto, porque los nodos van en una
 * sola columna centrada (el zigzag de la ronda 1 desalineaba la línea con el
 * centro real de los nodos pares — defecto real señalado por el revisor). */
function Sendero() {
  return (
    <div
      className="absolute left-1/2 top-7 bottom-7 w-1 -translate-x-1/2 rounded-full"
      style={{ background: 'repeating-linear-gradient(to bottom, var(--chip-bg) 0 6px, transparent 6px 13px)' }}
      aria-hidden="true"
    />
  );
}

function NodoDia({
  dia,
  esHoy,
  diaHoy,
  calidad,
  calidadAyer,
  onCheckin,
  onQuitar,
  entradaLista,
}: {
  dia: number;
  esHoy: boolean;
  diaHoy: number;
  calidad: CalidadHeces | undefined;
  calidadAyer?: CalidadHeces;
  onCheckin: (c: CalidadHeces) => void;
  onQuitar: () => void;
  entradaLista: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);
  const [avisoBloqueo, setAvisoBloqueo] = useState(false);
  const primerBotonRef = useRef<HTMLButtonElement>(null);
  const ultimoBotonRef = useRef<HTMLButtonElement>(null);
  const nodoRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const pasado = calidad !== undefined;
  // Un día ya transcurrido sin check-in (se saltó abrir la app, o se quitó un
  // registro por error) sigue siendo ACCIONABLE, no bloqueado — solo el
  // futuro está realmente bloqueado. Antes esto se confundía con "sin
  // calidad = bloqueado", lo que dejaba días pasados sin registro
  // inaccesibles con una fecha de desbloqueo que ya pasó.
  const futuro = dia > diaHoy;
  const bloqueado = futuro;
  const tappable = !futuro;
  const accionable = tappable && !pasado;
  const opcionActiva = calidad ? OPCIONES_CALIDAD.find((o) => o.valor === calidad) : undefined;
  const rotacionEtiqueta = dia % 2 === 0 ? '-rotate-[3deg]' : 'rotate-[3deg]';
  // El pulso es la señal de "esto es lo único accionable ahora mismo" — si un
  // día pasado sin registrar también pulsara, dos nodos compitiendo por la
  // misma atención dejan de comunicar cuál es "hoy" (defecto real).
  const pulsar = esHoy && !pasado && !reduce;

  const fechaDesbloqueo = (() => {
    const f = new Date();
    f.setDate(f.getDate() + (dia - diaHoy));
    return f.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  })();

  useEffect(() => {
    if (!abierto) return;
    primerBotonRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) setConfirmarQuitar(false);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAbierto(false);
        return;
      }
      // Foco atrapado: Tab en el último elemento vuelve al primero (y viceversa
      // con Shift+Tab) — sin esto, Tab se escapaba del popover "abierto".
      if (e.key === 'Tab') {
        const primero = primerBotonRef.current;
        const ultimo = ultimoBotonRef.current ?? primero;
        if (!primero || !ultimo) return;
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  useEffect(() => {
    // Scrollear antes de que el stagger de entrada asiente el layout centra
    // una posición que luego se corre (defecto real: "hoy" no quedaba
    // visible sin scrollear). `entradaLista` la activa el padre cuando la
    // animación de la fase que contiene "hoy" termina de verdad — no un
    // temporizador fijo que puede desincronizarse en equipos lentos.
    // 'nearest' (no 'center'): centrar el nodo empujaba el header, la
    // racha y las leyendas fuera de la primera vista — el usuario nunca
    // las veía al abrir la pantalla (defecto real). 'nearest' solo
    // desplaza lo mínimo necesario para que el nodo sea visible.
    if (esHoy && entradaLista) {
      nodoRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [esHoy, entradaLista, reduce]);

  return (
    <div
      ref={nodoRef}
      className={`relative flex scroll-mb-24 scroll-mt-32 flex-col items-center ${abierto ? 'z-30' : 'z-10'}`}
    >
      <motion.button
        type="button"
        onClick={() => {
          if (tappable) setAbierto((a) => !a);
          else {
            setAvisoBloqueo(true);
            window.setTimeout(() => setAvisoBloqueo(false), 2200);
          }
        }}
        whileTap={{ scale: 0.94 }}
        animate={pulsar ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={pulsar ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className={`relative flex items-center justify-center rounded-full font-bold [touch-action:manipulation] ${esHoy ? 'size-20 text-xl' : 'size-14 text-base'}`}
        style={{
          background: pasado ? opcionActiva?.gradiente : accionable ? 'var(--chip-bg)' : 'var(--surface-2)',
          color: pasado ? 'white' : accionable ? 'var(--accent)' : 'var(--text-tertiary)',
          border: esHoy
            ? '2px solid var(--accent)'
            : accionable
              ? '3px dashed var(--accent)'
              : pasado
                ? 'none'
                : '2px solid color-mix(in oklab, var(--text-tertiary) 35%, transparent)',
          // Sin opacity reducida: atenuar el botón COMPLETO (fondo+texto) puede
          // hacer que el contraste texto/fondo caiga bajo AA de forma
          // impredecible — el estado "bloqueado" ya se comunica con los
          // tokens neutros (surface-2/text-tertiary), que están verificados
          // ≥4.5:1 sin necesidad de opacidad extra.
          boxShadow: esHoy
            ? 'var(--shadow-2), 0 0 0 6px color-mix(in oklab, var(--accent) 16%, transparent)'
            : 'var(--shadow-1)',
        }}
        aria-label={
          esHoy
            ? pasado
              ? `Día ${dia}: ${ETIQUETA_CALIDAD[calidad!]} — toca para cambiar o quitar el registro de hoy`
              : `Registrar cómo le sentó la comida hoy (día ${dia})`
            : accionable
              ? `Día ${dia} — no registraste, toca para completarlo`
              : pasado
                ? `Día ${dia}: ${ETIQUETA_CALIDAD[calidad!]} — toca para ver o cambiar`
                : `Día ${dia} — se desbloquea el ${fechaDesbloqueo}`
        }
      >
        {pasado && opcionActiva ? (
          <opcionActiva.icon size={22} aria-hidden="true" />
        ) : bloqueado ? (
          <Lock size={16} aria-hidden="true" />
        ) : (
          dia
        )}
      </motion.button>
      <span
        className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-xs font-semibold text-[var(--text-tertiary)] ${rotacionEtiqueta}`}
        style={{
          background:
            pasado || tappable
              ? 'color-mix(in oklab, var(--accent) 20%, transparent)'
              : 'var(--surface-2)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        Día {dia}
      </span>
      {esHoy && (
        <span className="text-xs font-semibold text-[var(--accent)]">
          {pasado ? 'Toca para cambiar' : 'Toca para registrar'}
        </span>
      )}
      {!esHoy && accionable && (
        <span className="text-xs font-semibold text-[var(--accent)]">Sin registrar — toca aquí</span>
      )}
      {!esHoy && pasado && (
        <span className="text-xs font-semibold text-[var(--text-tertiary)]">Toca para ver o cambiar</span>
      )}
      {bloqueado && (
        <span className="text-xs text-[var(--text-tertiary)]">Se desbloquea el {fechaDesbloqueo}</span>
      )}
      <AnimatePresence>
        {avisoBloqueo && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--surface)] py-1.5 pl-3 pr-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-2)]"
          >
            Se desbloquea el {fechaDesbloqueo}
            <button
              type="button"
              onClick={() => setAvisoBloqueo(false)}
              aria-label="Cerrar aviso"
              className="flex size-6 items-center justify-center rounded-full bg-[var(--surface-2)] [touch-action:manipulation]"
            >
              <X size={11} color="var(--text-tertiary)" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10"
            style={{ background: 'color-mix(in oklab, var(--text-primary) 30%, transparent)' }}
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {abierto && accionable && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Registrar día ${dia}`}
            className={`absolute z-20 flex flex-col gap-2 rounded-[var(--radius-card)] bg-[var(--surface)] p-2 shadow-[var(--shadow-2)] ${esHoy ? 'top-20' : 'top-16'}`}
          >
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="absolute -right-3 -top-3 flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] [touch-action:manipulation]"
            >
              <X size={12} color="var(--text-tertiary)" aria-hidden="true" />
            </button>
            {calidadAyer && !pasado && (
              <button
                ref={primerBotonRef}
                type="button"
                onClick={() => {
                  onCheckin(calidadAyer);
                  setAbierto(false);
                }}
                className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] [touch-action:manipulation]"
                style={{ background: 'var(--chip-bg)' }}
              >
                Igual que ayer ({ETIQUETA_CALIDAD[calidadAyer]})
              </button>
            )}
            <div className="flex gap-2">
              {OPCIONES_CALIDAD.map((o, i) => (
                <button
                  key={o.valor}
                  ref={
                    i === 0 && !(calidadAyer && !pasado)
                      ? primerBotonRef
                      : i === OPCIONES_CALIDAD.length - 1
                        ? ultimoBotonRef
                        : undefined
                  }
                  type="button"
                  onClick={() => {
                    onCheckin(o.valor);
                    setAbierto(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-full px-2.5 py-2 [touch-action:manipulation]"
                  style={{ background: o.bg }}
                >
                  <o.icon size={18} color={o.color} aria-hidden="true" />
                  <span className="text-xs font-semibold" style={{ color: o.color }}>
                    {ETIQUETA_CALIDAD[o.valor]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {abierto && pasado && opcionActiva && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Día ${dia}: ${ETIQUETA_CALIDAD[calidad!]}. Toca otra opción para corregir.`}
            className={`absolute z-20 flex flex-col gap-2 rounded-[var(--radius-card)] bg-[var(--surface)] p-2 shadow-[var(--shadow-2)] ${esHoy ? 'top-20' : 'top-16'}`}
          >
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="absolute -right-3 -top-3 flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] [touch-action:manipulation]"
            >
              <X size={12} color="var(--text-tertiary)" aria-hidden="true" />
            </button>
            <div className="flex gap-2">
              {OPCIONES_CALIDAD.map((o, i) => {
                const activa = o.valor === calidad;
                return (
                  <button
                    key={o.valor}
                    ref={i === 0 ? primerBotonRef : undefined}
                    type="button"
                    onClick={() => {
                      onCheckin(o.valor);
                      setAbierto(false);
                    }}
                    aria-pressed={activa}
                    className="flex flex-col items-center gap-1 rounded-full px-2.5 py-2 [touch-action:manipulation]"
                    style={{
                      background: o.bg,
                      outline: activa ? '2px solid var(--accent)' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    <o.icon size={18} color={o.color} aria-hidden="true" />
                    <span className="text-xs font-semibold" style={{ color: o.color }}>
                      {ETIQUETA_CALIDAD[o.valor]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-1 flex items-center justify-center gap-2 border-t border-[var(--surface-2)] pt-2">
              {confirmarQuitar ? (
                <>
                  <span className="text-xs font-semibold text-[var(--text-tertiary)]">¿Quitar el registro?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onQuitar();
                      setAbierto(false);
                    }}
                    className="flex min-h-11 items-center rounded-full px-4 text-xs font-bold text-[var(--error)] [touch-action:manipulation]"
                  >
                    Sí, quitar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarQuitar(false)}
                    className="flex min-h-11 items-center rounded-full px-4 text-xs font-semibold text-[var(--text-tertiary)] [touch-action:manipulation]"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  ref={ultimoBotonRef}
                  onClick={() => setConfirmarQuitar(true)}
                  className="flex min-h-11 items-center rounded-full px-4 text-xs font-semibold text-[var(--error)] [touch-action:manipulation]"
                >
                  Quitar registro
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function PlanPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const [celebrar, setCelebrar] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  // Señal real de "el layout ya se asentó" — se activa cuando termina la
  // animación de entrada de la fase que contiene el nodo de hoy, en vez de
  // un temporizador fijo que podía desincronizarse en equipos lentos.
  const [entradaLista, setEntradaLista] = useState(false);
  // Registro que se acaba de quitar — permite deshacer unos segundos antes
  // de que el usuario pierda la posibilidad de recuperarlo (heurística 3:
  // control y libertad, ya que "Quitar registro" no tiene otra forma de
  // reversión más allá de volver a marcarlo a mano).
  const [ultimoQuitado, setUltimoQuitado] = useState<{ dia: number; calidad: CalidadHeces } | null>(null);
  const reduce = useReducedMotion();
  // Conteo animado (baseline de movimiento #2): se llama SIEMPRE en el mismo
  // orden, nunca tras un return condicional — 0 mientras `estado` no cargó.
  const diaHoyPrevio = estado ? diaDeTransicion(estado.transitionStartedAt) : 1;
  const rachaAnimada = useCountUp(estado ? calcularRachaDias(estado.checkins, diaHoyPrevio) : 0, 600);

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
  const racha = calcularRachaDias(estado.checkins, diaHoy);
  const hitoAlcanzado = [...HITOS_RACHA].reverse().find((h) => racha >= h);

  function registrarCheckin(dia: number, calidad: CalidadHeces) {
    if (!estado) return;
    const rachaAntes = calcularRachaDias(estado.checkins, diaHoy);
    const nuevo = guardarCheckin(estado, dia, calidad);
    const rachaDespues = calcularRachaDias(nuevo.checkins, diaHoy);
    setEstado(nuevo);
    setErrorGuardado(!guardarAppState(nuevo));
    if (rachaDespues > rachaAntes && (HITOS_RACHA as readonly number[]).includes(rachaDespues)) {
      setCelebrar(true);
      window.setTimeout(() => setCelebrar(false), 1000);
    }
  }

  function quitarCheckinDelDia(dia: number) {
    if (!estado) return;
    const calidadPrevia = estado.checkins[dia];
    const nuevo = quitarCheckin(estado, dia);
    setEstado(nuevo);
    setErrorGuardado(!guardarAppState(nuevo));
    if (calidadPrevia) {
      setUltimoQuitado({ dia, calidad: calidadPrevia });
      window.setTimeout(() => setUltimoQuitado((u) => (u?.dia === dia ? null : u)), 5000);
    }
  }

  function deshacerQuitar() {
    if (!ultimoQuitado) return;
    registrarCheckin(ultimoQuitado.dia, ultimoQuitado.calidad);
    setUltimoQuitado(null);
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
        className="flex flex-col gap-4"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Plan</p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Transición de {estado.nombrePerro}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Marca cada día cómo le sentó la comida — si algo no le cae bien, ajustamos el plato solos.
          </p>
          <div className="mt-3 flex gap-3 rounded-full bg-[var(--surface-2)] px-3 py-2">
            {OPCIONES_CALIDAD.map((o) => (
              <span key={o.valor} className="flex items-center gap-1">
                <o.icon size={16} color={o.valor === 'bien' ? 'var(--success)' : o.valor === 'blanda' ? 'var(--warning)' : 'var(--error)'} aria-hidden="true" />
                <span className="text-xs font-semibold text-[var(--text-tertiary)]">{ETIQUETA_CALIDAD[o.valor]}</span>
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full" style={{ background: 'var(--success)' }} aria-hidden="true" />
              <span className="text-xs font-semibold text-[var(--text-tertiary)]">Registrado</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{ border: '2px solid var(--accent)' }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[var(--text-tertiary)]">Hoy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{ border: '2px dashed var(--accent)' }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[var(--text-tertiary)]">Pendiente</span>
            </span>
          </div>
        </motion.div>

        {racha > 0 && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="relative flex items-center gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-2)]"
          >
            <Confetti activo={celebrar} />
            {/* icon-chip cuadrado (no pill): mismo radio que el resto de los
                icon-chip de la app (Hoy, onboarding) — es su propio patrón,
                distinto de los chips/avisos de esta pantalla que sí son pill. */}
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--chip-bg)' }}
              aria-hidden="true"
            >
              {hitoAlcanzado ? (
                <Award size={20} color="var(--accent)" aria-hidden="true" />
              ) : (
                <Sparkles size={20} color="var(--accent)" aria-hidden="true" />
              )}
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {rachaAnimada} {racha === 1 ? 'día seguido' : 'días seguidos'} registrando
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {(() => {
                  const proximoHito = HITOS_RACHA.find((h) => h > racha);
                  if (racha === hitoAlcanzado) return `Medalla desbloqueada: ${hitoAlcanzado} días`;
                  if (proximoHito) return `Faltan ${proximoHito - racha} para tu próxima medalla`;
                  return `Todas las medallas desbloqueadas · último hito: ${hitoAlcanzado} días`;
                })()}
              </p>
            </div>
          </motion.div>
        )}

        {FASES.map((fase, indiceFase) => {
          const [desde, hasta] = fase.rango;
          const totalFase = hasta - desde + 1;
          const registradosFase = Array.from({ length: totalFase }, (_, i) => desde + i).filter(
            (d) => estado.checkins[d] !== undefined
          ).length;
          const contieneHoy = diaHoy >= desde && diaHoy <= hasta;
          return (
            <Fragment key={desde}>
              {indiceFase > 0 && (
                <div className="-my-4 flex justify-center" aria-hidden="true">
                  <div
                    className="h-8 w-1 rounded-full"
                    style={{
                      background:
                        'repeating-linear-gradient(to bottom, var(--chip-bg) 0 6px, transparent 6px 13px)',
                    }}
                  />
                </div>
              )}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                onAnimationComplete={contieneHoy ? () => setEntradaLista(true) : undefined}
                className="rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-2)]"
              >
              <div className="mb-4 flex items-center justify-between">
                <p className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Días {desde}–{hasta} · {fase.etiqueta}
                </p>
                <span
                  className="shrink-0 whitespace-nowrap text-xs font-bold"
                  style={{ color: registradosFase > 0 ? 'var(--success)' : 'var(--text-tertiary)' }}
                  aria-label={`${registradosFase} de ${totalFase} días registrados`}
                >
                  {registradosFase}/{totalFase}
                </span>
              </div>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--success)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(registradosFase / totalFase) * 100}%` }}
                  transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="relative flex flex-col items-center gap-5 pb-1">
                <Sendero />
                {Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i).map((dia) => (
                  <NodoDia
                    key={dia}
                    dia={dia}
                    esHoy={dia === diaHoy}
                    diaHoy={diaHoy}
                    calidad={estado.checkins[dia]}
                    calidadAyer={dia === diaHoy ? estado.checkins[dia - 1] : undefined}
                    onCheckin={(c) => registrarCheckin(dia, c)}
                    onQuitar={() => quitarCheckinDelDia(dia)}
                    entradaLista={entradaLista}
                  />
                ))}
              </div>
              </motion.div>
            </Fragment>
          );
        })}

        {errorGuardado && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)]"
          >
            <span>No se pudo guardar en este dispositivo.</span>
            <button
              type="button"
              onClick={() => setErrorGuardado(!guardarAppState(estado))}
              className="font-semibold text-[var(--accent)] [touch-action:manipulation]"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        <motion.p
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="pb-4 text-center text-xs text-[var(--text-tertiary)]"
        >
          Guía general para perros sanos — no reemplaza a tu veterinario
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {ultimoQuitado && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
          >
            <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-2)]">
              <span>Registro eliminado.</span>
              <button
                type="button"
                onClick={deshacerQuitar}
                className="font-bold text-[var(--accent)] [touch-action:manipulation]"
              >
                Deshacer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
