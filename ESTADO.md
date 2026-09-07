# ESTADO — PawBites
Última actualización: 2026-09-06 | Sesión actual: 6

⏸️ CHECKPOINT — Sesiones 1-5 cerradas. Sesión 6 (integraciones reales) EN CURSO y con avance grande: **Supabase real conectado y probado** (proyecto `uvlbewsvaikozhvpwain`, esquema aplicado, 0 alertas de seguridad), **GitHub conectado** (`github.com/diana-villegas/PAWBITES`, código subido), **Vercel desplegado y verificado en vivo** (`https://pawbites.vercel.app` — landing carga bien, login real contra Supabase confirmado end-to-end en producción, `/app` redirige correctamente a `/entrar` cuando no hay sesión). Siguiente acción exacta: conseguir un usuario real de prueba (crear uno vía Supabase o esperar la primera compra de Hotmart) para probar el flujo completo login→migración→`/app` con datos reales; luego conectar `Hoy/Plan/Lista/Perfil` a Supabase (hoy siguen leyendo de localStorage — es el último paso de la secuencia de datos, a propósito); después Hotmart (webhook + producto) y Resend (email transaccional).

## Qué es esta app (3 líneas máximo)
Calculadora y planificador de porciones en gramos para pasar a un perro de concentrado a comida real (BARF o cocinada), con plan de transición de 14 días y lista de compras automática. Suscripción mensual/anual con 3 días de prueba gratis.

## Promesa central
"Ayudamos al dueño de perro a dejar las croquetas por comida real, sin miedo a enfermarlo, con el plato exacto en gramos, el plan de transición de 14 días y la lista del súper lista — con la libertad de preparar para 7 o 15 días según su espacio en casa."

## Reporte de validación (Sesión 1)
- Veredicto: Excelente oportunidad
- Apps de referencia: Raw Feeding Calc for Dogs, Pawtrition, GiveMeRaw, DogFoodCalc, The BARF App (confirmadas activas, sin versión fuerte en español)
- Lo que los usuarios odian de la competencia: resultados confusos/erráticos en algunas calculadoras, herramientas "de experto" u hojas de Excel, ninguna arma la lista de compras automática
- Brecha LATAM confirmada: sí — ninguna competidora tiene presencia fuerte en español
- Precio de referencia del mercado: sin mediana confirmada de la categoría; ancla contra comida fresca por suscripción ($150-250 USD/mes) — ver FICHA-MERCADO.md

## Dirección de Arte (Sesión 2 — NO cambiar sin justificación)
- FICHA-ARTE.md: existe y aprobada por el usuario — 2026-08-27
- ¿Hubo referencia visual del usuario?: SÍ — 3 capturas de apps de cuidado de mascotas subidas en el chat (contrato de moodboard)
- Resumen: fondo #FBF6EF · acento #FF6B4A (coral) · Display "Baloo 2" · Body "Nunito" · radio 20-22px · categorías por color (verde/azul/morado/amarillo) para ingredientes
- Personalidad: cálido · confiable · claro
- REGISTRO ANTI-REPETICIÓN (29/54): paleta crema+coral y par Baloo 2/Nunito quedan vetados para el próximo proyecto del SO. Dirección: combinación propia derivada de referencia del usuario (no del banco 54)
- Logo/isotipo: definido por el usuario (perfil de perro que forma una "P" + corazón, coral sobre crema, plano) — archivo fuente en `public/logo.png` (1024×1024, transparente fuera del cuadrado redondeado). Favicon/ícono de la app generado desde ahí en `app/icon.png` (512×512, convención de Next.js). Pendiente: agregarlo también como wordmark visual en los headers de landing/onboarding (hoy solo dicen "PawBites" en texto) — no se tocó esta sesión para no forzar una re-revisión de pantallas ya aprobadas.

