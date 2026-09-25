# Correos de PawBites — inventario y operación

Remitente: `PawBites <acceso@tx.paw-bites.com>` (Resend, dominio `tx.paw-bites.com`). Respuestas a `hola@paw-bites.com`.
Código: `lib/email/*` (envío, plantillas, firma), `app/api/webhooks/hotmart` (disparo por evento),
`app/api/cron/emails` (diario, 14:00 UTC), `app/api/email/baja` (baja con un clic), `app/auth/confirm` (enlace mágico).
Tablas: `email_log` (candado anti-duplicado), `email_queue` (envíos diferidos), `email_suppressions` (bajas).

| Correo | Cuándo sale | Tipo | Asunto A (activo) | Asunto B (listo para probar) |
|---|---|---|---|---|
| Acceso | Al llegar la compra (o inicio de prueba); el cron lo reintenta 3 días | Transaccional | Tu acceso a PawBites ya está listo | Entra y ve el plato exacto de tu perro |
| Enlace de login (Supabase) | Cuando alguien pide entrar en /entrar | Transaccional | Tu enlace para entrar a PawBites | — |
| Carrito abandonado 1 | Al llegar el evento "abandono de carrito" | Marketing (con baja) | ¿Te quedó alguna duda sobre PawBites? | Tu plato en gramos exactos sigue esperándote |
| Carrito abandonado 2 | 24 h después, si no compró | Marketing (con baja) | Lo que pasa si sigues calculando a ojo | Una pregunta rápida sobre tu perro |
| Pago fallido | Evento "Compra atrasada" | Transaccional | Tu pago no se pudo procesar: tu acceso sigue activo | Un detalle con tu pago de PawBites |
| Cancelación | Evento "Cancelación de suscripción" | Transaccional | Cancelaste PawBites: esto es lo que pasa ahora | Listo, cancelamos tu suscripción |
| Prueba día 3 | 3 días después de crearse la cuenta | Activación | {perro}: ya van 3 días | ¿Ya armaste tu lista del súper? |
| Prueba día 6 | 6 días después: aviso antes del cobro | Transaccional | Mañana termina tu prueba de PawBites | Tu prueba termina mañana: esto es lo que pasa |

Fuera de alcance por decisión del usuario (2026-09-25): nurturing de lead magnet y win-back automático a 30/60/90 días.

## Supuestos SIN verificar (cerrar con la primera compra de prueba real)
- Evento de abandono de carrito: `PURCHASE_OUT_OF_SHOPPING_CART` (nombre estándar del webhook v2 de Hotmart; hay que activar
  "Abandono de carrito" en el panel y confirmar el JSON: campos `data.buyer.email/name`).
- Evento de inicio de prueba (ya anotado en ESTADO.md). Los días D3/D6 se cuentan desde `profiles.created_at`, no del evento.
- Enlace mágico por correo abierto en un escáner (Apple Mail Privacy, antivirus) puede consumirse antes que la persona:
  por eso todo correo de acceso dice "si no abre, entra a /entrar" y ahí se pide otro al instante.

## Qué mirar cada mes (operación)
- Resend → Emails: tasa de entrega y rebotes (meta: rebotes < 2 %, quejas < 0,1 %).
- Acceso: cuántos `acceso` salieron vs. cuentas creadas (deben ser iguales; si no, mirar el cron).
- Carrito: `carrito_1` enviados vs. compras de esas personas (recuperación) y bajas en `email_suppressions`.
- Pagos: `pago_fallido` enviados vs. quiénes siguieron activos (rescate de dunning).
- Google Postmaster Tools sobre `tx.paw-bites.com` cuando haya volumen.

## Plantilla del enlace de login de Supabase
Archivo `docs/emails/supabase-magic-link.html` → Supabase → Authentication → Emails → Templates → "Magic Link".
Asunto: `Tu enlace para entrar a PawBites`. Requiere Site URL = `https://www.paw-bites.com`.
