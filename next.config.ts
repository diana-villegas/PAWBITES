import type { NextConfig } from "next";

// Cabeceras de seguridad básicas (09-SEGURIDAD.md) — probadas localmente contra
// cada pantalla (landing, cuestionario, Hoy/Plan/Lista/Perfil) antes de subir.
// La CSP solo permite lo que la app YA usa de verdad: Supabase (datos/auth),
// el Pixel de Meta (script + beacon de medición) y los propios assets de Next.
// 'unsafe-inline' en script-src es el único punto flojo — lo necesita el script
// de arranque del Pixel (next/script inline); nada más la usa. Hotmart nunca
// se carga como recurso (son enlaces normales, el pago pasa a pay.hotmart.com).
// El Pixel manda su beacon de medición por FORM POST y también abre un iframe
// propio a facebook.com (no solo el <img>/fetch que se veía a simple vista) —
// confirmado probando la landing con la consola abierta: sin estos 2 permisos
// extra, el navegador bloqueaba esos 2 mecanismos del Pixel (defecto real,
// corregido antes de subir). 'unsafe-eval' SOLO en desarrollo: lo pide React
// para las herramientas de depuración, nunca lo usa en producción.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://connect.facebook.net${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.facebook.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://www.facebook.com https://connect.facebook.net",
  "frame-src https://www.facebook.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.facebook.com",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
