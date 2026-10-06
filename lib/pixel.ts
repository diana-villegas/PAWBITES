// Meta Pixel — envoltura mínima sobre `window.fbq` (el script base vive en
// app/layout.tsx). Nunca manda datos personales: solo nombres de evento y,
// como mucho, el número de paso o el plan elegido (nada de correo, nombre
// del perro ni respuestas del cuestionario).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** No bloquea nada si el Pixel todavía no cargó o el usuario tiene un
 * bloqueador de anuncios — simplemente no manda el evento. */
export function trackPixel(evento: string, params?: Record<string, string | number>): void {
  try {
    window.fbq?.('trackCustom', evento, params);
  } catch {
    // nunca romper la pantalla por un fallo de medición
  }
}
