-- Si el perro YA come comida real (cruda o cocinada) antes de entrar a PawBites
-- (lo cocinaba la propia persona, usó ChatGPT para sacar porcentajes, etc.), no
-- tiene sentido pedirle una transición de 14 días desde el concentrado que ya
-- dejó. `already_real_food` lo marca el onboarding; cuando es true, el perro se
-- crea con `transition_started_at` adelantado 14 días (ver /api/onboarding/
-- migrate) para que arranque directo en el tramo de 100% comida real — reutiliza
-- toda la lógica de `lib/plato.ts`/`diaDeTransicion` sin tocarla.
alter table public.dogs add column already_real_food boolean not null default false;
