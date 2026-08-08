"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para usar dentro de Client Components.
 * Usa la anon key: la seguridad real la da RLS en la base de datos,
 * nunca hay que confiar solamente en filtros del frontend.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu archivo .env.local (ver .env.example)."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
