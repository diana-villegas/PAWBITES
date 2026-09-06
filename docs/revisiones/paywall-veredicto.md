# VEREDICTO revisor-visual — paywall
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 37/40
Craft: 18/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA

Detalle usabilidad: h1:4 h2:4 h3:4 h4:4 h5:4 h6:4 h7:3 h8:3 h9:3 h10:4
Detalle craft: jerarquía:3 profundidad:4 identidad:4 movimiento:4 encaje:3
Detalle copy: idea:4 especificidad:4 emoción:4 oferta:4 acción:3

Top defectos (no bloquean el veredicto, quedan para pulido):
1. [Chips de categoría — "Carne" y "Hueso", primeros dos íconos verde y azul] A 14px, el ícono Drumstick (carne) y el ícono Bone (hueso) de Lucide se ven casi idénticos en el screenshot — ambos leen como una forma tipo "eslabón/clip" indistinguible sin leer el label → subir el tamaño del ícono a 16-18px o usar un trazo (`strokeWidth`) más grueso solo en estos dos para diferenciarlos a simple vista.
2. [Tarjeta "Más popular" / plan Anual, badge superior] El badge "MÁS POPULAR" se ve correcto y sin overlap ahora que el badge de dev tools desapareció, pero conviene una verificación final en el dispositivo real (no solo el screenshot) de que no queda ningún elemento de terceros (cookie banner, analytics) que pueda superponerse en esa zona — es la zona más sensible de toda la pantalla de conversión.
3. [CTA secundarios — "Ahora no" / "Restaurar compra"] Ambos enlaces son sutiles y correctos en jerarquía, pero comparten el mismo peso visual entre sí — un ojo entrenado nota que "Restaurar compra" (acción de recuperación, poco frecuente) compite en igualdad con "Ahora no" (abandono) cuando podrían diferenciarse más (ej. menor contraste en "Restaurar compra").
4. [Jerarquía general de tamaños] El número héroe (4xl), el título (2xl) y el precio del plan (4xl también) usan el mismo tamaño de fuente en dos contextos distintos (plato vs precio) — funciona porque están en secciones separadas, pero al entrecerrar los ojos compiten levemente por el rol de "elemento más grande de la pantalla".
5. [Value stack, línea agregada "Nada de adivinar..."] Buen anclaje al dolor #3/#4 de FICHA-AVATAR; para el siguiente ciclo de copy, considerar sumar el miedo específico "que se ahogue con huesos crudos" (hallazgo VoC #8) ya que el plan incluye hueso — hoy el ancla es genérica ("diarrea por mal cálculo") y no aprovecha el dolor más visceral del avatar.
