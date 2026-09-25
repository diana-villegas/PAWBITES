-- Infraestructura para el webhook de Hotmart (Sesión 6, conexión de venta real).
-- Ver docs/sistema/18-VENTA-HOTMART.md — patrón de idempotencia + FSM server-side.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — columnas para reconciliar con Hotmart (matching por
-- subscriber_code cuando existe, y para registrar la oferta/plan real).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column hotmart_subscriber_code text unique,
  add column first_paid_at timestamptz;
alter table public.profiles add constraint profiles_email_key unique (email);

-- ─────────────────────────────────────────────────────────────────────────
-- processed_events — idempotencia: Hotmart REENVÍA eventos si el ACK se
-- pierde o el endpoint tarda. El segundo insert del mismo event_id falla.
-- ─────────────────────────────────────────────────────────────────────────
create table public.processed_events (
  event_id     text primary key,
  event_type   text not null,
  payload_hash text,
  processed_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- webhook_log — TODO intento (éxito y fallo), para poder ver en el futuro
-- backoffice si el webhook está sano o si algo se está rechazando.
-- ─────────────────────────────────────────────────────────────────────────
create table public.webhook_log (
  id          bigserial primary key,
  event_id    text,
  type        text,
  result      text not null check (result in ('applied', 'duplicate', 'illegal', 'unauthorized', 'error')),
  received_at timestamptz not null default now()
);
create index webhook_log_received_idx on public.webhook_log (received_at desc);
create index webhook_log_result_idx on public.webhook_log (result, received_at desc);

alter table public.processed_events enable row level security;
alter table public.webhook_log enable row level security;
-- Sin policies: ni anon ni authenticated pueden leer/escribir estas tablas.
-- Solo el service_role (que Postgres RLS no restringe) las toca, desde el webhook.

-- ─────────────────────────────────────────────────────────────────────────
-- apply_hotmart_event — la transacción atómica: idempotencia + cambio de
-- plan en una sola operación. Adaptada al esquema REAL de este proyecto
-- (profiles.plan ∈ {trial, mensual, anual, cancelado}, no al enum genérico
-- de status del archivo 18 — este proyecto no separa status de plan).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.apply_hotmart_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_email text,
  p_subscriber_code text,
  p_new_plan text,          -- 'trial' | 'mensual' | 'anual' | 'cancelado' | null (null = no cambia plan)
  p_trial_ends_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_current_plan text;
  v_profile_id uuid;
begin
  -- (a) IDEMPOTENCIA: si el event_id ya existe, salir sin tocar nada más.
  begin
    insert into public.processed_events (event_id, event_type, payload_hash)
    values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;

  -- (b) Resolver el perfil actual: primero por subscriber_code (más fiable
  --     tras la primera compra), si no por email.
  select id, plan into v_profile_id, v_current_plan
  from public.profiles
  where (p_subscriber_code is not null and hotmart_subscriber_code = p_subscriber_code)
     or (email = p_email)
  limit 1;

  if v_profile_id is null then
    -- No existe todavía ningún auth.users con este email — el handler debe
    -- crear la cuenta de auth ANTES de llamar a esta función (el trigger
    -- handle_new_user() crea la fila de profiles automáticamente al nacer
    -- el auth.users). Si llegamos aquí sin perfil, es una condición de
    -- carrera o un evento sin cuenta creada todavía: se marca aplicado a
    -- nivel de dedupe, pero sin cambio de plan (el handler decide si
    -- reintentar tras crear la cuenta).
    return jsonb_build_object('status', 'no_profile');
  end if;

  -- (c) TRANSICIÓN LEGAL: no resucitar una cuenta cancelada/reembolsada con
  --     un evento de acceso reentregado y más viejo que la cancelación.
  if v_current_plan = 'cancelado' and p_new_plan in ('trial', 'mensual', 'anual') then
    return jsonb_build_object('status', 'illegal_transition', 'from', v_current_plan);
  end if;

  -- (d) Aplicar el cambio de plan (si el evento trae uno) + subscriber_code
  --     + first_paid_at (solo la primera vez que llega un cobro real).
  update public.profiles set
    plan = coalesce(p_new_plan, plan),
    hotmart_subscriber_code = coalesce(p_subscriber_code, hotmart_subscriber_code),
    trial_ends_at = coalesce(p_trial_ends_at, trial_ends_at),
    first_paid_at = case
      when first_paid_at is null and p_new_plan in ('mensual', 'anual') then now()
      else first_paid_at
    end
  where id = v_profile_id;

  return jsonb_build_object('status', 'applied', 'profile_id', v_profile_id, 'new_plan', p_new_plan);
end;
$$;

revoke execute on function public.apply_hotmart_event from public, anon, authenticated;
