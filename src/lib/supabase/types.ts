import type { createClient as createBrowserSupabaseClient } from "./client";

/**
 * Tipo unico y compartido para "un cliente de Supabase tipado con nuestro
 * Database", sin importar si viene del helper de browser (client.ts) o del
 * de server (server.ts). TODO el codigo que recibe un cliente de Supabase
 * como parametro (services/*, componentes) debe tipar ese parametro con
 * `TypedSupabaseClient`, nunca reconstruyendo `SupabaseClient<Database>` a
 * mano importando la clase desde "@supabase/supabase-js".
 *
 * Por que no se reconstruye a mano: "@supabase/ssr" declara
 * "@supabase/supabase-js" como dependencia propia. Segun como el gestor de
 * paquetes resuelva el arbol de node_modules, esa puede terminar siendo una
 * copia distinta de la que nuestro package.json instala en el nivel
 * superior. TypeScript trata la clase `SupabaseClient` como practicamente
 * nominal (tiene miembros protected/private), asi que dos copias de la
 * libreria producen dos tipos "SupabaseClient<Database>" que se ven
 * identicos pero que TypeScript considera incompatibles entre si.
 *
 * Por que se deriva de UN SOLO factory (createClient de client.ts) y no de
 * una union con el de server.ts: `createBrowserClient` y `createServerClient`
 * vienen del mismo paquete "@supabase/ssr" con el mismo `Database`, asi que
 * en runtime devuelven el mismo tipo de cliente. Unir ambos con `|` es
 * redundante y, ademas, hace que TypeScript resuelva los overloads
 * genericos de PostgREST (`.update(...)`, `.insert(...)`) contra una union
 * en vez de un tipo concreto — eso degrada la inferencia de los objetos que
 * se le pasan a esos metodos (por eso `updateProfile` fallaba con un error
 * de tipos al armar el payload de `.update()`, aunque el objeto era
 * correcto). Derivar de un solo factory evita ese problema mientras sigue
 * garantizando que el tipo coincide con lo que las factories devuelven en
 * runtime.
 */
export type TypedSupabaseClient = ReturnType<typeof createBrowserSupabaseClient>;
