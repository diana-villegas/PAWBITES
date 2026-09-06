'use client';

// PANTALLA "LISTA" — lista de compras de la tanda actual (cada 7 o 15 días según
// eligió el usuario). Objeto principal: los ingredientes por comprar, con check
// persistente. Cantidad = gramos diarios × días de la tanda, redondeado a kg si aplica.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Bone, Check, Drumstick, HeartPulse, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { loadAppState, guardarAppState, type AppState } from '@/lib/appData';

function itemsLista(estado: AppState): { key: string; label: string; cantidad: string; icon: LucideIcon; c1: string; c2: string }[] {
  const { plato, frecuencia } = estado;
  const kg = (gDiarios: number) => {
    const totalG = gDiarios * frecuencia;
    return totalG >= 1000 ? `${(totalG / 1000).toFixed(1)} kg` : `${totalG} g`;
  };
  const items: { key: string; label: string; cantidad: string; icon: LucideIcon; c1: string; c2: string }[] = [
    { key: 'carne', label: 'Carne (pollo, res o similar)', cantidad: kg(plato.carneG), icon: Drumstick, c1: 'var(--cat-green-2)', c2: 'var(--cat-green)' },
  ];
  if (plato.huesoG > 0) {
    items.push({ key: 'hueso', label: 'Hueso carnoso crudo', cantidad: kg(plato.huesoG), icon: Bone, c1: 'var(--cat-blue-2)', c2: 'var(--cat-blue)' });
  }
  items.push(
    { key: 'vicera', label: 'Vísceras (hígado, riñón)', cantidad: kg(plato.visceraG), icon: HeartPulse, c1: 'var(--cat-purple-2)', c2: 'var(--cat-purple)' },
    { key: 'vegetal', label: 'Vegetales (zanahoria, calabaza)', cantidad: kg(plato.vegetalG), icon: Leaf, c1: 'var(--cat-yellow-2)', c2: 'var(--cat-yellow)' }
  );
  return items;
}

export default function ListaPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    setEstado(loadAppState());
  }, []);

  if (!estado) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 pt-6">
        <div className="animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)] p-5">
          <div className="h-3 w-40 rounded-full bg-[var(--bg)]" />
          <div className="mt-4 h-48 rounded-[var(--radius-card)] bg-[var(--bg)]" />
        </div>
      </div>
    );
  }

  const items = itemsLista(estado);
  const marcados = estado.listaComprada;
  const todosMarcados = items.every((it) => marcados.includes(it.key));

  function toggle(key: string) {
    if (!estado) return;
    const yaEsta = estado.listaComprada.includes(key);
    const listaComprada = yaEsta ? estado.listaComprada.filter((k) => k !== key) : [...estado.listaComprada, key];
    const nuevo = { ...estado, listaComprada };
    setEstado(nuevo);
    guardarAppState(nuevo);
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="flex flex-col gap-4"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Lista</p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Tu tanda de {estado.frecuencia} días
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cantidades para {estado.nombrePerro} — marca lo que ya compraste.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex flex-col gap-2.5"
        >
          {items.map((it) => {
            const activo = marcados.includes(it.key);
            const Icono = it.icon;
            return (
              <motion.button
                key={it.key}
                type="button"
                onClick={() => toggle(it.key)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-1)] transition-colors duration-150 [touch-action:manipulation] ${
                  activo
                    ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]'
                    : 'border-transparent bg-[var(--surface)]'
                }`}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(145deg, ${it.c1}, ${it.c2})` }}
                  aria-hidden="true"
                >
                  <Icono size={17} color="white" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span
                    className={`block text-sm font-semibold ${activo ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}
                  >
                    {it.label}
                  </span>
                  <span className="block text-xs font-medium text-[var(--text-tertiary)]">{it.cantidad}</span>
                </span>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border-2 ${
                    activo ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)]'
                  }`}
                >
                  {activo && <Check size={13} strokeWidth={3} color="white" aria-hidden="true" />}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_6%,var(--bg))] p-4 text-center"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {todosMarcados ? '¡Todo comprado! Ya puedes preparar la tanda.' : `${marcados.length} de ${items.length} comprados`}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
