// Cliente ADMIN de Supabase — clave secreta (salta RLS). SOLO se importa desde
// código que corre exclusivamente en el servidor (webhooks, jobs) — NUNCA desde
// un archivo con 'use client' ni desde algo que termine en el bundle del navegador.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY falta — este cliente solo corre en rutas de servidor (webhook/admin).');
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
