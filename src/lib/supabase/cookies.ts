import type { CookieOptions } from "@supabase/ssr";

/**
 * Forma exacta que "@supabase/ssr" usa para invocar `cookies.setAll` tanto
 * en el cliente de server (server.ts) como en el de middleware
 * (middleware.ts). Se define una sola vez aca y se importa en los dos
 * lugares para que el tipado de cookies sea consistente en toda la app,
 * en vez de que cada archivo tipe (o deje de tipar) el parametro por su
 * cuenta.
 *
 * `CookieOptions` es el tipo que exporta "@supabase/ssr" para las opciones
 * de cada cookie (path, maxAge, httpOnly, sameSite, etc.), compatible con
 * lo que esperan tanto `cookies().set(...)` de next/headers como
 * `NextResponse.cookies.set(...)`.
 */
export interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}
