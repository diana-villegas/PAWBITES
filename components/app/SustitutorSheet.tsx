'use client';

// Hoja inferior del sustitutor de ingredientes — reutilizada en "Hoy" y
// "Lista". Cada grupo que se pasa muestra 2-4 equivalentes del MISMO grupo;
// elegir uno nunca cambia los gramos, solo qué alimento concreto los cubre.

import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { ETIQUETA_GRUPO, SUSTITUTOS, type GrupoIngrediente } from '@/lib/sustitutos';

export interface GrupoAMostrar {
  grupo: GrupoIngrediente;
  seleccionado: string;
}

export function SustitutorSheet({
  abierto,
  grupos,
  onElegir,
  onCerrar,
}: {
  abierto: boolean;
  grupos: GrupoAMostrar[];
  onElegir: (grupo: GrupoIngrediente, id: string) => void;
  onCerrar: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'color-mix(in oklab, var(--text-primary) 35%, transparent)' }}
            onClick={onCerrar}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Elegir ingrediente"
            initial={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            transition={{ duration: reduce ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-sm rounded-t-[var(--radius-card)] bg-[var(--surface)] p-5 pb-8 shadow-[var(--shadow-2)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
                Elige el ingrediente
              </p>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center rounded-full bg-[var(--chip-bg)] [touch-action:manipulation]"
              >
                <X size={16} color="var(--text-secondary)" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-5">
              {grupos.map(({ grupo, seleccionado }) => (
                <div key={grupo}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                    {ETIQUETA_GRUPO[grupo]}
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUSTITUTOS[grupo].map((opcion) => {
                      const activo = opcion.id === seleccionado;
                      return (
                        <button
                          key={opcion.id}
                          type="button"
                          onClick={() => onElegir(grupo, opcion.id)}
                          aria-pressed={activo}
                          className={`flex h-12 w-full items-center justify-between rounded-[var(--radius-button)] px-4 text-sm font-semibold [touch-action:manipulation] ${
                            activo
                              ? 'bg-[var(--chip-bg)] text-[var(--accent)]'
                              : 'bg-[var(--bg)] text-[var(--text-primary)]'
                          }`}
                        >
                          {opcion.nombre}
                          {activo && <Check size={16} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-[var(--text-tertiary)]">
              Guía general para perros sanos — no reemplaza a tu veterinario
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
