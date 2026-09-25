// Correo de acceso con enlace mágico. Lo usan el webhook (al comprar) y el cron
// (reintento si el primer envío falló — el bug caro: "pagó y no le llegó el acceso").

import type { SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from './config';
import { enviarCorreo, type EstadoEnvio } from './send';
import { plantillaAcceso } from './templates';

/** Enlace de un solo uso que entra a la app sin contraseña. Va por /auth/confirm
 * (token_hash) y no por el enlace directo de Supabase: funciona aunque el cliente abra
 * el correo en otro dispositivo distinto al que pidió el acceso. */
async function crearEnlaceAcceso(admin: SupabaseClient, email: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  const hashed = data?.properties?.hashed_token;
  if (error || !hashed) {
    console.error('email: no se pudo generar el enlace de acceso', { code: error?.code });
    return null;
  }
  return `${SITE_URL}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=email`;
}

export async function enviarAcceso(admin: SupabaseClient, email: string, nombre?: string | null): Promise<EstadoEnvio> {
  const to = email.trim().toLowerCase();

  // Si ya se mandó, NO generar otro enlace: cada enlace nuevo invalida el anterior, y
  // el cliente podría estar por tocar el que ya le llegó.
  const { data: ya } = await admin.from('email_log').select('id').eq('email', to).eq('kind', 'acceso').eq('ref', '').maybeSingle();
  if (ya) return 'duplicate';

  // Sin enlace directo, el correo igual sale: manda a /entrar (pide otro enlace ahí).
  const enlace = (await crearEnlaceAcceso(admin, to)) ?? `${SITE_URL}/entrar`;
  return enviarCorreo({ to, kind: 'acceso', plantilla: plantillaAcceso({ nombre, enlace }) });
}
