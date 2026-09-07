-- Corrige las 2 alertas de seguridad que reportó el linter de Supabase tras
-- la migración inicial (get_advisors, Sesión 6).

-- function_search_path_mutable — fijar search_path explícito evita que una
-- función SECURITY DEFINER pueda ser engañada resolviendo objetos de otro schema.
alter function public.set_updated_at() set search_path = public;

-- anon/authenticated podían invocar handle_new_user() directo vía
-- /rest/v1/rpc/handle_new_user (es SECURITY DEFINER). Solo debe correr como
-- trigger interno al crear un auth.users — se revoca el EXECUTE público.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
