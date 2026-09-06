// Refresco de sesión Supabase en el middleware — sin esto "el usuario se
// desloguea solo" (los Server Components no pueden escribir cookies).
// Patrón canónico de docs/sistema/26-AUTH-MODERNO.md — copiado tal cual.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas públicas del funnel (modelo onboarding-first anónimo — 02C): el usuario
// recorre / → /onboarding → /paywall → /entrar SIN sesión. Redirigir a /entrar a
// todo anónimo rompería el funnel de venta completo. Solo /app exige sesión.
const PUBLIC_PATHS = ['/', '/onboarding', '/entrar', '/auth', '/terminos', '/privacidad', '/reembolsos', '/aviso-nutricional'];

function esRutaPublica(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || (p !== '/' && path.startsWith(p + '/')));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // IMPORTANTE: nada de lógica entre createServerClient y getUser(). getUser()
  // valida el JWT contra Supabase y dispara el refresh si el token expiró.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && !esRutaPublica(path)) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    return NextResponse.redirect(url);
  }

  // Devolver supabaseResponse TAL CUAL (contiene las cookies refrescadas) — si no,
  // el usuario queda deslogueado aleatoriamente.
  return supabaseResponse;
}
