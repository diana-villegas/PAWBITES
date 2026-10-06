// Sustitutor de ingredientes — equivalencias dentro del MISMO grupo del plato.
// Un solo archivo fácil de editar: para agregar o quitar una opción, solo hay
// que tocar la lista del grupo correspondiente. Nunca incluir alimentos
// peligrosos para perros (cebolla, ajo, uvas, pasas, huesos cocidos).

export type GrupoIngrediente = 'carne' | 'hueso' | 'higado' | 'otraViscera' | 'vegetal';

export interface OpcionIngrediente {
  id: string;
  nombre: string;
}

export const SUSTITUTOS: Record<GrupoIngrediente, OpcionIngrediente[]> = {
  carne: [
    { id: 'pollo', nombre: 'Pollo' },
    { id: 'res', nombre: 'Res' },
    { id: 'pavo', nombre: 'Pavo' },
    { id: 'cerdo_magro', nombre: 'Cerdo magro' },
  ],
  hueso: [
    { id: 'alas_pollo', nombre: 'Alas de pollo' },
    { id: 'cuellos_pollo', nombre: 'Cuellos de pollo' },
    { id: 'carcasa_pollo', nombre: 'Carcasa de pollo' },
  ],
  higado: [
    { id: 'higado_res', nombre: 'Hígado de res' },
    { id: 'higado_pollo', nombre: 'Hígado de pollo' },
  ],
  otraViscera: [
    { id: 'rinon', nombre: 'Riñón' },
    { id: 'molleja', nombre: 'Molleja' },
    { id: 'corazon', nombre: 'Corazón' },
  ],
  vegetal: [
    { id: 'zanahoria', nombre: 'Zanahoria' },
    { id: 'calabaza', nombre: 'Calabaza' },
    { id: 'espinaca', nombre: 'Espinaca' },
  ],
};

export const ETIQUETA_GRUPO: Record<GrupoIngrediente, string> = {
  carne: 'Carne',
  hueso: 'Hueso carnoso',
  higado: 'Hígado',
  otraViscera: 'Otras vísceras',
  vegetal: 'Vegetales',
};

export type Ingredientes = Record<GrupoIngrediente, string>;

/** Primer opción de cada grupo — lo que ya traía el plato antes de este
 * sustitutor (compatibilidad con cuentas guardadas sin elección todavía). */
export const INGREDIENTES_POR_DEFECTO: Ingredientes = {
  carne: SUSTITUTOS.carne[0].id,
  hueso: SUSTITUTOS.hueso[0].id,
  higado: SUSTITUTOS.higado[0].id,
  otraViscera: SUSTITUTOS.otraViscera[0].id,
  vegetal: SUSTITUTOS.vegetal[0].id,
};

export function nombreIngrediente(grupo: GrupoIngrediente, id: string): string {
  return SUSTITUTOS[grupo].find((o) => o.id === id)?.nombre ?? SUSTITUTOS[grupo][0].nombre;
}