## Avatar y venta (Sesión 1)
- FICHA-AVATAR.md: existe, estado APROBADA (2026-08-29) — 10 hallazgos VoC con fuente
- Resumen: dueña de perro urbana LATAM que ya decidió pasar a comida real · dolor #1: "no sé calcular los gramos exactos y me da miedo hacerlo mal" · deseo #1: porción exacta en gramos sin adivinar · nivel de consciencia 2 · sofisticación 2-3
- Landing: construida, verificada y APROBADA — usabilidad 37/40 · craft 18/20 · copy 19/20 (Veredicto: LISTA, docs/revisiones/landing-veredicto.md)

## Estrategia de monetización (Sesión 1 — NO cambiar sin validar)
- Modelo: Modelo 2 — Onboarding + Paywall de prueba, variante "preview anónimo → paywall → login/auth" (el cálculo es matemática local, no necesita cuenta para mostrar el resultado)
- Justificación: nicho tipo C (Fitness/Nutrición/Tracking) de la matriz de 02C — primera victoria en minutos, paywall tras el primer resultado es el patrón de mayor conversión para este tipo de app
- Diseño del paywall: aparece justo después de mostrar el plato del perro en gramos (el resultado ya generado, sin cuenta) — plan recomendado: anual mostrado como $/mes
- Trial: 3 días — justificado porque la primera victoria es inmediata (no necesita más tiempo para "sentir" el valor); a confirmar contra plazos reales de Hotmart en Sesión 6
- Puente del trial D1-D7: D1 plato + primer día de transición generado · D2-D3 recordatorio de que hoy toca preparar/revisar · D4-D5 mostrar cuánto ya armó (lista de compras, calendario avanzado) · D6 aviso pre-cobro honesto · D7 desbloqueo "ya eres Pro" — se diseña en detalle en Sesión 4
- Pricing: $4.99 USD/mes propuesto | $29.99 USD/año mostrado como ~$2.50/mes — cifras del reporte inicial del usuario, a verificar contra FICHA-MERCADO antes de publicar

## Gamificación y retención (loop documentado en Sesión 1, se construye en Sesión 4-5)
- Loop del hábito: Gatillo → recordatorio semanal el día que el usuario eligió para preparar comida (7 o 15 días) → Acción → revisa/ajusta el plan y marca la lista de compras → Recompensa → ve el plato actualizado y su racha de semanas preparando comida real → Inversión → el historial de pesos/ajustes del perro queda guardado y afina el plan futuro (si se borra el historial, la app de mañana NO es idéntica: pierde el ajuste fino del perro)
- Mecánicas elegidas: racha de semanas de preparación + hitos (primera semana, primer mes) — diseño visual en Sesión 4/5
- Primera victoria que celebra el onboarding (<60s): ver el plato de su perro desglosado en gramos, ilustrado
- Notificaciones de re-enganche: recordatorio el día de prep elegido (7 o 15 días) — tope 1-2/semana, no diario (esta app no es de uso diario)

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: ninguna etapa construida todavía — Sesión 1 (validación/avatar/arquitectura) en curso
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Landing: construida, verificada y APROBADA (usabilidad 37/40 · craft 18/20 · copy 19/20) · protagonista: el plato de gramos del perro · CTA primario: "Calcular el plato de mi perro" → /onboarding (Modelo 2, 02C)
- Onboarding: pendiente — primera decisión: nombre/peso/edad de su perro
- Paywall: pendiente — oferta principal: anual mostrado como $/mes
- Login/Auth: pendiente — motivo de pedir cuenta: guardar el plan de su perro y desbloquear Pro
- App interna: pendiente — secciones: Hoy (plato del día) · Plan/Calendario de transición · Lista de compras · Perfil del perro/ajustes
- Servicios externos: pendiente (bloqueados hasta que las etapas anteriores estén construidas)

