// Estado de la app interna — Sesión 5. Sin backend todavía (Supabase se conecta en
// Sesión 6): se simula la cuenta con localStorage, con el MISMO modelo de datos que
// ESTADO.md define para `dogs`/`nutrition_plans` (columnas equivalentes), para que
// migrar a Supabase después sea solo cambiar la fuente de datos, no la forma.
// Nunca se enseña vacía (32): si no hay respuestas del onboarding, se usa una semilla
// realista (Luna) para que la app interna siempre tenga contenido real que mostrar.

import {
  calcularPlato,
  porcentajeTransicion,
  type Actividad,
  type CalidadHeces,
  type Dieta,
  type Edad,
  type Frecuencia,
  type Plato,
} from './plato';
import { INGREDIENTES_POR_DEFECTO, type GrupoIngrediente, type Ingredientes } from './sustitutos';

export interface AppState {
  v: 1;
  nombrePerro: string;
  /** Opcional — texto libre, no todos los onboardings previos lo tienen. */
  raza?: string;
  pesoKg: number;
  edad: Edad;
  actividad: Actividad;
  dieta: Dieta;
  frecuencia: Frecuencia;
  plato: Plato;
  /** ISO date — día 1 del plan de transición de 14 días. */
  transitionStartedAt: string;
  /** Semanas consecutivas preparando comida real (racha — loop de retención de ESTADO.md). */
  streakWeeks: number;
  /** Ingredientes de la lista de compras ya marcados como comprados, por clave estable. */
  listaComprada: string[];
  /** Tanda (índice desde `transitionStartedAt`, cada `frecuencia` días) a la
   * que pertenece `listaComprada` — permite detectar cuándo empezó una tanda
   * nueva y limpiar los check-off viejos (defecto real: sin esto, la lista
   * quedaba marcada para siempre después de la primera compra). */
  listaCompradaTanda: number;
  /** Check-in diario de digestión por día del plan (1-14) — mapa de transición. */
  checkins: Record<number, CalidadHeces>;
  /** Días (1-14) en los que ya se tocó "Ya lo preparé" — antes era un
   * useState sin guardar, se perdía al cambiar de pestaña. */
  preparados: Record<number, boolean>;
  /** Ingrediente específico elegido por grupo (sustitutor) — los gramos del
   * grupo nunca cambian, solo cuál alimento concreto los cubre. */
  ingredientes: Ingredientes;
}

const KEY = 'pawbites_app_state';
const KEY_ONBOARDING = 'pawbites_onboarding';
// Separada a propósito del resto del estado: "Cerrar sesión" borra pawbites_app_state
// (lista comprada, racha, historial de digestión — dispositivo compartido, Perfil)
// pero la preferencia de qué ingrediente sustituto usa cada grupo NO es un dato
// sensible de actividad — se conserva aparte para sobrevivir el cierre de sesión.
const KEY_INGREDIENTES = 'pawbites_ingredientes';

function cargarIngredientesPersistentes(): Ingredientes | null {
  try {
    const raw = localStorage.getItem(KEY_INGREDIENTES);
    return raw ? (JSON.parse(raw) as Ingredientes) : null;
  } catch {
    return null;
  }
}

function guardarIngredientesPersistentes(ing: Ingredientes): void {
  try {
    localStorage.setItem(KEY_INGREDIENTES, JSON.stringify(ing));
  } catch {
    // localStorage puede fallar (modo privado) — no bloquea el resto del guardado
  }
}

const SEMILLA_DEMO: Omit<AppState, 'plato' | 'transitionStartedAt' | 'streakWeeks' | 'listaComprada' | 'listaCompradaTanda' | 'checkins' | 'preparados' | 'ingredientes'> = {
  v: 1,
  nombrePerro: 'Luna',
  pesoKg: 15,
  edad: 'adulto',
  actividad: 'moderado',
  dieta: 'cocinada',
  frecuencia: 15,
};

