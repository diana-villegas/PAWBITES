-- Recordatorios por correo (plan diario, día de compras, aviso de peso) — ver
-- docs/sistema/58-RETENCION-DE-INGRESOS.md. Dos columnas nuevas en `profiles`:
--  - email_reminders_enabled: interruptor del usuario (Perfil → "Mi cuenta"),
--    prendido por defecto. El cliente ya puede escribir su propia fila (RLS
--    "update_own" de la migración 0001) — mismo patrón que el resto de edición
--    de cuenta, sin tocar esa policy.
--  - pending_plan: qué oferta (mensual/anual) eligió la persona al EMPEZAR la
--    prueba (antes del primer cobro) — se guarda en el webhook al recibir
--    SUBSCRIPTION_TRIAL_START, para que el aviso del día 6 diga el monto
--    exacto en vez de "mensual o anual". Null si no se pudo determinar
--    (evento viejo, oferta no reconocida) — el correo cae a un texto genérico.
alter table public.profiles
  add column email_reminders_enabled boolean not null default true,
  add column pending_plan text check (pending_plan in ('mensual', 'anual'));
