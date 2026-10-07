'use client';

// Shell de la app interna (Sesión 5) — 4 secciones fijas (03-PRINCIPIOS: 3-5 secciones,
// 1 protagonista por sección). Nav inferior siempre visible, shell a pantalla completa real.

import { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, House, ShoppingBasket, PawPrint } from 'lucide-react';

/** Migra el estado anónimo del onboarding (localStorage) a la cuenta real la
 * primera vez que alguien entra a /app ya logueado — 26-AUTH-MODERNO.md
 * § "USUARIO ANÓNIMO → CUENTA". Solo limpia localStorage si el servidor
 * confirma que guardó (o que ya existía) — si falla, se reintenta la próxima
 * vez que entre a la app. Después (con o sin migración) confirma que la
 * cuenta YA tiene un perro de verdad guardado — si no (cuenta creada a mano,
 * sin pasar por el cuestionario, como pasó con los 2 perfiles de prueba de
 * testimonios), manda al cuestionario en vez de dejar ver el ejemplo de
 * muestra sin que la persona sepa que no es su perro real. */
function useMigracionOnboarding() {
  const router = useRouter();

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const raw = (() => {
        try {
          return localStorage.getItem('pawbites_onboarding');
        } catch {
          return null;
        }
      })();

      if (raw) {
        try {
          const o = JSON.parse(raw);
          const res = await fetch('/api/onboarding/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombrePerro: o.nombrePerro,
              pesoKg: o.pesoKg,
              edad: o.edad,
              actividad: o.actividad,
              dieta: o.dieta,
              frecuencia: o.frecuencia,
              yaComeReal: !!o.yaComeReal,
            }),
          });
          if (res.ok && !cancelado) {
            localStorage.removeItem('pawbites_onboarding');
          }
        } catch {
          // Sin conexión — se reintenta en la próxima visita, sigue abajo
          // con la verificación igual (puede que ya tuviera perro de antes).
        }
      }

      if (cancelado) return;
      try {
        const chequeo = await fetch('/api/checkins');
        if (chequeo.status === 404 && !cancelado) {
          router.replace('/onboarding');
        }
      } catch {
        // Sin conexión — no se puede confirmar; se deja la pantalla seguir
        // con lo que ya tenga en el navegador en vez de bloquear por esto.
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [router]);
}

const DESTINOS = [
  { href: '/app', label: 'Hoy', icon: House },
  { href: '/app/plan', label: 'Plan', icon: CalendarDays },
  { href: '/app/lista', label: 'Lista', icon: ShoppingBasket },
  { href: '/app/perfil', label: 'Perfil', icon: PawPrint },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useMigracionOnboarding();
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background:
          'radial-gradient(640px 420px at 50% -8%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 62%), radial-gradient(520px 360px at 100% 100%, color-mix(in oklab, var(--cat-green) 9%, transparent), transparent 60%), var(--bg)',
      }}
    >
      <div className="flex-1 pb-24">{children}</div>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_oklab,var(--text-tertiary)_12%,transparent)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-sm items-stretch justify-between px-2">
          {DESTINOS.map((d) => {
            const activo = d.href === '/app' ? pathname === '/app' : pathname.startsWith(d.href);
            const Icono = d.icon;
            return (
              <Link
                key={d.href}
                href={d.href}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 [touch-action:manipulation]"
                aria-current={activo ? 'page' : undefined}
              >
                <span
                  className="flex size-9 items-center justify-center rounded-xl"
                  style={{ background: activo ? 'var(--chip-bg)' : 'transparent' }}
                >
                  <Icono
                    size={20}
                    color={activo ? 'var(--accent)' : 'var(--text-tertiary)'}
                    strokeWidth={activo ? 2.4 : 2}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={`text-xs ${activo ? 'font-semibold text-[var(--accent)]' : 'font-medium text-[var(--text-tertiary)]'}`}
                >
                  {d.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
