-- Infraestructura de correos (comando /emails, 2026-09-25). Ver docs/emails/EMAILS.md.
-- Las 3 tablas son SOLO del servidor: RLS activo sin policies (solo service_role escribe).

-- email_log — un correo por (destinatario, tipo, referencia). La restricción única es
-- la idempotencia: Hotmart reenvía eventos y el cron corre a diario; el segundo intento
-- del mismo correo choca aquí y no se manda dos veces. Si el envío falla, la fila se
-- borra para que el próximo intento (cron) lo reintente.
create table public.email_log (
  id      bigserial primary key,
  email   text not null,
  kind    text not null,
  ref     text not null default '',
  sent_at timestamptz not null default now(),
  unique (email, kind, ref)
);

-- email_queue — envíos diferidos (ej. 2º correo de carrito abandonado a las 24 h).
create table public.email_queue (
  id           bigserial primary key,
  email        text not null,
  name         text,
  kind         text not null,
  ref          text not null default '',
  send_after   timestamptz not null,
  sent_at      timestamptz,
  cancelled_at timestamptz,
  unique (email, kind, ref)
);
create index email_queue_due_idx on public.email_queue (send_after)
  where sent_at is null and cancelled_at is null;

-- email_suppressions — bajas (marketing) y rebotes: nunca volver a escribirles.
create table public.email_suppressions (
  email      text primary key,
  reason     text not null default 'baja',
  created_at timestamptz not null default now()
);

alter table public.email_log enable row level security;
alter table public.email_queue enable row level security;
alter table public.email_suppressions enable row level security;
