-- leads_plato — correos de "envíame el plato" desde el paywall ("Ahora no" →
-- correo en vez de salir sin dejar rastro). SOLO del servidor: RLS activo sin
-- policies (igual patrón que email_log/email_queue/email_suppressions,
-- migración 0006) — nadie puede leerla desde el navegador, solo el admin client.
create table public.leads_plato (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  nombre_perro  text not null,
  peso_kg       numeric not null,
  edad          text not null,
  actividad     text not null,
  dieta         text not null,
  frecuencia    smallint not null,
  plato         jsonb not null,
  created_at    timestamptz not null default now()
);

alter table public.leads_plato enable row level security;
