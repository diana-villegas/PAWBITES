# VEREDICTO revisor-visual — landing
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 37/40
Craft: 18/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos: 1) Header (Hero.tsx línea ~91) — las anclas "Cómo funciona"/"Preguntas" siguen con `sm:inline-block` (ocultas por defecto), a 375px el header solo muestra "Ver precios"/"Entrar" → si se retoca, mover a un menú/chip horizontal visible en mobile (no bloqueante, ya cruzó el umbral). 2) h9 errores con solución sigue en 2/4 — techo estructural: landing sin formularios/acciones fallables, no hay superficie para demostrar recuperación de error dentro del alcance de la pantalla. 3) BackToTop (PlatoMockup.tsx, size-11 = 44px) toca el mínimo exacto de área táctil; si se retoca, subir a size-12 (48px) da más margen en pulgar de gama media LATAM. 4) Eje movimiento del craft se queda en 3/4 porque tabs y modales no aplican a esta pantalla — rango típico de landing, no accionable. 5) Verificación específica de este cambio: el bug de useCountUp (guard de useRef retirado en PlatoMockup.tsx) se revisó en código — el efecto ya no depende de un ref que podía quedar en `true` tras la doble-invocación de Strict Mode; el cleanup cancela el rAF anterior y el conteo es idempotente. En el screenshot renderizado el hero muestra "380 g totales" (no 0) y el resto de la pantalla (header, propuesta, oferta, planes, garantía, FAQ, footer) es visualmente idéntico a la ronda 7 aprobada — sin regresión detectada, no se generan nuevos defectos por este fix.
