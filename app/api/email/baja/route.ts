// Baja de correos de marketing (carrito abandonado). El enlace va firmado (HMAC) en
// cada correo; POST atiende el "un clic" de List-Unsubscribe-Post (Gmail/Yahoo, 2024).
// Ruta pública a propósito (PUBLIC_PATHS): la firma es su autenticación.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { firmaValida } from '@/lib/email/sign';

export const runtime = 'nodejs';

async function darDeBaja(request: NextRequest): Promise<'ok' | 'invalido' | 'error'> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('e')?.trim().toLowerCase();
  const firma = searchParams.get('t');
  try {
    if (!email || !firma || !firmaValida(email, firma)) return 'invalido';
    const admin = createAdminClient();
    await admin.from('email_suppressions').upsert({ email, reason: 'baja' }, { onConflict: 'email' });
    await admin
      .from('email_queue')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('email', email)
      .is('sent_at', null)
      .is('cancelled_at', null);
    return 'ok';
  } catch (e) {
    console.error('email: fallo la baja', { error: (e as Error).name });
    return 'error';
  }
}

function pagina(titulo: string, mensaje: string, status: number) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PawBites</title></head>
<body style="margin:0;background:#fbf6ef;font-family:Arial,Helvetica,sans-serif;color:#1b2a3d;">
<main style="max-width:420px;margin:0 auto;padding:64px 24px;text-align:center;">
<h1 style="font-size:24px;margin:0 0 12px;">${titulo}</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;">${mensaje}</p>
<a href="https://paw-bites.com" style="color:#c0431d;font-weight:700;">Ir a PawBites</a>
</main></body></html>`;
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
  const r = await darDeBaja(request);
  if (r === 'ok') return pagina('Listo, no te escribiremos más', 'Te dimos de baja de estos correos. Los avisos de tu cuenta y de tus pagos seguirán llegando, porque son parte del servicio.', 200);
  if (r === 'invalido') return pagina('Este enlace no es válido', 'Puede que esté incompleto. Si quieres darte de baja, responde a cualquiera de nuestros correos y lo hacemos por ti.', 400);
  return pagina('Algo salió mal', 'No pudimos procesar tu baja. Inténtalo de nuevo en unos minutos o responde a nuestro correo.', 500);
}

export async function POST(request: NextRequest) {
  const r = await darDeBaja(request);
  return NextResponse.json({ ok: r === 'ok' }, { status: r === 'ok' ? 200 : r === 'invalido' ? 400 : 500 });
}
