'use client';

// PANTALLA "PERFIL" — datos del perro + ajustes de cuenta. Pantalla secundaria
// (no pasa por revisor-visual — 07-PREFLIGHT: solo medición + checklist).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Dog, LogOut, ShieldCheck, Weight } from 'lucide-react';
import { loadAppState, type AppState } from '@/lib/appData';
import { ETIQUETA_ACTIVIDAD, ETIQUETA_EDAD } from '@/lib/plato';

export default function PerfilPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const reduce = useReducedMotion();
  const router = useRouter();

  function cerrarSesion() {
    try {
      localStorage.removeItem('pawbites_app_state');
      localStorage.removeItem('pawbites_onboarding');
    } catch {
      // localStorage puede fallar (modo privado) — igual navegamos afuera
    }
    router.push('/');
  }

  useEffect(() => {
    setEstado(loadAppState());
  }, []);

  if (!estado) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 pt-6">
        <div className="animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)] p-5">
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--bg)]" />
        </div>
      </div>
    );
  }

  const filas = [
    { label: 'Peso', valor: `${estado.pesoKg} kg`, icon: Weight },
    { label: 'Edad', valor: ETIQUETA_EDAD[estado.edad], icon: Dog },
    { label: 'Actividad', valor: ETIQUETA_ACTIVIDAD[estado.actividad], icon: Dog },
    { label: 'Dieta', valor: estado.dieta === 'barf' ? 'Cruda (BARF)' : 'Cocinada en casa', icon: Dog },
    { label: 'Preparación', valor: `Cada ${estado.frecuencia} días`, icon: Dog },
  ];

  return (
    <div className="mx-auto w-full max-w-sm px-4 pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="flex flex-col gap-4"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex flex-col items-center gap-2 pt-2 text-center"
        >
          <span
            className="flex size-16 items-center justify-center rounded-2xl"
            style={{ background: 'var(--chip-bg)' }}
            aria-hidden="true"
          >
            <Dog size={28} color="var(--accent)" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
            {estado.nombrePerro}
          </h1>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-1)]"
        >
          {filas.map((f, i) => (
            <div
              key={f.label}
              className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]' : ''}`}
            >
              <span className="text-sm text-[var(--text-secondary)]">{f.label}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{f.valor}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center gap-3 rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_6%,var(--bg))] p-4"
        >
          <ShieldCheck size={18} color="var(--text-tertiary)" aria-hidden="true" />
          <p className="text-xs text-[var(--text-tertiary)]">
            Guía general para perros sanos — no reemplaza a tu veterinario.
          </p>
        </motion.div>

        <motion.button
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 10 }, visible: { opacity: 1, y: 0 } }}
          type="button"
          onClick={cerrarSesion}
          className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-semibold text-[var(--text-tertiary)] [touch-action:manipulation]"
        >
          <LogOut size={16} aria-hidden="true" /> Cerrar sesión
        </motion.button>
      </motion.div>
    </div>
  );
}
