// Verificación del webhook de Hotmart — ver docs/sistema/18-VENTA-HOTMART.md
// "SEGURIDAD DEL WEBHOOK DE HOTMART". Camino principal: comparar el hottok
// recibido contra HOTMART_HOTTOK en tiempo constante, sobre HTTPS. Hotmart no
// firma el body con un HMAC propio — su modelo de autenticidad es este token
// compartido viajando por TLS.

import crypto from 'node:crypto';

// Fail-secure: si falta el secreto, el arranque revienta (nunca corre con un
// default inseguro de "modo prueba").
const HOTTOK = process.env.HOTMART_HOTTOK;
if (!HOTTOK) throw new Error('FALTA HOTMART_HOTTOK — el webhook no puede operar de forma segura');

/** Comparación en tiempo constante (anti timing-attack). timingSafeEqual exige
 * buffers de igual longitud, o lanza — por eso se compara la longitud primero. */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function verifyHotmart(opts: { hottok?: string }): boolean {
  if (!opts.hottok) return false;
  return timingSafeEqualStr(opts.hottok, HOTTOK!);
}
