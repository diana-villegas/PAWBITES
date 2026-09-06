'use client';

// ONBOARDING de PawBites — app tipo "utilidad de valor obvio" (02B): preguntas
// que SÍ cambian el cálculo real del plato, sin inflar el recorrido. Termina en
// el loading que arma el plan y en el paywall (mismo flujo, sin recarga — C0).
// Fuente del copy: FICHA-AVATAR.md (dolor #1: miedo a calcular mal · el insight
// de espacio de congelador que aportó la propia usuaria del proyecto).

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PawPrint, Dog, Moon, Footprints, Zap, Drumstick, Package, Boxes, Sparkles, ChefHat, Weight } from 'lucide-react';
import { FunnelHeader, PantallaFunnel, ChipOpcion, CtaFunnel, VARIANTES_PASO } from '@/components/onboarding/ui';
import {
  calcularPlato,
  ETIQUETA_ACTIVIDAD,
  ETIQUETA_EDAD,
  type Actividad,
  type Dieta,
  type Edad,
  type Frecuencia,
} from '@/lib/plato';
import { LoadingPlan } from '@/components/onboarding/LoadingPlan';
import { Paywall } from '@/components/onboarding/Paywall';
import { IngredientesBand } from '@/components/landing/PlatoMockup';

type Paso =
  | 'nombre'
  | 'peso'
  | 'edad'
  | 'reconocimiento'
  | 'actividad'
  | 'dieta'
  | 'frecuencia'
  | 'loading'
  | 'paywall';

const ICONO_ACTIVIDAD: Record<Actividad, typeof Moon> = {
  bajo: Moon,
  moderado: Footprints,
  alto: Zap,
};

const ICONO_EDAD: Record<Edad, typeof Moon> = {
  cachorro: Sparkles,
  adulto: PawPrint,
  senior: Moon,
};

function tamanoPorPeso(kg: number): string {
  if (kg < 10) return 'Raza pequeña';
  if (kg < 25) return 'Raza mediana';
  if (kg < 40) return 'Raza grande';
  return 'Raza gigante';
}

/** Reemplaza el watermark decorativo en las 4 pantallas de pregunta única: en vez de
 * un ícono sin función, este espacio muestra el "perfil en construcción" del perro —
 * cada respuesta ya dada se queda visible y crece con la siguiente (inversión
 * acumulada real, no relleno). Feedback directo del revisor-visual ronda 5. */
