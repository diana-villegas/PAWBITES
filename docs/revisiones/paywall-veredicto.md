# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-13 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 29/40
Craft: 15/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Bloque de planes + CTA, fuera del viewport inicial] El CTA "Empezar mis 3 días gratis" solo aparece tras scrollear pasado el timeline y las 2 tarjetas de plan → agregar un footer sticky con el CTA o repetirlo cerca del hero para que la acción primaria esté siempre alcanzable en un paywall largo.
2. [Evidencia de la revisión] El screenshot entregado corta en "Día 4" y no captura las tarjetas de plan, el CTA, ni el trust badge final → no se pudo verificar visualmente el radio pill del botón, el estado "Más popular" ni el copy de garantía; volver a capturar la página completa (scroll completo) antes de la próxima ronda.
3. [Flujo de compra completo, Paywall.tsx] No hay manejo visible de error de red ni estado offline en el CTA/navegación (solo el try/catch de localStorage, nada para el submit) → agregar un estado de error genérico ("no pudimos continuar, intenta de nuevo") antes de conectar el checkout real de Hotmart.
4. [Bloque timeline del trial, línea 249-270] El hairline degradé (accent 45%→transparente sobre un fill ya tintado en accent 5%) se funde con el relleno y a 375px se lee como un borde tenue genérico, no como un detalle con carácter — el gate de "esto importa" queda solo parcialmente resuelto → subir el contraste del degradé (accent 55-60% en la esquina, o un tono más saturado) para que el hairline se distinga del fill.
5. [CategoriaChip, línea 122-151] La rotación "ownable" de las tarjetas satélite (-3° a 3°) es imperceptible a simple vista en el screenshot — las 3 chips se ven perfectamente alineadas → subir el ángulo a 4-6° o sumar un leve desfase vertical para que el dispositivo se note sin lupa.
