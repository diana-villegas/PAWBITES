// Baja SOLO de los recordatorios (plan diario / día de compras / actualizar
// peso) — apaga el mismo interruptor que "Recibir recordatorios por correo"
// en Perfil, no la lista global de marketing (son cosas distintas: ver
// lib/email/sign.ts urlDeBajaRecordatorios). Enlace firmado (HMAC), ruta
// pública a propósito (PUBLIC_PATHS ya cubre /api/email).

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { firmaValida } from '@/lib/email/sign';

export const runtime = 'nodejs';

async function apagarRecordatorios(request: NextRequest): Promise<'ok' | 'invalido' | 'error'> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('e')?.trim().toLowerCase();
  const firma = searchParams.get('t');
  try {
    if (!email || !firma || !firmaValida(email, firma)) return 'invalido';
    const admin = createAdminClient();
    await admin.from('profiles').update({ email_reminders_enabled: false }).eq('email', email);
    return 'ok';
  } catch (e) {
    console.error('email: fallo la baja de recordatorios', { error: (e as Error).name });
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
  const r = await apagarRecordatorios(request);
  if (r === 'ok') {
    return pagina(
      'Listo, apagamos tus recordatorios',
      'No te vamos a escribir más con el día a día de tu plan, el aviso de compras ni el de actualizar el peso. Puedes volver a prenderlos cuando quieras desde "Mi cuenta" en Perfil.',
      200
    );
  }
  if (r === 'invalido') return pagina('Este enlace no es válido', 'Puede que esté incompleto. Puedes apagar los recordatorios desde "Mi cuenta" en Perfil.', 400);
  return pagina('Algo salió mal', 'No pudimos procesar el cambio. Inténtalo de nuevo en unos minutos o apágalo desde Perfil.', 500);
}

export async function POST(request: NextRequest) {
  const r = await apagarRecordatorios(request);
  return NextResponse.json({ ok: r === 'ok' }, { status: r === 'ok' ? 200 : r === 'invalido' ? 400 : 500 });
}
