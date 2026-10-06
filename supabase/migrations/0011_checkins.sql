-- checkins — registro diario del plan de transición (calidad de las heces +
-- si ya se preparó el plato). Antes vivía SOLO en localStorage, rompiendo la
-- promesa de /entrar ("guárdalo y velo en cualquier dispositivo"). Mismo
-- patrón de RLS que shopping_list_items (migración 0001): pertenencia a
-- través de dogs, sin policy directa por user_id.

create table public.checkins (
  id         uuid primary key default gen_random_uuid(),
  dog_id     uuid not null references public.dogs(id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 14),
  quality    text check (quality in ('bien', 'blanda', 'diarrea')),
  preparado  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dog_id, day_number)
);
create index checkins_dog_id_idx on public.checkins(dog_id);

create trigger checkins_set_updated_at before update on public.checkins
  for each row execute function public.set_updated_at();

alter table public.checkins enable row level security;

create policy "select_own" on public.checkins for select
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "insert_own" on public.checkins for insert
  with check ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "update_own" on public.checkins for update
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) )
  with check ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
create policy "delete_own" on public.checkins for delete
  using ( dog_id in (select id from public.dogs where user_id = (select auth.uid())) );
