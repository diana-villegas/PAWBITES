// Recibe el magic link de Supabase (?code=...), intercambia el código por una
// sesión real (cookies vía @supabase/ssr) y redirige a la app. Ruta pública —
// el middleware la deja pasar (lib/supabase/middleware.ts, PUBLIC_PATHS).

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const destino = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  // Enlace vencido, ya usado, o inválido — de vuelta al login con aviso honesto
  // (nunca fallar en silencio — checklist de cierre §9-SEGURIDAD).
  return NextResponse.redirect(`${origin}/entrar?error=enlace_invalido`);
}
