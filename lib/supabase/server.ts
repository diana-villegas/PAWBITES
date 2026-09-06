// Cliente de Supabase para Server Components / Route Handlers — usa las cookies
// de la request (sesión del usuario). NUNCA reusar entre requests (crear uno
// nuevo por invocación — así lo pide @supabase/ssr).

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Un Server Component no puede escribir cookies (solo Server Actions/Route
            // Handlers pueden) — se ignora aquí porque el middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}