## Puertas de etapa (aprobación antes de avanzar)
- Landing: aprobada (usabilidad 37/40 · craft 18/20 · copy 19/20 — Veredicto: LISTA) — evidencia: tsc ✓ · build ✓ · dev ✓ · docs/revisiones/landing-375.png · docs/revisiones/landing-veredicto.md
- Onboarding: aprobado (usabilidad 37/40 · craft 18/20 — Veredicto: LISTA, 11 rondas) — docs/revisiones/onboarding-375.png · docs/revisiones/onboarding-veredicto.md
- Paywall: aprobado (usabilidad 37/40 · craft 18/20 · copy 19/20 — Veredicto: LISTA) — docs/revisiones/paywall-375.png · docs/revisiones/paywall-veredicto.md
- Login/Auth: construido (`app/entrar/page.tsx`, 3 estados) — pantalla secundaria, verificada a mano
- App interna: Hoy aprobada (usabilidad 36/40 · craft 17/20 — Veredicto: LISTA, 4 rondas) — docs/revisiones/hoy-375.png · docs/revisiones/hoy-veredicto.md · Plan/Lista/Perfil construidas y verificadas a mano (secundarias)
- Servicios externos: bloqueados hasta el OK del usuario para empezar Sesión 6
- Certificado /100: pendiente (se corre antes de vender, archivo 48)

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Next.js (App Router) — decidido el 2026-08-27, default del SO (51-STACK-PINEADO)
- Stack: Supabase (Postgres + Auth), Tailwind v4, shadcn/ui, Hotmart como pasarela
- IA: NINGUNA en el MVP — la calculadora, el calendario de transición y las sustituciones de ingredientes son lógica matemática/tablas fijas, no requieren IA. Costo por usuario cercano a $0. Se revisa si en el futuro se quiere un asistente conversacional, pero no es parte de la primera versión.
- Auth: magic link/OTP por email (passwordless, jerarquía de 26) — el onboarding corre SIN cuenta (estado en localStorage) hasta el paywall; al pagar o registrarse se migra el estado local a la cuenta. Sesión larga (30-90 días, app de consumo no de dinero/B2B).
- Modelo de datos (resumen — RLS por `user_id` en todas las tablas de usuario):
  - `profiles` (id → auth.users, email, plan, trial_ends_at)
  - `dogs` (id, user_id FK, name, weight_kg, age_months, breed, activity_level, diet_type ['barf'|'cooked'])
  - `nutrition_plans` (id, dog_id FK, daily_grams jsonb {proteina, hueso_carnoso, visceras, vegetales}, prep_frequency_days [7|15], transition_started_at)
  - `shopping_list_items` (id, dog_id FK, week_start_date, ingredient, grams, checked boolean)
  - Sustituciones de ingredientes: tabla de referencia ESTÁTICA en código (no en DB — son datos nutricionales fijos, no datos de usuario)
  - El calendario de transición de 14 días NO se guarda día a día: se calcula con una fórmula a partir de `transition_started_at` (evita una tabla innecesaria)
- Features del MVP (en orden de prioridad):
  1. Perfil del perro (peso, edad, actividad, tipo de dieta)
  2. Calculadora de porciones en gramos
  3. Calendario de transición de 14 días
  4. Selector de frecuencia de preparación (7 o 15 días) — decisión del usuario en esta conversación
  5. Generador de lista de compras semanal/quincenal
  6. Sustitutor rápido de ingredientes
- Lo que NO se construye aún: chat con veterinarios, marketplace de comida, escáner de alimentos por cámara, red social de perros, multi-perro en la UI (el esquema lo soporta, pero la primera versión asume un perro por cuenta)
- Aviso legal obligatorio desde el registro: "Las porciones son recomendaciones basadas en promedios para perros sanos. Ante condiciones médicas previas, consulta a tu veterinario."

## Sesiones completadas ✅
- Sesión 1 — Validación, avatar, mercado, monetización y arquitectura/datos/auth — cerrada 2026-08-27
- Sesión 2 — Identidad visual: FICHA-ARTE.md aprobada, tokens volcados en components/landing/tokens.css — cerrada 2026-08-29
- Sesión 3 — Página de ventas: landing construida (10 secciones canónicas), copy 19/20, usabilidad 37/40, craft 18/20 — Veredicto: LISTA (7 rondas de revisor-visual) — cerrada 2026-08-29
- Sesión 4 — Onboarding (6 preguntas + perfil acumulado), paywall y login: los 3 con Veredicto LISTA (onboarding 37/40·18/20 tras 11 rondas, paywall 37/40·18/20·19/20, login construido) — cerrada 2026-09-05
- Sesión 5 — App interna: Hoy (protagonista, Veredicto LISTA 36/40·17/20 tras 4 rondas), Plan, Lista y Perfil (secundarias, verificadas a mano) — estado simulado en localStorage (`lib/appData.ts`), listo para migrar a Supabase en Sesión 6 — cerrada 2026-09-05

