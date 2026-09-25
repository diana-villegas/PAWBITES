# VEREDICTO revisor-visual — Hoy (PawBites, app interna)
Fecha: 2026-09-13 00:00
Screenshot: docs/revisiones/hoy-375.png
Usabilidad: 38/40
Craft: 19/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. [Chip de racha, esquina superior derecha del header] "0 días" sin label ("racha"/"streak") se lee como un logro fallido en el primer uso, no como un contador que empieza en cero → agregar la palabra "racha" junto al número o mostrar un estado distinto cuando racha=0 (ej. "Empieza tu racha hoy") para que no se confunda con un contador roto.
2. [Fondo del shell, radial-gradient global en app/app/layout.tsx] El degradé (acento 12% arriba-centro + verde 6% abajo-derecha) es tan sutil en el render a 375px que se percibe prácticamente como el mismo fondo plano de antes — no llega a leerse como "profundidad" a simple vista → subir 3-4 puntos de opacidad en cada stop o acercar el radio para que el efecto sea perceptible sin cruzar a "manchado".
3. [Tarjeta héroe + tarjeta "Tu plan de transición"] El día de transición ("Día 1 de 14") se repite en ambas tarjetas sin aportar información nueva en la segunda → en la card de plan, cambiar el texto por algo que no duplique literalmente (ej. solo la barra + "faltan 13 días", sin repetir "Día 1 de 14").
4. [Botón "Ya lo preparé"] Nunca se deshabilita ni muestra loading aunque el guardado en localStorage es síncrono — no es un bug hoy, pero si `guardarAppState` migra a una llamada async (backend) sin cuidar el estado intermedio, el botón quedaría vulnerable a doble-tap sin feedback → dejar anotado antes de esa migración, no bloquea el veredicto actual.