function construirEstadoInicial(): AppState {
  let base = SEMILLA_DEMO;
  try {
    const raw = localStorage.getItem(KEY_ONBOARDING);
    if (raw) {
      const o = JSON.parse(raw);
      // Si falta algún campo (onboardings viejos guardados antes de este fix),
      // se completa con la semilla para no romper el cálculo.
      base = {
        v: 1,
        nombrePerro: o.nombrePerro || SEMILLA_DEMO.nombrePerro,
        raza: o.raza || undefined,
        pesoKg: o.pesoKg || SEMILLA_DEMO.pesoKg,
        edad: o.edad || SEMILLA_DEMO.edad,
        actividad: o.actividad || SEMILLA_DEMO.actividad,
        dieta: o.dieta || SEMILLA_DEMO.dieta,
        frecuencia: o.frecuencia || SEMILLA_DEMO.frecuencia,
      };
    }
  } catch {
    // localStorage inaccesible (modo privado) — sigue con la semilla demo
  }
  const plato = calcularPlato(base);
  return {
    ...base,
    plato,
    transitionStartedAt: new Date().toISOString(),
    streakWeeks: 2,
    listaComprada: [],
    listaCompradaTanda: 0,
    checkins: {},
    preparados: {},
    ingredientes: INGREDIENTES_POR_DEFECTO,
  };
}

/** Índice de la tanda de compra actual (0, 1, 2…), contado en bloques de
 * `frecuencia` días desde `transitionStartedAt` — misma unidad de tiempo que
 * ya usa `diaDeTransicion`, solo que sin tope de 14 días (la tanda sigue
 * corriendo después de terminar la transición). */
export function tandaActual(transitionStartedAt: string, frecuencia: Frecuencia): number {
  const dias = Math.floor((Date.now() - new Date(transitionStartedAt).getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(Math.max(dias, 0) / frecuencia);
}

/** La preferencia de ingrediente sustituto vive aparte de `pawbites_app_state`
 * (ver KEY_INGREDIENTES) para sobrevivir un "Cerrar sesión" — si existe,
 * manda sobre lo que haya en el estado normal. */
function conIngredientesPersistentes(estado: AppState): AppState {
  const persistido = cargarIngredientesPersistentes();
  return persistido ? { ...estado, ingredientes: persistido } : estado;
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const guardado = JSON.parse(raw) as Partial<AppState>;
      // Migración defensiva: estados guardados antes de la Sesión de gamificación
      // no tienen `checkins` ni `listaCompradaTanda` — se completan para no
      // romper el mapa de transición ni la lista de compras.
      const estado = conIngredientesPersistentes({
        checkins: {},
        preparados: {},
        listaComprada: [],
        listaCompradaTanda: 0,
        ingredientes: INGREDIENTES_POR_DEFECTO,
        ...guardado,
      } as AppState);
      // Si ya empezó una tanda nueva desde la última vez que se guardó, los
      // check-off de la tanda anterior ya no aplican — limpiar (defecto real:
      // la lista quedaba marcada para siempre después de la primera compra).
      const tanda = tandaActual(estado.transitionStartedAt, estado.frecuencia);
      if (tanda !== estado.listaCompradaTanda) {
        const limpio = { ...estado, listaComprada: [], listaCompradaTanda: tanda };
        guardarAppState(limpio);
        return limpio;
      }
      return estado;
    }
  } catch {
    // sigue abajo
  }
  const estado = conIngredientesPersistentes(construirEstadoInicial());
  guardarAppState(estado);
  return estado;
}

/** Devuelve `false` si no pudo guardar (modo privado, storage lleno) — la pantalla
 * que llama decide cómo avisarlo; nunca falla en silencio (heurística 9). */
export function guardarAppState(estado: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
    // Mantiene la copia que sobrevive a "Cerrar sesión" al día con cualquier
    // cambio de ingrediente, sin que cada pantalla tenga que acordarse de hacerlo.
    guardarIngredientesPersistentes(estado.ingredientes);
    return true;
  } catch {
    return false;
  }
}

/** Día actual del plan de transición (1-14+), contado desde `transitionStartedAt`. */
export function diaDeTransicion(transitionStartedAt: string): number {
  const inicio = new Date(transitionStartedAt).getTime();
  const hoy = Date.now();
  const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(dias, 1), 14);
}

/** Guarda el check-in de digestión de un día del plan (mapa de transición). */
export function guardarCheckin(estado: AppState, dia: number, calidad: CalidadHeces): AppState {
  return { ...estado, checkins: { ...estado.checkins, [dia]: calidad } };
}

