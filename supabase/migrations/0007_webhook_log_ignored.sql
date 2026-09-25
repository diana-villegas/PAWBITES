-- El webhook ahora deja constancia de los eventos que ignora (antes se perdían sin
-- rastro y una prueba de Hotmart mostró que no había forma de saber qué había llegado).
alter table public.webhook_log drop constraint webhook_log_result_check;
alter table public.webhook_log add constraint webhook_log_result_check
  check (result in ('applied', 'duplicate', 'illegal', 'unauthorized', 'error', 'ignored'));
