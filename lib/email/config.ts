// Constantes de correo. Un solo sitio para remitentes y URL pública.
// Resend plan gratis = 1 dominio verificado: todo sale de tx.paw-bites.com. Cuando
// se pase a un plan con más dominios, mover MARKETING_FROM a news.paw-bites.com
// (docs/sistema/46-EMAIL-DELIVERABILITY.md: transaccional y marketing separados).

export const SITE_URL = 'https://paw-bites.com';

export const TRANSACTIONAL_FROM = 'PawBites <acceso@tx.paw-bites.com>';
export const MARKETING_FROM = 'PawBites <hola@tx.paw-bites.com>';

// Las respuestas llegan a un buzón real (Namecheap Email Forwarding → correo del dueño).
export const REPLY_TO = 'hola@paw-bites.com';

export type EmailKind =
  | 'acceso'
  | 'carrito_1'
  | 'carrito_2'
  | 'pago_fallido'
  | 'cancelacion'
  | 'trial_d3'
  | 'trial_d6';

/** Correos de marketing: llevan enlace de baja, cabecera List-Unsubscribe y respetan
 * la lista de bajas. Los transaccionales (acceso, pagos, aviso de cobro) no. */
export const MARKETING_KINDS: ReadonlySet<EmailKind> = new Set<EmailKind>(['carrito_1', 'carrito_2']);
