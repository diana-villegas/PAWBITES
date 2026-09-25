// Confirma un enlace de acceso por token_hash (el que va en el correo de bienvenida
// y en la plantilla de "enlace mágico" de Supabase). A diferencia de /auth/callback
// (PKCE, exige abrirlo en el mismo navegador que pidió el acceso), este funciona
// desde cualquier dispositivo. Ruta pública (PUBLIC_PATHS cubre /auth).
//
// El tipo con el que se verifica depende de cómo nació el token: el enlace de una cuenta
// YA existente (signInWithOtp / generateLink) es 'magiclink'; el de una cuenta que se
// confirma por primera vez es 'email'. Como el correo no puede saberlo de antemano, se
// prueba el tipo que trae el enlace y, si el token "no se encuentra", el otro.

import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const TIPOS_PERMITIDOS: readonly EmailOtpType[] = ['magiclink', 'email'];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type');
  const destinoCrudo = searchParams.get('next');
  // Solo una ruta relativa propia (nunca "//host" ni una URL completa).
  const destino = destinoCrudo && destinoCrudo.startsWith('/') && !destinoCrudo.startsWith('//') ? destinoCrudo : '/app';

  let motivo = 'sin_token';
  if (tokenHash) {
    const supabase = await createClient();
    // El tipo pedido primero (si es válido), luego el resto, sin repetir.
    const orden = [
      ...TIPOS_PERMITIDOS.filter((t) => t === tipo),
      ...TIPOS_PERMITIDOS.filter((t) => t !== tipo),
    ];
    for (const type of orden) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) {
        return NextResponse.redirect(`${origin}${destino}`);
      }
      motivo = error.code ?? 'verificacion_fallida';
      // Solo tiene sentido probar el otro tipo si el token "no se encontró".
      if (motivo !== 'otp_expired') break;
    }
    console.error('auth/confirm: enlace rechazado', { motivo });
  }

  // El motivo es solo un código (nunca el token) — sirve para diagnosticar sin logs.
  return NextResponse.redirect(`${origin}/entrar?error=enlace_invalido&motivo=${encodeURIComponent(motivo)}`);
}
