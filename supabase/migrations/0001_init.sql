-- PawBites — esquema inicial (Sesión 6). Ver docs/sistema/25-BASE-DE-DATOS.md
-- (patrón RLS de alto rendimiento) y ESTADO.md (modelo de datos ya decidido).
--
-- Un perro por cuenta en la v1 (la UI lo asume; el esquema ya soporta varios
-- por cuenta a futuro sin cambiar de forma — decisión anotada en ESTADO.md).

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — uno por usuario de auth.users, datos de cuenta/plan
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  plan         text not null default 'trial' check (plan in ('trial', 'mensual', 'anual', 'cancelado')),
  trial_ends_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- dogs — el perro del usuario (1:N por cuenta; v1 de UI asume 1)
-- ─────────────────────────────────────────────────────────────────────────
create table public.dogs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null check (length(name) between 1 and 60),
  weight_kg      numeric not null check (weight_kg > 0 and weight_kg <= 120),
  age_group      text not null check (age_group in ('cachorro', 'adulto', 'senior')),
  activity_level text not null check (activity_level in ('bajo', 'moderado', 'alto')),
  diet_type      text not null check (diet_type in ('barf', 'cocinada')),
  prep_frequency_days smallint not null check (prep_frequency_days in (7, 15)),
  transition_started_at timestamptz not null default now(),
  streak_weeks   integer not null default 0 check (streak_weeks >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index dogs_user_id_idx on public.dogs(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- shopping_list_items — lista de compras de la tanda actual, check-off
-- ─────────────────────────────────────────────────────────────────────────
create table public.shopping_list_items (
  id           uuid primary key default gen_random_uuid(),
  dog_id       uuid not null references public.dogs(id) on delete cascade,
  batch_start_date date not null,
  ingredient   text not null,
  grams        integer not null check (grams > 0),
  checked      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index shopping_list_items_dog_id_idx on public.shopping_list_items(dog_id);
create index shopping_list_items_dog_batch_idx on public.shopping_list_items(dog_id, batch_start_date);

-- Nota: el calendario de transición de 14 días NO tiene tabla — se calcula con
-- una fórmula a partir de dogs.transition_started_at (evita una tabla innecesaria).
-- Las sustituciones de ingredientes son datos ESTÁTICOS en código (lib/plato.ts),
-- no datos de usuario — no van en la DB.

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at automático
-- ─────────────────────────────────────────────────────────────────────────
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger dogs_set_updated_at before update on public.dogs
  for each row execute function public.set_updated_at();
create trigger shopping_list_items_set_updated_at before update on public.shopping_list_items
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- RLS — patrón de alto rendimiento: (select auth.uid()), nunca auth.uid() suelto
-- (ver docs/sistema/25-BASE-DE-DATOS.md § RLS DE ALTO RENDIMIENTO)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.shopping_list_items enable row level security;

-- profiles: cada quien ve y edita SOLO su fila (se crea automático — ver trigger abajo)
create policy "select_own" on public.profiles for select
  using ( (select auth.uid()) = id );
create policy "update_own" on public.profiles for update
  using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

-- dogs: CRUD completo solo del dueño
create policy "select_own" on public.dogs for select
  using ( (select auth.uid()) = user_id );
create policy "insert_own" on public.dogs for insert
  with check ( (select auth.uid()) = user_id );
create policy "update_own" on public.dogs for update
  using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "delete_own" on public.dogs for delete
  using ( (select auth.uid()) = user_id );

-- shopping_list_items: RLS por pertenencia a través de dogs (join implícito en la policy)
create policy "select_own" on public.shopping_list_items for select
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "insert_own" on public.shopping_list_items for insert
  with check ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "update_own" on public.shopping_list_items for update
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) )
  with check ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "delete_own" on public.shopping_list_items for delete
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );

-- ─────────────────────────────────────────────────────────────────────────
-- profiles se crea solo cuando nace un auth.users (el webhook de Hotmart o el
-- primer signInWithOtp crean el auth.users; este trigger completa la fila de
-- perfil sin que el cliente tenga que hacerlo — evita una carrera de "perfil
-- no existe todavía" justo después del primer login).
-- ─────────────────────────────────────────────────────────────────────────
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, trial_ends_at)
  values (new.id, new.email, 'trial', now() + interval '3 days');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
