// Enlaces de baja firmados: solo quien recibió el correo puede darlo de baja, y nadie
// puede dar de baja a un tercero adivinando su dirección. HMAC-SHA256 sobre el correo.

import crypto from 'node:crypto';
import { SITE_URL } from './config';

function secret(): string {
  const s = process.env.EMAIL_SIGNING_SECRET;
  if (!s) throw new Error('FALTA EMAIL_SIGNING_SECRET — no se pueden firmar enlaces de baja.');
  return s;
}

export function firmarCorreo(email: string): string {
  return crypto.createHmac('sha256', secret()).update(email.trim().toLowerCase()).digest('hex');
}

export function firmaValida(email: string, firma: string): boolean {
  const esperada = Buffer.from(firmarCorreo(email), 'utf8');
  const recibida = Buffer.from(firma, 'utf8');
  if (esperada.length !== recibida.length) return false;
  return crypto.timingSafeEqual(esperada, recibida);
}

export function urlDeBaja(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${SITE_URL}/api/email/baja?e=${e}&t=${firmarCorreo(email)}`;
}
