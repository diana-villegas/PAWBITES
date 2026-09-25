-- El trial pasó de 3 a 7 días (sesión 2026-09-19, ver FICHA-MERCADO.md §4).
-- El trigger que crea el perfil al nacer un auth.users seguía con el default viejo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, trial_ends_at)
  values (new.id, new.email, 'trial', now() + interval '7 days');
  return new;
end;
$$;
