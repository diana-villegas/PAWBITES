// /robots.txt real (antes 404/redirect al portero). Excluye /app (la app
// interna, siempre tras login) — todo lo demás (landing, cuestionario,
// legales) es público y se puede indexar.
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/app',
    },
    sitemap: 'https://www.paw-bites.com/sitemap.xml',
  };
}