/** Marca (o desmarca) un día como "ya preparado" — antes era un useState sin
 * guardar, se perdía al cambiar de pestaña. */
export function guardarPreparado(estado: AppState, dia: number, valor: boolean): AppState {
  return { ...estado, preparados: { ...estado.preparados, [dia]: valor } };
}

/** Cambia el ingrediente elegido de un grupo (sustitutor) — nunca toca los
 * gramos, solo qué alimento concreto cubre ese grupo. */
export function guardarIngrediente(estado: AppState, grupo: GrupoIngrediente, id: string): AppState {
  return { ...estado, ingredientes: { ...estado.ingredientes, [grupo]: id } };
}

/** Quita el check-in de un día (deshacer un registro por error — control y libertad). */
export function quitarCheckin(estado: AppState, dia: number): AppState {
  const checkins = { ...estado.checkins };
  delete checkins[dia];
  return { ...estado, checkins };
}

interface CheckinDB {
  dayNumber: number;
  quality: CalidadHeces | null;
  preparado: boolean;
}

/** Trae los registros reales de la cuenta (ligados al perro, no al navegador —
 * ver migración 0011 y /api/checkins) y los mezcla con el estado local: la
 * base de datos manda. Si la cuenta todavía no tiene NINGÚN registro pero el
 * navegador sí (de antes de este cambio), se suben una sola vez para no
 * perderlos — después de esa primera subida, la base de datos ya no está
 * vacía y este paso deja de repetirse. Si falla la red o no hay perro
 * todavía, se sigue con lo que había en el navegador (no bloquea la pantalla). */
export async function sincronizarCheckinsConServidor(estado: AppState): Promise<AppState> {
  try {
    const res = await fetch('/api/checkins');
    if (!res.ok) return estado; // sin sesión o sin perro todavía — sigue con localStorage
    const data = (await res.json()) as { checkins: CheckinDB[] };

    if (data.checkins.length > 0) {
      const checkins: Record<number, CalidadHeces> = {};
      const preparados: Record<number, boolean> = {};
      for (const c of data.checkins) {
        if (c.quality) checkins[c.dayNumber] = c.quality;
        if (c.preparado) preparados[c.dayNumber] = true;
      }
      return { ...estado, checkins, preparados };
    }

    // La cuenta no tiene nada guardado todavía — si el navegador sí, se sube
    // una vez (unión de los días con calidad y/o "ya preparado").
    const dias = new Set([...Object.keys(estado.checkins), ...Object.keys(estado.preparados)].map(Number));
    if (dias.size > 0) {
      await Promise.all(
        [...dias].map((dia) =>
          guardarCheckinEnServidor(dia, estado.checkins[dia] ?? null, estado.preparados[dia] ?? false)
        )
      );
    }
    return estado;
  } catch {
    return estado; // sin conexión — la pantalla sigue con lo que ya tenía en el navegador
  }
}

/** Guarda UN día (calidad y/o "ya preparado") en la cuenta real. Se llama
 * junto con `guardarAppState` cada vez que cambia un registro — nunca
 * lanza, devuelve si se pudo guardar para que la pantalla avise si no. */
export async function guardarCheckinEnServidor(
  dia: number,
  calidad: CalidadHeces | null,
  preparado: boolean
): Promise<boolean> {
  try {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber: dia, quality: calidad, preparado }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** La calidad del día anterior al indicado — insumo del ajuste automático del plato. */
export function calidadDiaAnterior(checkins: Record<number, CalidadHeces>, dia: number): CalidadHeces | null {
  return checkins[dia - 1] ?? null;
}

/** Días consecutivos con check-in registrado, terminando en el día más reciente que
 * SÍ tiene check-in (si hoy todavía no se marcó, cuenta desde ayer hacia atrás —
 * no rompe la racha solo por no haber abierto la app todavía hoy). */
export function calcularRachaDias(checkins: Record<number, CalidadHeces>, diaActual: number): number {
  let d = checkins[diaActual] ? diaActual : diaActual - 1;
  let racha = 0;
  while (d >= 1 && checkins[d]) {
    racha++;
    d--;
  }
  return racha;
}

/** Hitos de racha que desbloquean medalla — loop de retención de ESTADO.md. */
export const HITOS_RACHA = [3, 7, 14] as const;

export { porcentajeTransicion };
