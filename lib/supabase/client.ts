// Cliente de Supabase para el navegador — clave publishable (pública por diseño,
// la protección real es RLS). Usar en Client Components ('use client').
// Ver docs/sistema/51-STACK-PINEADO.md §5 (nomenclatura nueva de claves).

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
