-- Auditoría (Sesión 6): 2 fixes de esquema.
--
-- 1) constraint único en dogs.user_id — el endpoint de migración hacía
--    "select→si no existe→insert" en dos pasos, no atómico: dos peticiones
--    simultáneas (doble tap, dos pestañas) podían crear 2 perros para la
--    misma cuenta aunque la v1 asuma 1 perro por cuenta. Si en el futuro se
--    soporta multi-perro, este constraint se quita en una migración propia
--    (expand/contract) — no bloquea esa evolución, solo la v1 actual.
alter table public.dogs add constraint dogs_user_id_unique unique (user_id);

-- 2) breed (raza) — a pedido del usuario. Nullable: no todos los onboardings
--    la van a tener retroactivamente, y no es un dato crítico para calcular
--    el plato (el cálculo usa peso/edad/actividad, no raza).
alter table public.dogs add column breed text;
