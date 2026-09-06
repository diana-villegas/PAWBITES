// Estado de la app interna — Sesión 5. Sin backend todavía (Supabase se conecta en
// Sesión 6): se simula la cuenta con localStorage, con el MISMO modelo de datos que
// ESTADO.md define para `dogs`/`nutrition_plans` (columnas equivalentes), para que
// migrar a Supabase después sea solo cambiar la fuente de datos, no la forma.
// Nunca se enseña vacía (32): si no hay respuestas del onboarding, se usa una semilla
// realista (Luna) para que la app interna siempre tenga contenido real que mostrar.

import { calcularPlato, porcentajeTransicion, type Actividad, type Dieta, type Edad, type Frecuencia, type Plato } from './plato';

export interface AppState {
  v: 1;
  nombrePerro: string;
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
}

const KEY = 'pawbites_app_state';
const KEY_ONBOARDING = 'pawbites_onboarding';

const SEMILLA_DEMO: Omit<AppState, 'plato' | 'transitionStartedAt' | 'streakWeeks' | 'listaComprada'> = {
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
      // El paywall solo guarda nombrePerro/pesoKg/plato/frecuencia (no edad/actividad/dieta,
      // que no necesitaba); si falta alguno, se completa con la semilla para no romper el cálculo.
      base = {
        v: 1,
        nombrePerro: o.nombrePerro || SEMILLA_DEMO.nombrePerro,
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
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // sigue abajo
  }
  const estado = construirEstadoInicial();
  guardarAppState(estado);
  return estado;
}

/** Devuelve `false` si no pudo guardar (modo privado, storage lleno) — la pantalla
 * que llama decide cómo avisarlo; nunca falla en silencio (heurística 9). */
export function guardarAppState(estado: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
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

export { porcentajeTransicion };
