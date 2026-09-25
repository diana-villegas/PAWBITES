# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-13 00:00
Screenshot: docs/revisiones/onboarding-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos:
1. [CTA "Continuar", paso "nombre"] Deshabilitado por defecto con texto blanco/70% sobre relleno coral al 35% (contraste bajo, <3:1 estimado) — viola la regla de CTA héroe vivo (nunca disabled por defecto) y es el componente `CtaFunnel` compartido por TODO el funnel → habilitar siempre el pill y validar al tap con un hint/shake inline en el input, no con opacidad reducida.
2. [Bloque central bajo el input, paso "nombre"] `flex-1 items-center justify-center` deja ~150-180px de hueco vertical muerto arriba y abajo del ícono+texto+hint (código líneas 221-237 de app/onboarding/page.tsx) → anclar el bloque justo debajo del input con spacing fijo (24-32px) en vez de centrarlo con flex-1.
3. [Mensaje "Escribe su nombre para continuar"] Aparece desde el primer render, antes de cualquier intento del usuario — se lee como instrucción impuesta, no como respuesta a una acción → mostrarlo solo tras blur del input vacío o tap fallido en el CTA.
4. [Header, ícono X] Sin confirmación al salir (`<a href="/">` directo, ui.tsx línea 58-64) — un tap accidental pierde todo el progreso sin aviso → agregar confirmación breve antes de navegar fuera del funnel.
5. [Icon-chip decorativo "paw"/"weight", pasos nombre/peso/reconocimiento] Ya unificado en tamaño (size-16/ícono-30, correcto), pero sigue siendo elemento puramente ornamental que ocupa espacio vertical central sin info nueva → fusionar con el texto de refuerzo en un bloque más compacto para además reducir el hueco del defecto #2.
