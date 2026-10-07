'use client';

// PANTALLA "PERFIL" — datos del perro + ajustes de cuenta. Pantalla secundaria
// (no pasa por revisor-visual — 07-PREFLIGHT: solo medición + checklist).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, CreditCard, Dog, LifeBuoy, LogOut, Pencil, ShieldCheck, Weight, X } from 'lucide-react';
import { loadAppState, guardarAppState, type AppState } from '@/lib/appData';
import {
  calcularPlato,
  ETIQUETA_ACTIVIDAD,
  ETIQUETA_DIETA,
  ETIQUETA_EDAD,
  type Actividad,
  type Dieta,
  type Edad,
  type Frecuencia,
} from '@/lib/plato';
import { createClient } from '@/lib/supabase/client';

/** Selector compacto de opciones (chips en fila) — usado dentro del editor de
 * perfil para edad/actividad/dieta/frecuencia. Mismo tratamiento visual que
 * los chips del onboarding (consistencia entre pantallas), pero en una fila
 * horizontal porque aquí se editan varios campos en un solo formulario. */
function SelectorChips<T extends string | number>({
  opciones,
  valor,
  onChange,
}: {
  opciones: { valor: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            aria-pressed={activo}
            className="rounded-full px-3 py-2 text-xs font-semibold [touch-action:manipulation]"
            style={{
              background: activo ? 'var(--chip-bg)' : 'var(--surface-2)',
              color: activo ? 'var(--accent)' : 'var(--text-secondary)',
              outline: activo ? '2px solid var(--accent)' : 'none',
              outlineOffset: 1,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Nombres en palabras simples — nunca el valor crudo de la base de datos. */
const ETIQUETA_PLAN: Record<string, string> = {
  trial: 'Prueba gratis',
  mensual: 'Mensual',
  anual: 'Anual',
  cancelado: 'Cancelado',
};

const FORMATO_FECHA: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

export default function PerfilPage() {
  const [estado, setEstado] = useState<AppState | null>(null);
  const [saliendo, setSaliendo] = useState(false);
  // Solo lectura: email + plan + fecha vienen directo de la cuenta real
  // (tabla `profiles`, protegida por su propia regla de seguridad — cada
  // cuenta solo puede leer su propia fila). Esta pantalla NUNCA escribe
  // en `plan` ni `trial_ends_at` — cambiar de plan se hace en Hotmart.
  // `recordatorios` SÍ se puede prender/apagar desde aquí (es su interruptor).
  const [cuenta, setCuenta] = useState<{ email: string; plan: string; trialEndsAt: string | null; recordatorios: boolean } | null>(null);
  const [guardandoRecordatorios, setGuardandoRecordatorios] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  // Copia de trabajo del formulario — solo se aplica al estado real al Guardar
  // (control y libertad: Cancelar no debe dejar cambios a medias).
  const [form, setForm] = useState<{
    nombrePerro: string;
    raza: string;
    pesoKg: number;
    edad: Edad;
    actividad: Actividad;
    dieta: Dieta;
    frecuencia: Frecuencia;
  } | null>(null);
  const reduce = useReducedMotion();
  const router = useRouter();

  async function cerrarSesion() {
    if (saliendo) return;
    setSaliendo(true);
    // Cerrar la sesión REAL de Supabase, no solo el estado local — si no,
    // la cookie de sesión sigue viva y en un dispositivo compartido la
    // siguiente persona que abra /app entra con la cuenta anterior.
    try {
      await createClient().auth.signOut();
    } catch {
      // Sin conexión: igual limpiamos lo local y navegamos — el token
      // expira solo, y el próximo signOut con conexión lo completa.
    }
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

  useEffect(() => {
    let activo = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('email, plan, trial_ends_at, email_reminders_enabled')
        .single();
      if (activo && data) {
        setCuenta({ email: data.email, plan: data.plan, trialEndsAt: data.trial_ends_at, recordatorios: data.email_reminders_enabled });
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  /** Prende/apaga el interruptor de recordatorios — solo esa columna, nunca `plan`
   * ni `trial_ends_at` (la regla de seguridad de la cuenta ya limita esto a su
   * propia fila; aquí además solo se manda este único campo). */
  async function cambiarRecordatorios(valor: boolean) {
    if (!cuenta || guardandoRecordatorios) return;
    setCuenta({ ...cuenta, recordatorios: valor });
    setGuardandoRecordatorios(true);
    const { error } = await createClient().from('profiles').update({ email_reminders_enabled: valor }).eq('email', cuenta.email);
    setGuardandoRecordatorios(false);
    if (error) setCuenta({ ...cuenta, recordatorios: !valor }); // no se pudo guardar — revertir
  }

  function abrirEdicion() {
    if (!estado) return;
    setForm({
      nombrePerro: estado.nombrePerro,
      raza: estado.raza ?? '',
      pesoKg: estado.pesoKg,
      edad: estado.edad,
      actividad: estado.actividad,
      dieta: estado.dieta,
      frecuencia: estado.frecuencia,
    });
    setEditando(true);
  }

  function guardarEdicion() {
    if (!estado || !form || guardando) return;
    setGuardando(true);
    const nombrePerro = form.nombrePerro.trim() || estado.nombrePerro;
    const raza = form.raza.trim() || undefined;
    const plato = calcularPlato({
      pesoKg: form.pesoKg,
      edad: form.edad,
      actividad: form.actividad,
      dieta: form.dieta,
    });
    const nuevo: AppState = {
      ...estado,
      nombrePerro,
      raza,
      pesoKg: form.pesoKg,
      edad: form.edad,
      actividad: form.actividad,
      dieta: form.dieta,
      frecuencia: form.frecuencia,
      plato,
    };
    setEstado(nuevo);
    guardarAppState(nuevo);
    setGuardando(false);
    setEditando(false);
  }

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
    ...(estado.raza ? [{ label: 'Raza', valor: estado.raza, icon: Dog }] : []),
    { label: 'Edad', valor: ETIQUETA_EDAD[estado.edad], icon: Dog },
    { label: 'Actividad', valor: ETIQUETA_ACTIVIDAD[estado.actividad], icon: Dog },
    { label: 'Dieta', valor: ETIQUETA_DIETA[estado.dieta], icon: Dog },
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
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
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
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
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

        <motion.button
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          type="button"
          onClick={abrirEdicion}
          className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--chip-bg)] text-sm font-semibold text-[var(--accent)] [touch-action:manipulation]"
        >
          <Pencil size={16} aria-hidden="true" /> Editar datos de {estado.nombrePerro}
        </motion.button>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center gap-3 rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_6%,var(--bg))] p-4"
        >
          <ShieldCheck size={18} color="var(--text-tertiary)" aria-hidden="true" />
          <p className="text-xs text-[var(--text-tertiary)]">
            Guía general para perros sanos — no reemplaza a tu veterinario.
          </p>
        </motion.div>

        {cuenta && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]"
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Mi cuenta</h2>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] py-2.5">
              <span className="text-sm text-[var(--text-secondary)]">Correo</span>
              <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{cuenta.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] py-2.5">
              <span className="text-sm text-[var(--text-secondary)]">Plan</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {ETIQUETA_PLAN[cuenta.plan] ?? cuenta.plan}
              </span>
            </div>
            {cuenta.plan === 'trial' && cuenta.trialEndsAt && (
              <div className="flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] py-2.5">
                <span className="text-sm text-[var(--text-secondary)]">Tu prueba termina</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {new Date(cuenta.trialEndsAt).toLocaleDateString('es-CO', FORMATO_FECHA)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] py-2.5">
              <span className="text-sm text-[var(--text-secondary)]">Recibir recordatorios por correo</span>
              <button
                type="button"
                role="switch"
                aria-checked={cuenta.recordatorios}
                disabled={guardandoRecordatorios}
                onClick={() => cambiarRecordatorios(!cuenta.recordatorios)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 [touch-action:manipulation]"
                style={{ background: cuenta.recordatorios ? 'var(--accent)' : 'var(--surface-2)' }}
              >
                <span
                  className="absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: cuenta.recordatorios ? 'translateX(22px)' : 'translateX(4px)' }}
                />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
              El día a día de tu plan, el aviso antes de comprar y el recordatorio de actualizar el peso.
            </p>

            <a
              href="https://consumer.hotmart.com"
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--chip-bg)] text-sm font-semibold text-[var(--accent)] [touch-action:manipulation]"
            >
              <CreditCard size={16} aria-hidden="true" /> Gestionar o cancelar mi suscripción
            </a>
            <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">
              Hotmart procesa tu pago — ahí mismo cancelas o cambias tu suscripción cuando quieras.
            </p>

            <a
              href="mailto:hola@paw-bites.com"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] [touch-action:manipulation]"
            >
              <LifeBuoy size={14} aria-hidden="true" /> ¿Necesitas ayuda? Escríbenos
            </a>
          </motion.div>
        )}

        <motion.button
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          type="button"
          disabled={saliendo}
          onClick={cerrarSesion}
          className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-semibold text-[var(--text-tertiary)] disabled:opacity-60 [touch-action:manipulation]"
        >
          <LogOut size={16} aria-hidden="true" /> {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {editando && form && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'color-mix(in oklab, var(--text-primary) 30%, transparent)' }}
            onClick={() => setEditando(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editando && form && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Editar datos de ${estado.nombrePerro}`}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-t-[var(--radius-card)] bg-[var(--surface)] p-5 pb-8 shadow-[var(--shadow-2)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
                Editar datos
              </h2>
              <button
                type="button"
                onClick={() => setEditando(false)}
                aria-label="Cerrar"
                className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] [touch-action:manipulation]"
              >
                <X size={16} color="var(--text-tertiary)" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">Nombre</label>
                <input
                  value={form.nombrePerro}
                  onChange={(e) => setForm({ ...form, nombrePerro: e.target.value })}
                  className="h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">
                  Raza (opcional)
                </label>
                <input
                  value={form.raza}
                  onChange={(e) => setForm({ ...form, raza: e.target.value })}
                  placeholder="Ej. Labrador, mestizo"
                  className="h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[var(--text-tertiary)]">
                  <span>Peso</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{form.pesoKg} kg</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={80}
                  step={1}
                  value={form.pesoKg}
                  onChange={(e) => setForm({ ...form, pesoKg: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)]"
                  aria-label="Peso en kilogramos"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">Edad</label>
                <SelectorChips
                  opciones={(Object.keys(ETIQUETA_EDAD) as Edad[]).map((v) => ({ valor: v, label: ETIQUETA_EDAD[v] }))}
                  valor={form.edad}
                  onChange={(edad) => setForm({ ...form, edad })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">Actividad</label>
                <SelectorChips
                  opciones={(Object.keys(ETIQUETA_ACTIVIDAD) as Actividad[]).map((v) => ({
                    valor: v,
                    label: ETIQUETA_ACTIVIDAD[v],
                  }))}
                  valor={form.actividad}
                  onChange={(actividad) => setForm({ ...form, actividad })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">Dieta</label>
                <SelectorChips
                  opciones={(Object.keys(ETIQUETA_DIETA) as Dieta[]).map((v) => ({ valor: v, label: ETIQUETA_DIETA[v] }))}
                  valor={form.dieta}
                  onChange={(dieta) => setForm({ ...form, dieta })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-tertiary)]">Preparación</label>
                <SelectorChips
                  opciones={[
                    { valor: 7 as Frecuencia, label: 'Cada 7 días' },
                    { valor: 15 as Frecuencia, label: 'Cada 15 días' },
                  ]}
                  valor={form.frecuencia}
                  onChange={(frecuencia) => setForm({ ...form, frecuencia })}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={guardarEdicion}
              disabled={guardando || !form.nombrePerro.trim()}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-white disabled:opacity-60 [touch-action:manipulation]"
            >
              <Check size={18} aria-hidden="true" /> Guardar cambios
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
