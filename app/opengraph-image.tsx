// Imagen de vista previa al compartir (WhatsApp, redes) — 1200×630, logo +
// titular de la marca. Colores de FICHA-ARTE.md (CREMA/TINTA/CORAL, iguales
// a los que ya usan los correos en lib/email/templates.ts).
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OG_CORAL, OG_CREMA, OG_TINTA } from '@/lib/og-colors';

export const runtime = 'nodejs';
export const alt = 'PawBites — El plato exacto de tu perro, en gramos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          background: OG_CREMA,
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={120} height={120} style={{ borderRadius: 28 }} />
        {/* Satori (el motor de next/og) no hace wrap de texto normal mezclado
            con un <span> dentro de un flex — cada palabra como su propio
            flex item con flexWrap evita que se encimen (defecto real,
            corregido antes de subir: ver captura en el reporte de cierre). */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 820,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.15,
            color: OG_TINTA,
          }}
        >
          {['El', 'plato'].map((p) => (
            <span key={p} style={{ marginRight: 20 }}>{p}</span>
          ))}
          <span style={{ color: OG_CORAL, marginRight: 20 }}>exacto</span>
          {['de', 'tu', 'perro,', 'en', 'gramos'].map((p) => (
            <span key={p} style={{ marginRight: 20 }}>{p}</span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
