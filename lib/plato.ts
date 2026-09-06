// Lógica del "Plato Exacto" — 100% matemática local (sin IA), determinística y
// auditable. Basada en proporciones estándar de dietas BARF/cocinada para perros
// sanos (guía general, no reemplaza al veterinario — aviso legal en el onboarding).

export type Actividad = 'bajo' | 'moderado' | 'alto';
export type Edad = 'cachorro' | 'adulto' | 'senior';
export type Dieta = 'barf' | 'cocinada';
export type Frecuencia = 7 | 15;

export interface RespuestasOnboarding {
  nombrePerro: string;
  pesoKg: number;
  edad: Edad;
  actividad: Actividad;
  dieta: Dieta;
  frecuenciaPrep: Frecuencia;
}

export interface Plato {
  totalG: number;
  carneG: number;
  huesoG: number;
  visceraG: number;
  vegetalG: number;
}

/** % del peso corporal que come el perro por día, según edad/actividad (guía general). */
function porcentajeDiario(edad: Edad, actividad: Actividad): number {
  if (edad === 'cachorro') return 0.04;
  if (edad === 'senior') return 0.018;
  // adulto: depende del nivel de actividad
  if (actividad === 'bajo') return 0.02;
  if (actividad === 'alto') return 0.03;
  return 0.025; // moderado
}

export function calcularPlato(r: Pick<RespuestasOnboarding, 'pesoKg' | 'edad' | 'actividad' | 'dieta'>): Plato {
  const pct = porcentajeDiario(r.edad, r.actividad);
  const totalG = Math.round(r.pesoKg * 1000 * pct);

  if (r.dieta === 'barf') {
    return {
      totalG,
      carneG: Math.round(totalG * 0.7),
      huesoG: Math.round(totalG * 0.1),
      visceraG: Math.round(totalG * 0.1),
      vegetalG: Math.round(totalG * 0.1),
    };
  }
  // cocinada: sin hueso crudo (riesgo de astillado al cocinarse) — el aviso
  // legal recomienda suplemento de calcio para dieta cocinada.
  return {
    totalG,
    carneG: Math.round(totalG * 0.75),
    huesoG: 0,
    visceraG: Math.round(totalG * 0.1),
    vegetalG: Math.round(totalG * 0.15),
  };
}

/** Día 1-14 del plan de transición: % de comida real vs. concentrado. */
export function porcentajeTransicion(dia: number): { real: number; concentrado: number } {
  if (dia <= 3) return { real: 25, concentrado: 75 };
  if (dia <= 7) return { real: 50, concentrado: 50 };
  if (dia <= 11) return { real: 75, concentrado: 25 };
  return { real: 100, concentrado: 0 };
}

export const ETIQUETA_EDAD: Record<Edad, string> = {
  cachorro: 'Cachorro (menos de 1 año)',
  adulto: 'Adulto (1 a 7 años)',
  senior: 'Senior (7 años o más)',
};

export const ETIQUETA_ACTIVIDAD: Record<Actividad, string> = {
  bajo: 'Tranquilo — paseos cortos',
  moderado: 'Activo — paseos largos a diario',
  alto: 'Muy activo — corre o hace deporte',
};
