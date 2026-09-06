# FICHA DE DIRECCIÓN DE ARTE — PawBites

## Referencia del usuario (CONTRATO)
- ¿Hay imagen(es) de referencia del usuario?: SÍ → 3 capturas de apps de cuidado de mascotas (estilo "PawBuddy"/genéricas de referencia), aportadas en el chat el 2026-08-27
- Extracción (síntesis de las 3 imágenes — moodboard, no una sola pantalla):
  - Modo: claro · Fondo: #FBF6EF (crema cálido) · Superficie: #FFFFFF · Texto 1º/2º: #1B2A3D / #7C8798
  - Acento: #FF6B4A (coral) — en CTA, nav activo y tarjeta héroe del plato
  - Categorías funcionales (no son el acento de marca, son etiquetas por ingrediente): verde #4FAE6E · azul #4A90D9 · morado #8B7FD9 · amarillo #E8B93D
  - Display: redondeada friendly → **Baloo 2** · Body: **Nunito**
  - Radio: cards 20-22px / botones 999px (pill) · Espaciado: aireado
  - Sombras: suaves y difusas (elevación), sin bordes duros
  - Bordes: prácticamente ninguno — todo resuelto con sombra
  - Textura/gradiente: degradé tonal coral en la tarjeta héroe · íconos con volumen "soft-3D" (aproximado en CSS, no ilustración real)
  - Layout: saludo + tarjeta héroe + accesos rápidos + checklist (combinación elegida por el usuario de dos composiciones distintas)
  - Detalle firma a replicar: checklist con ícono a color + marca de check, e ingredientes del plato con su propio color (como las tarjetas de Comida/Paseo/Medicina de la referencia)
- Prohibiciones anti-IA que la referencia LEVANTA: multi-acento por categoría (una por tipo de ingrediente) — permitido porque lo pide la referencia y tiene función real (identificar el ingrediente de un vistazo), no es decorativo

## Personalidad compilada
- 3 adjetivos: cálido (dominante), confiable, claro
- Fila compilada: spring bounce 0.15 / stiffness ~260 · duración base 260ms · exclamaciones máx 1/pantalla
  → celebración N1: check suave con color · N2: confetti sutil en hitos de racha (semana) · N3: share card en hito mensual
  → radius tendencial: 20px · color emocional: coral cálido (logro) + verde (completado)
  → arquetipo de voz: cómplice cercano (cálido, sin ser payaso — habla como alguien que también quiere lo mejor para tu perro)

## Brand kit final (valores para globals.css / @theme)
- Fondo: #FBF6EF · Superficie: #FFFFFF · Hundido/secundario: #F3EBDD · Texto 1º/2º: #1B2A3D / #7C8798
- Acento: #C0431D (SOLO en: CTA primario, nav activo, tarjeta héroe del plato, iconografía de marca) — ajustado desde el #FF6B4A original de la extracción: ese tono no pasaba contraste AA con texto blanco encima (~2.6:1); se oscureció en 2 pasadas (revisor-visual, Sesión 3) manteniendo la misma familia coral hasta llegar a ≈4.8:1
- Categorías funcionales (ingredientes/tipos de evento, no marca): verde #4FAE6E · azul #4A90D9 · morado #8B7FD9 · amarillo #E8B93D
- Semánticos: éxito #4FAE6E · error #E8544A (a confirmar contraste AA en implementación) · aviso #E8B93D
- Display: Baloo 2 (pesos 600/700) · Body: Nunito (pesos 400/600/700) · Escala: display 26-34px / title 17-22px / body 15-16px / label 11-13px
  - Excepción documentada: el texto de los botones CTA principales (h-14, `text-base`/16px) es un 5º tamaño fuera de esta escala — deliberado y consistente en TODA la app (landing, onboarding, paywall, app interna): un botón de acción primaria necesita más peso visual que el body de 15-16px. No es una inconsistencia a corregir pantalla por pantalla.
- Radio: 20-22px cards, 999px botones · Profundidad: sombras suaves de 2 capas, sin bordes duros · Espaciado base: 4·8·12·16·24·32·48·64
- Dispositivo ownable: tarjetas "satélite" por ingrediente/categoría con rotación sutil (-3° a 3°) + icon-chip soft-3D
- Motion signature: ease-out estándar para entradas/salidas · stagger 60-70ms · spring solo en celebraciones (bounce 0.15)

## Trazabilidad y vetos
- Protocolo A/B/C: ronda 1 (sin referencia) descartada completa cuando el usuario aportó imágenes → ronda 2 fiel a la referencia → opción elegida: **combinación A ("Panorama del día") + B ("Satélites alrededor del plato")**
- Descartada C ("Carrusel de tarjetas"): composición de tarjetas deslizables, se prefirió la vista fija de A+B
- Página comparativa: `docs/revisiones/direcciones-abc-v1-descartadas.html` (ronda 1) · `docs/revisiones/direcciones-abc.html` (ronda 2) · `docs/revisiones/direcciones-abc-combinada.html` (confirmación final)
- Paleta derivada de: referencia visual del usuario (moodboard de 3 imágenes) — tomada como contrato, no de un líder de nicho
- Registro anti-repetición: paleta crema/coral + Baloo 2/Nunito — anotados en ESTADO.md, vetados para el próximo proyecto de este SO
- Modo (claro/oscuro) DERIVADO por: la referencia del usuario ya era clara, y el mundo del sujeto (cocina, comida fresca, mañana/día) confirma claro como correcto

## Idioma UI: Español latino neutro · Fecha de cierre de la ficha: 2026-08-27 · Aprobada por el usuario: SÍ (confirmó "me gusta" sobre la combinación A+B)
