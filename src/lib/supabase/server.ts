import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import type { CookieToSet } from "./cookies";

/**
 * Cliente de Supabase para usar en Server Components, Server Actions y
 * Route Handlers. Lee/escribe la sesion desde las cookies de Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu archivo .env.local (ver .env.example)."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` puede fallar si se llama desde un Server Component
          // (no se pueden escribir cookies fuera de Server Actions/Route
          // Handlers). El middleware ya se encarga de refrescar la sesion,
          // asi que este catch es seguro de ignorar.
        }
      },
    },
  });
}
