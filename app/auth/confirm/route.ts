// Confirma un enlace de acceso por token_hash (el que va en el correo de bienvenida
// y en la plantilla de "enlace mágico" de Supabase). A diferencia de /auth/callback
// (PKCE, exige abrirlo en el mismo navegador que pidió el acceso), este funciona
// desde cualquier dispositivo. Ruta pública (PUBLIC_PATHS cubre /auth).

import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const TIPOS_PERMITIDOS: ReadonlySet<string> = new Set(['email', 'magiclink']);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type');
  const destinoCrudo = searchParams.get('next');
  // Solo una ruta relativa propia (nunca "//host" ni una URL completa).
  const destino = destinoCrudo && destinoCrudo.startsWith('/') && !destinoCrudo.startsWith('//') ? destinoCrudo : '/app';

  if (tokenHash && tipo && TIPOS_PERMITIDOS.has(tipo)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo as EmailOtpType });
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=enlace_invalido`);
}
