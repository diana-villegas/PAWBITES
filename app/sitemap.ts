// /sitemap.xml real (antes 404/redirect al portero). Solo páginas públicas
// con valor de contenido para buscadores — /entrar y /onboarding son pasos
// de un flujo, no contenido indexable, así que se quedan fuera a propósito.
import type { MetadataRoute } from 'next';

const SITE = 'https://www.paw-bites.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ['', '/terminos', '/privacidad', '/reembolsos', '/aviso-nutricional'];
  return paginas.map((ruta) => ({
    url: `${SITE}${ruta}`,
    lastModified: new Date(),
  }));
}