function PerfilAcumulado({
  nombrePerro,
  pesoKg,
  edad,
  actividad,
  dieta,
}: {
  nombrePerro: string;
  pesoKg: number;
  edad?: Edad | null;
  actividad?: Actividad | null;
  dieta?: Dieta | null;
}) {
  const filas: { key: string; icon: typeof Dog; texto: string }[] = [
    { key: 'base', icon: Weight, texto: `${nombrePerro || 'Tu perro'} · ${pesoKg} kg · ${tamanoPorPeso(pesoKg)}` },
  ];
  if (edad) filas.push({ key: 'edad', icon: ICONO_EDAD[edad], texto: ETIQUETA_EDAD[edad] });
  if (actividad) filas.push({ key: 'actividad', icon: ICONO_ACTIVIDAD[actividad], texto: ETIQUETA_ACTIVIDAD[actividad] });
  if (dieta) {
    filas.push({
      key: 'dieta',
      icon: dieta === 'barf' ? Drumstick : ChefHat,
      texto: dieta === 'barf' ? 'Dieta cruda' : 'Cocinada en casa',
    });
  }

  return (
    <div className="mt-2">
      <div className="rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_6%,var(--bg))] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
          Su perfil se está armando
        </p>
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filas.map((f, i) => {
              const Icono = f.icon;
              const esNueva = i === filas.length - 1 && filas.length > 1;
              return (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: esNueva ? 0.05 : 0, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: esNueva ? 'var(--chip-bg)' : 'var(--surface)' }}
                    aria-hidden="true"
                  >
                    <Icono size={15} color={esNueva ? 'var(--accent)' : 'var(--text-tertiary)'} aria-hidden="true" />
                  </span>
                  <span
                    className={`text-sm ${esNueva ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}
                  >
                    {f.texto}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const ORDEN: Paso[] =['nombre', 'peso', 'edad', 'reconocimiento', 'actividad', 'dieta', 'frecuencia', 'loading', 'paywall'];
// El progreso solo cuenta los pasos con pregunta real (el reconocimiento y el loading no son "preguntas")
const PASOS_CON_PROGRESO: Paso[] = ['nombre', 'peso', 'edad', 'actividad', 'dieta', 'frecuencia'];

export default function OnboardingPage() {
  const [pasoIdx, setPasoIdx] = useState(0);
  const [direccion, setDireccion] = useState<1 | -1>(1);
  const reduce = useReducedMotion();

  const [nombrePerro, setNombrePerro] = useState('');
  const [pesoKg, setPesoKg] = useState(15);
  const [edad, setEdad] = useState<Edad | null>(null);
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [frecuencia, setFrecuencia] = useState<Frecuencia | null>(null);

  const paso = ORDEN[pasoIdx];
  const idxProgreso = PASOS_CON_PROGRESO.indexOf(paso);
  const pct = idxProgreso >= 0 ? Math.round(((idxProgreso + 1) / PASOS_CON_PROGRESO.length) * 100) : 100;

  const plato = useMemo(() => {
    if (!edad || !actividad || !dieta) return null;
    return calcularPlato({ pesoKg, edad, actividad, dieta });
  }, [pesoKg, edad, actividad, dieta]);

  const [seleccionando, setSeleccionando] = useState(false);

  function avanzar() {
    setDireccion(1);
    setSeleccionando(false);
    setPasoIdx((i) => Math.min(i + 1, ORDEN.length - 1));
  }
  function retroceder() {
    setDireccion(-1);
    setPasoIdx((i) => Math.max(i - 1, 0));
  }
  /** Bloquea taps repetidos durante la pausa de auto-avance (regla A3 de 50-DISENO). */
  function elegirYAvanzar<T>(setter: (v: T) => void, valor: T, delay = 320) {
    if (seleccionando) return;
    setSeleccionando(true);
    setter(valor);
    window.setTimeout(avanzar, reduce ? 0 : delay);
  }

  return (
    <main
      className="flex min-h-dvh flex-col"
      style={{
        background:
          'radial-gradient(640px 420px at 50% -8%, color-mix(in oklab, var(--accent) 15%, transparent), transparent 62%), radial-gradient(520px 360px at 100% 100%, color-mix(in oklab, var(--cat-green) 8%, transparent), transparent 60%), var(--bg)',
      }}
    >
      {paso !== 'loading' && paso !== 'paywall' && (
        <FunnelHeader pct={pct} onBack={pasoIdx > 0 ? retroceder : undefined} />
      )}

      <AnimatePresence mode="wait" custom={direccion}>
        <motion.div
          key={paso}
          custom={direccion}
          variants={VARIANTES_PASO}
          initial="entra"
          animate="centro"
          exit="sale"
          transition={{ duration: reduce ? 0.15 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-1 flex-col"
        >
          {paso === 'nombre' && (
            <PantallaFunnel>
              <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                ¿Cómo se llama tu perro?
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Vamos a armarle su plato exacto, con su nombre.
              </p>
              <form
                className="mt-8 flex flex-1 flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nombrePerro.trim()) avanzar();
                }}
              >
                <input
                  autoFocus
                  value={nombrePerro}
                  onChange={(e) => setNombrePerro(e.target.value)}
                  placeholder="Ej. Luna"
                  className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
                <div className="flex flex-1 items-center justify-center" aria-hidden="true">
                  <PawPrint size={96} strokeWidth={1.2} color="var(--surface-2)" />
                </div>
                <div className="pt-4">
                  <CtaFunnel type="submit" disabled={!nombrePerro.trim()}>
                    Continuar
                  </CtaFunnel>
                </div>
              </form>
            </PantallaFunnel>
          )}

          {paso === 'peso' && (
            <PantallaFunnel>
              <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                ¿Cuánto pesa {nombrePerro || 'tu perro'}?
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Es el dato que más cambia su plato.</p>
              <div className="mt-10 flex flex-col items-center">
                <p className="text-xs font-semibold text-[var(--text-tertiary)]">KILOGRAMOS</p>
                <motion.p
                  key={pesoKg}
                  initial={reduce ? false : { scale: 1.14 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-1 text-5xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]"
                >
                  {pesoKg}
                </motion.p>
                <input
                  type="range"
                  min={1}
                  max={80}
                  step={1}
                  value={pesoKg}
                  onChange={(e) => setPesoKg(Number(e.target.value))}
                  className="mt-8 w-full accent-[var(--accent)]"
                  aria-label="Peso en kilogramos"
                />
                <div className="mt-1 flex w-full justify-between text-xs text-[var(--text-tertiary)]">
                  <span>1 kg</span>
                  <span>80 kg</span>
                </div>
                <p className="mt-6 rounded-full bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
                  {tamanoPorPeso(pesoKg)}
                </p>
              </div>
              <div className="flex flex-1 items-end justify-center pb-8" aria-hidden="true">
                <PawPrint size={80} strokeWidth={1.2} color="var(--surface-2)" />
              </div>
              <div>
                <CtaFunnel onClick={avanzar}>Fijar el peso de {nombrePerro || 'mi perro'}</CtaFunnel>
              </div>
            </PantallaFunnel>
          )}

          {paso === 'edad' && (
            <PantallaFunnel>
              <div className="flex flex-1 flex-col gap-6 pt-8 pb-6">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                    ¿Qué edad tiene {nombrePerro || 'tu perro'}?
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Los cachorros y los senior comen distinto.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {(Object.keys(ETIQUETA_EDAD) as Edad[]).map((e, i) => (
                    <ChipOpcion
                      key={e}
                      index={i}
                      label={ETIQUETA_EDAD[e]}
                      seleccionado={edad === e}
                      deshabilitado={seleccionando}
                      onClick={() => elegirYAvanzar(setEdad, e)}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-[var(--text-tertiary)]">Toca una opción para continuar</p>
                <PerfilAcumulado nombrePerro={nombrePerro} pesoKg={pesoKg} />
                <IngredientesBand titulo="Así se ve el plato exacto" />
              </div>
            </PantallaFunnel>
          )}

          {paso === 'reconocimiento' && (
            <PantallaFunnel>
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span
                  className="mb-5 flex size-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--chip-bg)' }}
                  aria-hidden="true"
                >
                  <PawPrint size={30} color="var(--accent)" aria-hidden="true" />
                </span>
                <h1 className="text-balance text-2xl font-bold leading-[1.2] text-[var(--text-primary)] [font-family:var(--font-display)]">
                  No es que te falte disciplina
                </h1>
                <p className="mt-4 max-w-xs text-[16px] leading-relaxed text-[var(--text-secondary)]">
                  Las calculadoras que existen son para expertos en nutrición — por eso las dejaste a la
                  mitad. El <strong className="text-[var(--text-primary)]">Plato Exacto</strong> hace el
                  cálculo por ti: solo necesita lo que ya sabes de {nombrePerro || 'tu perro'}.
                </p>
              </div>
              <div className="pt-8">
                <CtaFunnel onClick={avanzar}>Continuar</CtaFunnel>
              </div>
            </PantallaFunnel>
          )}

          {paso === 'actividad' && (
            <PantallaFunnel>
              <div className="flex flex-1 flex-col gap-6 pt-8 pb-6">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                    ¿Qué tan activo es {nombrePerro || 'tu perro'}?
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Esto ajusta la cantidad total del plato.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {(Object.keys(ETIQUETA_ACTIVIDAD) as Actividad[]).map((a, i) => {
                    const IconoActividad = ICONO_ACTIVIDAD[a];
                    return (
                      <ChipOpcion
                        key={a}
                        index={i}
                        icon={<IconoActividad size={20} color="var(--text-secondary)" aria-hidden="true" />}
                        label={ETIQUETA_ACTIVIDAD[a]}
                        seleccionado={actividad === a}
                        deshabilitado={seleccionando}
                        onClick={() => elegirYAvanzar(setActividad, a)}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-xs text-[var(--text-tertiary)]">Toca una opción para continuar</p>
                <PerfilAcumulado nombrePerro={nombrePerro} pesoKg={pesoKg} edad={edad} />
                <IngredientesBand titulo="Así se ve el plato exacto" />
              </div>
            </PantallaFunnel>
          )}

          {paso === 'dieta' && (
            <PantallaFunnel>
              <div className="flex flex-1 flex-col gap-6 pt-8 pb-6">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                    ¿Cruda o cocinada?
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Elige el tipo de comida real que le darás.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <ChipOpcion
                    index={0}
                    icon={<Drumstick size={20} color="var(--text-secondary)" aria-hidden="true" />}
                    label="Cruda (carne sin cocinar)"
                    seleccionado={dieta === 'barf'}
                    deshabilitado={seleccionando}
                    onClick={() => elegirYAvanzar(setDieta, 'barf' as Dieta)}
                  />
                  <ChipOpcion
                    index={1}
                    icon={<ChefHat size={20} color="var(--text-secondary)" aria-hidden="true" />}
                    label="Cocinada en casa"
                    seleccionado={dieta === 'cocinada'}
                    deshabilitado={seleccionando}
                    onClick={() => elegirYAvanzar(setDieta, 'cocinada' as Dieta)}
                  />
                </div>
                <p className="text-center text-xs text-[var(--text-tertiary)]">Toca una opción para continuar</p>
                <PerfilAcumulado nombrePerro={nombrePerro} pesoKg={pesoKg} edad={edad} actividad={actividad} />
              </div>
            </PantallaFunnel>
          )}

          {paso === 'frecuencia' && (
            <PantallaFunnel>
              <div className="flex flex-1 flex-col gap-6 pt-8 pb-6">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)]">
                    ¿Cada cuánto vas a preparar su comida?
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Elige según el espacio que tengas en tu congelador.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                <ChipOpcion
                  index={0}
                  icon={<Package size={20} color="var(--text-secondary)" aria-hidden="true" />}
                  label="Cada 7 días — menos espacio"
                  seleccionado={frecuencia === 7}
                  deshabilitado={seleccionando}
                  onClick={() => elegirYAvanzar(setFrecuencia, 7 as Frecuencia)}
                />
                <ChipOpcion
                  index={1}
                  icon={<Boxes size={20} color="var(--text-secondary)" aria-hidden="true" />}
                  label="Cada 15 días — menos viajes"
                  seleccionado={frecuencia === 15}
                  deshabilitado={seleccionando}
                  onClick={() => elegirYAvanzar(setFrecuencia, 15 as Frecuencia, 500)}
                />
                </div>
                <p className="text-center text-xs text-[var(--text-tertiary)]">Toca una opción para continuar</p>
                <PerfilAcumulado nombrePerro={nombrePerro} pesoKg={pesoKg} edad={edad} actividad={actividad} dieta={dieta} />
              </div>
            </PantallaFunnel>
          )}

          {paso === 'loading' && plato && (
            <LoadingPlan
              nombrePerro={nombrePerro || 'tu perro'}
              edad={edad!}
              actividad={actividad!}
              onListo={avanzar}
            />
          )}

          {paso === 'paywall' && plato && (
            <Paywall nombrePerro={nombrePerro || 'tu perro'} pesoKg={pesoKg} plato={plato} frecuencia={frecuencia ?? 7} />
          )}
        </motion.div>
      </AnimatePresence>

      {(paso === 'nombre' || paso === 'peso' || paso === 'edad' || paso === 'actividad' || paso === 'dieta' || paso === 'frecuencia') && (
        <p className="pb-4 text-center text-xs text-[var(--text-tertiary)]">
          <Sparkles size={11} className="mr-1 inline" aria-hidden="true" />
          Guía general para perros sanos — no reemplaza a tu veterinario
        </p>
      )}
    </main>
  );
}
