# VEREDICTO revisor-visual — landing
Fecha: 2026-09-19 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 32/40
Craft: 13/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Top defectos:
1. [Sección "Agitación" — inmediatamente debajo de "¿Te suena?", ~y=1030-1330px en el screenshot a 375px] Vacío muerto grande y evidente: las 3 frases de agitación ("Cada semana que sigues calculando a ojo...") y la comparación "Hoy / En un mes, si nada cambia" NO se ven — queda un bloque en blanco de ~300px entre la lista de preguntas y el arranque de "Así funciona". El código usa `whileInView` con `viewport={{once:true, amount:0.2}}` (useReveal en ui.tsx): el trigger no disparó para esta sección durante la captura real, dejando el contenido en `opacity:0` de forma permanente (once:true no reintenta). Esto no es un defecto de composición — es contenido de venta central (la agitación emocional, pieza clave del copy) invisible para quien vio exactamente este render. Fix: bajar `amount` a 0.05-0.1 en esta sección o usar `initial={false}`/fallback visible si el usuario ya hizo scroll rápido; auditar TODAS las secciones con el mismo hook por el mismo riesgo.
2. [Carrusel "Tu día a día con PawBites", 3ra fila de frames, ~y=1600-1980px] 2 de 4 frames (Compras, Perfil) siguen siendo placeholder gris con borde punteado, sin captura real — defecto ya documentado desde Sesión 3, sigue abierto. No bloquea por sí solo pero reduce la prueba visual del producto en la pantalla que más debería demostrarlo.
3. [Craft — Eje 4 Movimiento, todo el sitio] El fix de hidratación (valores iniciales fijos, solo la duración se ramifica por `reduce`) resolvió el error de consola, pero el hallazgo #1 muestra que el mecanismo de disparo (`whileInView`+`once:true`) puede dejar contenido invisible en un flujo de scroll real — el "fix" no garantiza que TODO el contenido eventualmente se revele. Falta una red de seguridad (ej. IntersectionObserver con reintento, o revelar por defecto y solo animar el movimiento).
4. [Header, franja superior] Con "Cómo funciones", "Preguntas", "Ver precios" y "Entrar" los 4 juntos a 375px, el texto se ve apretado y en tamaño mínimo (~13px) — no rompe el uso, pero un ojo entrenado nota la densidad al lado del logo.
5. [Oferta → stack de valor, línea "Sustitutor de ingredientes sin complicarte · $15"] En 375px el texto y el precio quedan visualmente ajustados contra el borde de la card — verificar que no rompa a un ancho aún menor (320px) o con textos más largos en otros idiomas/variantes de copy.
