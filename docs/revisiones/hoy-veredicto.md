# VEREDICTO revisor-visual — Hoy
Fecha: 2026-09-05 00:00
Screenshot: docs/revisiones/hoy-375.png
Usabilidad: 36/40
Craft: 17/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. Tarjeta héroe (gesto swipe) — el drag no da ninguna señal visual mientras se arrastra (color/opacidad/icono de progreso) antes del umbral de -80px → animar background-color u opacity ligados a drag progress para confirmar que el gesto está funcionando.
2. Mensaje de error bajo el botón "Ya lo preparé" — "revisa el espacio del dispositivo" es un diagnóstico técnico fuera del vocabulario de un dueño de mascota → reescribir a "No se pudo guardar tu progreso — inténtalo de nuevo" sin mencionar almacenamiento.
3. Tarjetas satélite (Carne/Vísceras/Vegetales) — la rotación "dispositivo ownable" (3-6°) es casi imperceptible en el screenshot a 375px → subir el ángulo (8-10°) o sumar otro rasgo de textura para que la firma visual se note sin acercarse.
4. Shell de navegación (layout.tsx) — no hay transición animada entre pestañas/rutas (baseline de movimiento #5 ausente en código) → envolver `children` en AnimatePresence con fade/slide corto.
5. Chip "Racha: 2 sem" — visualmente parece chip tappable pero no tiene acción ni href → si no navega a nada, quitarle la apariencia interactiva (quitar fondo tipo botón) o enlazarlo a una vista de historial de racha.
