// Envío por Resend (API REST, sin SDK). Patrón "reservar y luego enviar":
//  1) se inserta la fila en email_log (clave única = destinatario+tipo+ref) — si ya
//     existe, otro proceso ya lo mandó y no se repite (Hotmart reenvía eventos, el cron
//     corre a diario);
//  2) se llama a Resend;
//  3) si Resend falla, la fila se borra para que el siguiente intento (cron) lo reintente.
// Nunca lanza: devuelve un estado, así un correo caído no rompe el webhook de pagos.

import { createAdminClient } from '@/lib/supabase/admin';
import { MARKETING_FROM, MARKETING_KINDS, REPLY_TO, TRANSACTIONAL_FROM, type EmailKind } from './config';
import { urlDeBaja } from './sign';
import type { Plantilla } from './templates';

export type EstadoEnvio = 'sent' | 'duplicate' | 'suppressed' | 'failed' | 'disabled';

export async function enviarCorreo(opts: {
  to: string;
  kind: EmailKind;
  ref?: string;
  plantilla: Plantilla;
}): Promise<EstadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('email: RESEND_API_KEY no configurada — correo no enviado', { kind: opts.kind });
    return 'disabled';
  }

  const to = opts.to.trim().toLowerCase();
  const ref = opts.ref ?? '';
  const esMarketing = MARKETING_KINDS.has(opts.kind);
  const admin = createAdminClient();

  if (esMarketing) {
    const { data: baja } = await admin.from('email_suppressions').select('email').eq('email', to).maybeSingle();
    if (baja) return 'suppressed';
  }

  const { error: claimErr } = await admin.from('email_log').insert({ email: to, kind: opts.kind, ref });
  if (claimErr) {
    if (claimErr.code === '23505') return 'duplicate';
    console.error('email: no se pudo reservar el envío', { kind: opts.kind, code: claimErr.code });
    return 'failed';
  }

  try {
    const headers: Record<string, string> = {};
    if (esMarketing) {
      headers['List-Unsubscribe'] = `<${urlDeBaja(to)}>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `${opts.kind}:${to}:${ref}`,
      },
      body: JSON.stringify({
        from: esMarketing ? MARKETING_FROM : TRANSACTIONAL_FROM,
        to: [to],
        reply_to: REPLY_TO,
        subject: opts.plantilla.subject,
        html: opts.plantilla.html,
        text: opts.plantilla.text,
        headers,
        tags: [{ name: 'kind', value: opts.kind }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('email: Resend rechazó el envío', { kind: opts.kind, status: res.status });
      await admin.from('email_log').delete().eq('email', to).eq('kind', opts.kind).eq('ref', ref);
      return 'failed';
    }
    return 'sent';
  } catch (e) {
    console.error('email: falló la llamada a Resend', { kind: opts.kind, error: (e as Error).name });
    await admin.from('email_log').delete().eq('email', to).eq('kind', opts.kind).eq('ref', ref);
    return 'failed';
  }
}
