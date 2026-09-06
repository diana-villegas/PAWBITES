// Validación de variables de entorno con zod — fail-closed (09-SEGURIDAD.md):
// la app debe CRASHEAR al arrancar si falta un secreto requerido, nunca correr
// con un valor de juguete. Import este archivo (no `process.env` directo) en
// cualquier lugar que necesite una env var del lado servidor.

import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(), // solo requerida en rutas admin/webhook
  HOTMART_HOTTOK: z.string().min(1).optional(), // solo requerida en el webhook de Hotmart
});

function cargar() {
  const parsed = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    HOTMART_HOTTOK: process.env.HOTMART_HOTTOK,
  });
  if (!parsed.success) {
    // Mensaje explícito de qué falta — mejor que un error críptico de Supabase
    // a mitad de una request.
    throw new Error(
      `Variables de entorno inválidas o faltantes: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}. Revisa .env.local contra .env.example.`
    );
  }
  return parsed.data;
}

export const env = cargar();
