-- Una persona que canceló (plan='cancelado') y se vuelve a suscribir DEBE poder entrar.
-- Antes, apply_hotmart_event bloqueaba para siempre cualquier compra sobre una cuenta
-- cancelada (pensado para que un aviso viejo reenviado no reviva un reembolso), lo que
-- dejaba sin acceso a quien recompra. Ahora se compara la FECHA del aviso (creation_date
-- de Hotmart) con la del último cambio de plan: solo se bloquea un aviso más viejo.
alter table public.profiles add column plan_changed_at timestamptz;

drop function public.apply_hotmart_event(text, text, text, text, text, text, timestamptz);

create function public.apply_hotmart_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_email text,
  p_subscriber_code text,
  p_new_plan text,          -- 'trial' | 'mensual' | 'anual' | 'cancelado' | null (null = no cambia plan)
  p_trial_ends_at timestamptz default null,
  p_event_at timestamptz default null   -- fecha del aviso según Hotmart (creation_date)
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_current_plan text;
  v_changed_at timestamptz;
  v_profile_id uuid;
  v_event_at timestamptz := coalesce(p_event_at, now());
begin
  -- (a) IDEMPOTENCIA: si el event_id ya existe, salir sin tocar nada más.
  begin
    insert into public.processed_events (event_id, event_type, payload_hash)
    values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;

  -- (b) Resolver el perfil: primero por subscriber_code, si no por email.
  select id, plan, plan_changed_at into v_profile_id, v_current_plan, v_changed_at
  from public.profiles
  where (p_subscriber_code is not null and hotmart_subscriber_code = p_subscriber_code)
     or (email = p_email)
  limit 1;

  if v_profile_id is null then
    return jsonb_build_object('status', 'no_profile');
  end if;

  -- (c) TRANSICIÓN LEGAL: un aviso de acceso más VIEJO que el último cambio no puede
  --     revivir una cuenta cancelada/reembolsada. Una compra NUEVA (posterior) sí puede.
  if v_current_plan = 'cancelado'
     and p_new_plan in ('trial', 'mensual', 'anual')
     and v_changed_at is not null
     and v_event_at <= v_changed_at then
    return jsonb_build_object('status', 'illegal_transition', 'from', v_current_plan);
  end if;

  -- (d) Aplicar el cambio + subscriber_code + first_paid_at (solo el primer cobro real).
  update public.profiles set
    plan = coalesce(p_new_plan, plan),
    plan_changed_at = case when p_new_plan is not null and p_new_plan is distinct from plan then v_event_at else plan_changed_at end,
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
