// Guarda los utm_ con los que llegó la persona (si los hay) para poder
// agregarlos al enlace de Hotmart más adelante en el recorrido — así se sabe
// de qué anuncio vino cada compra. Solo texto de la propia URL, nada personal.

const KEY = 'pawbites_utm';
const CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Llamar una vez al cargar la landing — si la URL trae utm_, los guarda. */
export function capturarUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const encontrados: Record<string, string> = {};
    for (const campo of CAMPOS) {
      const valor = params.get(campo);
      if (valor) encontrados[campo] = valor;
    }
    if (Object.keys(encontrados).length > 0) {
      sessionStorage.setItem(KEY, JSON.stringify(encontrados));
    }
  } catch {
    // sessionStorage puede fallar (modo privado) — sin utm, no bloquea nada
  }
}

/** Agrega los utm_ guardados (si hay) a un enlace de checkout existente. */
export function conUtm(url: string): string {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return url;
    const guardados = JSON.parse(raw) as Record<string, string>;
    const u = new URL(url);
    for (const [k, v] of Object.entries(guardados)) {
      u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}