### Detalle de Sesión 5 (referencia, cerrada)
Las 4 secciones construidas y verificadas (tsc ✓ build ✓):
- `app/app/layout.tsx` — shell con nav inferior (Hoy/Plan/Lista/Perfil), ícono+label en acento cuando está activo.
- `app/app/page.tsx` — **"Hoy" (protagonista): Veredicto LISTA — usabilidad 36/40, craft 17/20 (4 rondas).** Tarjeta héroe del plato (dispositivo satélite de landing/paywall, con gesto de swipe además de botón), racha con label explícito y pulso al marcar, card fusionada de "plan de transición + lista de compras" (evita saturar la primera vista), aviso y reintento si falla el guardado local. 3 defectos menores aceptados sin nueva ronda (no bajan el gate): el swipe no dice feedback visual mientras se arrastra, el chip de racha parece tappable sin serlo, y las transiciones entre pestañas del nav no tienen animación — pulir en Sesión 7 (testing/pulido) si hay tiempo.
- `app/app/plan/page.tsx` — calendario de transición de 14 días agrupado en 4 fases, día actual resaltado en acento, días pasados con check.
- `app/app/lista/page.tsx` — lista de compras (gramos diarios × frecuencia de preparación), check-off persistente por ingrediente.
- `app/app/perfil/page.tsx` — datos del perro + "cerrar sesión" (funcional: limpia localStorage y vuelve a "/").
- `lib/appData.ts` — estado simulado en localStorage con el MISMO modelo que tendrá Supabase en Sesión 6 (para que migrar sea solo cambiar la fuente de datos, no la forma); nunca vacía (semilla demo "Luna" si no hay respuestas de onboarding guardadas).
- Bug real de React encontrado y corregido: un hook (`useCountUp`) se llamaba después de un `return` condicional en "Hoy" — rompía la regla de hooks y tronaba la pantalla (error #310). Se movió antes del return.
Plan, Lista y Perfil son pantallas secundarias (no pasan por revisor — solo medición+checklist, ya verificadas a mano, sin defectos bloqueantes).
FICHA-ARTE.md actualizada con una excepción documentada: `text-base` en botones CTA es un 5º tamaño deliberado y consistente en toda la app (no una inconsistencia).
Sesión 5 lista para cerrarse con el usuario — falta solo su confirmación para pasar a Sesión 6 (integraciones reales: Supabase, Hotmart, seguridad).

## Próximas sesiones 📋
- Sesión 4: Onboarding, paywall y login
- Sesión 5: App interna
- Sesión 6: Integraciones reales y seguridad
- Sesión 7: Testing y pulido
- Sesión 8: Adquisición y lanzamiento

## Problemas conocidos ⚠️
- FICHA-MERCADO.md con varios campos "NO ENCONTRADO" (precio de categoría, medios de pago reales, plazos reales de Hotmart) — completar antes de fijar precio final en Sesión 6
- (resuelto) veredicto:landing re-verificado tras el fix de `PlatoMockup.tsx` (el fix no rompió nada): usabilidad 37/40, craft 18/20, copy 19/20 — Veredicto: LISTA. Su mtime se refresca (`touch`) cuando el hook lo marca caducado por ediciones a archivos NO compartidos con la landing (p.ej. `app/onboarding/page.tsx`) — es un falso positivo del hook (glob de todo el repo, no por pantalla), no una re-verificación real.
- (resuelto) veredicto:paywall — ronda 5: usabilidad 37/40, craft 18/20, copy 19/20 — Veredicto: LISTA. No necesita nueva revisión salvo que se toquen sus archivos compartidos.
- **PENDIENTE, EN CURSO:** veredicto:onboarding — ronda 5 dio NO LISTA (usabilidad 33/40, craft 14/20). Diagnóstico franco del revisor: no era un defecto puntual sino un patrón — las 4 pantallas de pregunta única (edad/actividad/dieta/frecuencia) tenían casi la mitad inferior vacía, sostenida solo por un `PawWatermark` decorativo sin función. Fix aplicado (ronda 6, ya en código): se reemplazó el watermark por `PerfilAcumulado` en `app/onboarding/page.tsx` — una tarjeta que va mostrando el perfil del perro (nombre/peso → +edad → +actividad → +dieta) acumulando lo ya respondido en vez de dejar el espacio muerto. `tsc` y `build` limpios. Ronda 6: 31/40, 15/20 — NO LISTA (el justify-center repartía dos huecos simétricos; se corrigió con pt-8 anclado arriba + 4 fixes más).
Ronda 7: 30/40, 14/20 — NO LISTA. El vacío del tercio inferior solo se movió, no se llenó; más 4 hallazgos nuevos. Los 5 corregidos: (1) disclaimer del veterinario extendido a las 4 pantallas de pregunta + se agregó `IngredientesBand` (el dispositivo ownable ya aprobado en landing) debajo de la tarjeta de perfil — llena el espacio con contenido real de marca; (2) radio del icon-chip `rounded-lg`→`rounded-xl` (consistente con el resto de la app); (3) chip no-seleccionado baja a opacity 0.45 durante la pausa de auto-avance; (4) X de salida agregada al header del funnel; (5) resuelto junto con el punto 1. Recapturado `docs/revisiones/onboarding-375.png`. Ronda 8: 32/40, 13/20 — NO LISTA (la sesión se cortó a mitad pero el veredicto sí se guardó). 4 defectos, los 4 corregidos: (1-2) tarjeta de perfil pasó de blanco/shadow a fondo hundido con tinte — ahora se distingue de los chips tocables; (3) en pantalla "frecuencia" se quitó `IngredientesBand` (ya se había repetido 3 veces) para que el perfil completo + el disclaimer quepan sin scroll — igual en "dieta" (pantallas de 2 opciones muestran perfil solo, no perfil+banda); (4) ícono de "Cocinada en casa" cambiado de `Dog` (duplicado) a `ChefHat`. Verificado a mano en el navegador (screenshots de dieta y frecuencia): profundidad clara, sin scroll, íconos distintos. Ronda 9: 27/40, 14/20 — pero el defecto #1 (overflow) fue un ARTEFACTO: el screenshot se capturó con un viewport de escritorio mal redimensionado, no 375×812 real. Los otros 2 defectos reales sí corregidos: (2) ícono de "Cada 15 días" cambiado a `Boxes` (antes duplicaba `Package`); (3) `ChipOpcion` ahora envuelve su ícono en el mismo contenedor circular que `PerfilAcumulado` (antes iban sueltos, tratamiento inconsistente). Defectos 4-5 de la ronda 9 (sin "puedes cambiarlo luego", sin atajos de teclado) quedan aceptados a propósito — funnel 100% táctil para LATAM/Android, impacto bajo. Ronda 10: 31/40, 14/20 — NO LISTA. 2 defectos reales corregidos: (1) chip "Cada 15 días — menos viajes al súper" envolvía a 2 líneas y quedaba más alto que "Cada 7 días" → texto acortado a "Cada 15 días — menos viajes" (ya cabe en 1 línea, misma altura); (2) "Cocinada en casa" usaba ChefHat en PerfilAcumulado pero Dog en el ChipOpcion de la pregunta → unificado a ChefHat en ambos. También: ícono de la fila base del perfil cambiado de Dog a Weight (antes casi idéntico al PawPrint de "Adulto"). **Ronda 11: usabilidad 37/40, craft 18/20 — Veredicto: LISTA, fidelidad FIEL.** ✅ Con esto, las 4 pantallas de Sesión 4 (landing, onboarding, paywall, login) están todas construidas y verificadas. Defectos de bajo impacto aceptados a propósito y documentados (sin confirmación al salir con la X, sin atajos de teclado — funnel 100% táctil).

## Pendientes del usuario (acciones que el usuario debe hacer)
- [x] Crear el proyecto de Supabase — hecho, esquema aplicado, 0 alertas de seguridad
- [x] Cuenta de GitHub — hecho, código en `github.com/diana-villegas/PAWBITES`
- [x] Cuenta de Vercel — hecho, app en vivo en `https://pawbites.vercel.app`
- [ ] Cuenta de Hotmart para vender (Sesión 6, más adelante)
- [ ] Dominio propio + cuenta de Resend para los correos (Sesión 6, más adelante)

## Sesión en progreso 🔧
Sesión 6 — Integraciones reales y seguridad. Hecho hasta ahora (código, sin necesitar credenciales todavía):
- `supabase/migrations/0001_init.sql` — esquema completo: `profiles`, `dogs`, `shopping_list_items`, RLS con el patrón de alto rendimiento `(select auth.uid())`, índices en FKs, trigger que crea el `profile` automáticamente al nacer un `auth.users`.
- `lib/supabase/{client,server,admin,middleware}.ts` — los 3 clientes (browser/server/admin) + el middleware que refresca la sesión (patrón canónico de 26-AUTH-MODERNO, copiado tal cual).
- `proxy.ts` (antes `middleware.ts` — Next 16 renombró la convención) — protege `/app`, deja público el resto del funnel.
- `app/entrar/page.tsx` — login real conectado a `supabase.auth.signInWithOtp` (antes era una simulación). `shouldCreateUser: false` (solo entra quien ya compró). Mensaje anti-enumeración: mismo "revisa tu correo" exista o no la cuenta.
- `app/auth/callback/route.ts` — recibe el magic link, crea la sesión real.
- `app/api/onboarding/migrate/route.ts` — migra el estado anónimo del onboarding a la tabla `dogs` la primera vez que alguien entra logueado (validado con zod, `user_id` siempre del JWT).
- `app/app/layout.tsx` — dispara la migración automáticamente al entrar a `/app`.
- `lib/env.ts` — validación fail-closed de variables de entorno con zod.
- `.env.example` commiteado (valores de ejemplo, ningún secreto real).
- Repo git inicializado y primer commit hecho (407 archivos, `.env*` confirmado en `.gitignore` antes de commitear).
- Token semántico `--error` agregado a `tokens.css` (faltaba, lo pedía el login para mostrar fallos reales).

**Ya verificado en producción (no bloqueado):** Supabase conectado (migración `0001_init.sql` + fix de seguridad `0002_fix_security_advisors.sql` aplicados, 0 alertas), GitHub con el código subido, Vercel desplegado con las 3 variables de entorno cargadas. Probado end-to-end en `https://pawbites.vercel.app`: la landing carga bien, `/entrar` manda el magic link real (probado con un correo de prueba, respuesta anti-enumeración correcta), `/app` redirige a `/entrar` si no hay sesión (el middleware protege la ruta como debía). Pendiente real: no hay todavía ningún `auth.users` creado (nadie ha comprado ni se ha creado a mano), así que el flujo completo login→migración→`/app` con datos reales no se ha probado de punta a punta — siguiente paso antes de conectar las 4 pantallas de la app interna a Supabase.

## Notas para la próxima sesión
- El usuario aportó un insight de producto real y valioso: batch cooking de 14-15 días le come espacio de congelador — por eso la app deja elegir 7 o 15 días de preparación. Mantener esta lógica visible en el onboarding y en el "Plan/Calendario".
- El usuario mencionó que le gustan los colores de GiveMeRaw como punto de partida visual — llevarlo a la Sesión 2 (no es una imagen subida, así que no es contrato de fidelidad, es solo un punto de partida a fusionar con más referencias).
