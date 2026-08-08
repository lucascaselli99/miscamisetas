# Mis Camisetas

**Mis Camisetas** es una aplicación web para coleccionistas de camisetas de fútbol. Permite crear una cuenta, cargar y gestionar tu colección personal de camisetas, mantener una wishlist de las que todavía no tenés, y ver estadísticas básicas de tu colección. Está pensada mobile-first y se puede instalar como PWA en Android, iPhone y escritorio.

## Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS
- **Backend / Base de datos / Auth / Storage:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Hosting:** Vercel
- **PWA:** manifest + service worker, instalable en Android, iPhone y desktop

## ⚠️ Nota sobre este entorno de generación

Este proyecto fue generado en un entorno aislado sin acceso a los registries de npm, así que **no se pudo correr `npm install` ni `npm run build`** para verificar la compilación automáticamente. El código fue escrito a mano con mucho cuidado (tipos, imports, convenciones de Next.js/Supabase), pero **lo primero que tenés que hacer al bajar el proyecto es correr `npm install` y `npm run build`** para confirmar que todo compila en tu máquina, y avisarme si aparece algún error para corregirlo.

### Nota de mantenimiento: error de tipos de `SupabaseClient` (resuelto)

Si venís de un build que falló con un error de TypeScript del estilo *"el cliente creado con `createClient()` está tipado como `SupabaseClient<Database,...>` incompatible"* al pasarlo a `uploadShirtImage`/`createShirt`/etc.: era un problema real, ya corregido.

Causa: `@supabase/ssr` (que expone `createBrowserClient`/`createServerClient`) declara `@supabase/supabase-js` como su propia dependencia interna. Según cómo resuelva el árbol `node_modules`, esa puede terminar siendo una copia distinta de la que el `package.json` del proyecto instalaba en el nivel superior. La clase `SupabaseClient` tiene miembros `protected`/`private`, así que TypeScript trata dos copias de la librería como tipos incompatibles aunque se vean idénticos — el `SupabaseClient<Database>` reconstruido a mano en cada `service` (importando la clase desde `@supabase/supabase-js` directamente) podía no coincidir con lo que `createClient()` devolvía en runtime.

Solución aplicada:

- Se quitó `@supabase/supabase-js` como dependencia directa de `package.json` (queda solo `@supabase/ssr`, que ya la trae).
- Se creó `src/lib/supabase/types.ts`, que exporta `TypedSupabaseClient` derivado con `ReturnType`/`Awaited` directamente de `createClient()` (browser) y `createClient()` (server) — nunca reconstruido a mano.
- Todos los `services/*.ts` (`shirts.ts`, `wishlist.ts`, `storage.ts`, `profile.ts`) usan ese único tipo (`type Client = TypedSupabaseClient`) en vez de construir su propio `SupabaseClient<Database>`.

Con esto no hay forma de que el tipo del parámetro diverja del tipo real que devuelven las factories, sin usar `any` ni desactivar chequeos de TypeScript.

### Nota de mantenimiento: `cookiesToSet` con tipo implícito `any` (resuelto)

Si venís de un build que falló con *"Parameter 'cookiesToSet' implicitly has an 'any' type"* en `src/lib/supabase/middleware.ts` (o en `server.ts`): también era un problema real, ya corregido.

Causa: `@supabase/ssr` tipa la opción `cookies` de `createServerClient` con un tipo que, para mantener compatibilidad con su API vieja (`get`/`set`/`remove`) y la nueva (`getAll`/`setAll`), termina siendo una unión de formas posibles. TypeScript no logra "fluir" el tipado contextual de un parámetro a través de una unión así, por lo que el parámetro `cookiesToSet` del método `setAll(cookiesToSet) { ... }` (definido como método dentro del objeto literal que se le pasa a `createServerClient`) se queda sin tipo inferido — de ahí el `implicitly has an 'any' type` bajo `strict`/`noImplicitAny`. Es una limitación conocida de TypeScript con tipos union en posiciones contextuales, no un error nuestro de lógica.

Solución aplicada:

- Se creó `src/lib/supabase/cookies.ts`, que define `CookieToSet` (`{ name: string; value: string; options: CookieOptions }`), usando `CookieOptions` — el tipo que exporta `@supabase/ssr` para las opciones de una cookie (`path`, `maxAge`, `httpOnly`, `sameSite`, etc.), compatible tanto con `cookies().set(...)` de `next/headers` como con `NextResponse.cookies.set(...)`.
- `src/lib/supabase/server.ts` y `src/lib/supabase/middleware.ts` — los dos únicos lugares que arman manualmente el objeto `cookies: { getAll, setAll }` — tipan explícitamente `setAll(cookiesToSet: CookieToSet[])` importando ese mismo tipo desde `cookies.ts`, en vez de dejar que cada archivo dependa de la inferencia contextual (que es justamente la que falla).

Con el parámetro anotado explícitamente, TypeScript ya no necesita resolver el tipo desde la unión de `@supabase/ssr` — usa el tipo declarado directamente. Igual que con el fix anterior, sin `any` y sin desactivar ningún chequeo.

### Nota de mantenimiento: error de tipos en `updateProfile` / `.update()` (resuelto)

Si venís de un build que compiló ("Compiled successfully") pero falló en el paso de chequeo de tipos con un error en `src/services/profile.ts` del estilo *"Argument of type '{ avatar_url?: ...; display_name?: ... }' is not assignable to parameter of type ..."* dentro del `.update({...})` de `updateProfile`: también era un problema real, ya corregido.

Causa (dos factores combinados):

1. `src/lib/supabase/types.ts` definía `TypedSupabaseClient` como una **unión** entre el tipo del cliente de browser y el de server (`ReturnType<...> | Awaited<ReturnType<...>>`). Aunque en runtime ambos son el mismo tipo de cliente (los dos vienen de `@supabase/ssr` con el mismo `Database`), tenerlos unidos con `|` hacía que TypeScript resolviera los overloads genéricos de PostgREST (`.update(...)`, `.insert(...)`) contra una unión en vez de un tipo concreto, lo que degrada la inferencia.
2. `updateProfile` armaba el objeto para `.update(...)` con spreads condicionales (`...(cond ? { campo: valor } : {})`). Con ese patrón, TypeScript infiere una unión de las formas posibles del objeto resultante, y combinado con el punto (1) no lograba angostar esa unión contra el tipo `Update` esperado — de ahí el error, aunque el objeto en sí era perfectamente válido en runtime.

Solución aplicada:

- `src/lib/supabase/types.ts`: se sacó la unión. `TypedSupabaseClient` ahora se deriva de un solo factory (`createClient` de `client.ts`), ya que browser y server devuelven el mismo tipo de cliente en runtime — unirlos era redundante y perjudicaba la inferencia de los métodos genéricos.
- `src/services/profile.ts`: `updateProfile` ahora arma el payload de forma imperativa contra el tipo `Database["public"]["Tables"]["profiles"]["Update"]` explícito (mismo patrón que ya usaban `updateShirt` en `shirts.ts` y `updateWishlistItem` en `wishlist.ts`), en vez de con spreads condicionales:

  ```ts
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  ```

Sin `any` y sin desactivar ningún chequeo de TypeScript.

### Nota de mantenimiento: `.update(payload)` seguía sin tipar bien en `profile.ts` (mitigación aplicada)

Después del fix anterior, el build volvió a fallar, pero un paso más adelante: ya no en el objeto `payload` en sí (eso se resolvió), sino en la llamada `.update(payload)` de `src/services/profile.ts`, con TypeScript indicando que `payload` no es asignable al tipo que espera `.update(...)` para la tabla `profiles`.

Esto es importante como dato: significa que el objeto `payload` está bien tipado (coincide exactamente con `Database["public"]["Tables"]["profiles"]["Update"]`), pero el tipo que **PostgREST/`@supabase/supabase-js` infiere internamente** para el parámetro de `.update()` — a partir de los generics del cliente (`SupabaseClient<Database, "public", ...>`) — no está terminando de coincidir con eso, aun cuando estructuralmente deberían ser el mismo tipo.

Se aplicaron dos cambios, uno defensivo y otro que ataca la causa más probable:

1. **Alias de tipo nombrados**: en vez de escribir el "indexed access type" completo inline en cada firma (`Database["public"]["Tables"]["profiles"]["Update"]`), ahora cada `service` declara un alias una sola vez (`type ProfileUpdate = ...`, `type ShirtInsert = ...`, `type ShirtUpdate = ...`, `type WishlistInsert = ...`, `type WishlistUpdate = ...`) y lo usa en todas las llamadas a `.insert()`/`.update()`, incluyendo `toggleFavorite` en `shirts.ts` (que antes pasaba un objeto literal directo sin pasar por una variable tipada). Esto no cambia el tipo resultante, pero reduce cuánto tiene que recalcular TypeScript cada vez que resuelve el tipo contra los overloads genéricos de PostgREST.

2. **Versiones ancladas de los paquetes de Supabase** (el cambio más importante): `@supabase/ssr` pasó de `^0.5.1` a `0.5.1` exacto, y se agregó en `package.json`:

   ```json
   "overrides": {
     "@supabase/supabase-js": "2.45.1"
   }
   ```

   Motivo: este proyecto se generó en un entorno con fecha de conocimiento limitada (mediados de 2025), pero vos lo instalás con `npm install` en la fecha real de hoy. `@supabase/ssr@0.5.1` depende internamente de `@supabase/supabase-js` con un rango `^2.45.1`, así que sin anclar versión, `npm install` te va a traer la **última** versión de `@supabase/supabase-js` que exista en ese momento — que puede ser mucho más nueva que la que yo conozco, y que puede haber cambiado convenciones de tipado de `Database` (esto pasó antes en la librería, p. ej. cuando se separaron `Insert`/`Update` de `Row`, o cuando se agregó el marcador `__InternalSupabase`). Un cambio así, en una versión que nunca pude ver, explicaría un error de tipos que aparece pese a que el `payload` está objetivamente bien tipado según todo lo que puedo verificar. Anclar la versión exacta a `2.45.1` (la versión mínima que `@supabase/ssr@0.5.1` ya declara como compatible) fija el proyecto a una combinación de versiones que sí conozco bien y sobre la que este patrón de tipado (`Database` con `Row`/`Insert`/`Update`/`Relationships` por tabla) funciona correctamente.

**Importante:** no pude correr `npm install` ni `npm run build` en este entorno (sin acceso a los registries), así que esta sigue siendo una mitigación razonada, no verificada por mí con el compilador real. Si después de este cambio el error persiste, pegame el **texto completo y exacto** del error de Vercel (no resumido) — en particular la parte que compara "Type X is not assignable to type Y" completa, con los dos tipos completos — porque con eso puedo comparar campo por campo en vez de tener que inferir la causa a ciegas.

## 1. Estructura del proyecto

```
mis-camisetas/
├── src/
│   ├── app/                    # Rutas (App Router)
│   │   ├── (auth)/             # Login / registro (layout sin nav)
│   │   ├── (app)/              # App protegida (dashboard, colección, etc.)
│   │   ├── auth/callback/      # Callback de confirmación de email
│   │   ├── layout.tsx          # Layout raíz (fuentes, PWA, toasts)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Design system (Button, Input, Card, etc.)
│   │   ├── layout/              # Nav, AuthProvider, shell
│   │   ├── shirts/              # Componentes de camisetas
│   │   ├── wishlist/            # Componentes de wishlist
│   │   ├── stats/               # Gráficos y stat tiles
│   │   └── profile/             # Avatar, cambio de contraseña
│   ├── services/                # Toda la lógica de acceso a Supabase
│   ├── lib/supabase/            # Clientes de Supabase (browser/server/middleware)
│   ├── types/                   # Tipos TypeScript (incluye el esquema de DB)
│   ├── utils/                   # Helpers (formato, validación, imágenes)
│   └── hooks/
├── supabase/
│   ├── schema.sql               # Tablas, triggers, índices
│   ├── policies.sql             # Row Level Security
│   └── storage.sql              # Buckets y políticas de Storage
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
└── middleware.ts                # Protección de rutas + refresh de sesión
```

## 2. Instalar dependencias

Requisitos: Node.js 18.18 o superior.

```bash
npm install
```

## 3. Crear y configurar el proyecto de Supabase

1. Entrá a [supabase.com](https://supabase.com), creá una cuenta si no tenés, y creá un **nuevo proyecto**.
2. Guardá la contraseña de la base de datos en un lugar seguro.
3. Andá a **Project Settings > API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Crear las tablas

Andá a **SQL Editor** en el dashboard de Supabase y corré, **en este orden**, el contenido de:

1. `supabase/schema.sql` — crea las tablas `profiles`, `shirts`, `wishlist`, `subscriptions`, los índices y los triggers (incluyendo el que crea automáticamente el perfil y la suscripción FREE cuando alguien se registra).
2. `supabase/policies.sql` — activa Row Level Security y crea las políticas.
3. `supabase/storage.sql` — crea las políticas de Storage (ver paso siguiente para crear los buckets primero).

Podés pegar cada archivo completo en el SQL Editor y darle "Run". Los scripts son seguros de volver a correr (usan `if not exists` / `drop policy if exists`).

### Tablas creadas

- **profiles**: perfil de cada usuario (nombre, avatar, rol). Se crea sola al registrarse.
- **shirts**: la colección personal. Campos obligatorios: `team_name`, `season`. Todo lo demás es opcional.
- **wishlist**: camisetas deseadas, con prioridad (`la_quiero_si_o_si`, `me_interesa`, `algun_dia`).
- **subscriptions**: preparada para planes futuros (FREE/PRO, Mercado Pago, PayPal). Hoy todos los usuarios quedan en `FREE` automáticamente.

## 5. Crear los buckets de Storage

Andá a **Storage** en el dashboard de Supabase y creá dos buckets:

| Bucket | Público | Uso |
|---|---|---|
| `shirts` | **No** (privado) | Fotos de las camisetas. Solo el dueño puede ver/subir/borrar sus fotos (vía signed URLs generadas por la app). |
| `avatars` | Sí (público) | Fotos de perfil. Lectura pública, escritura restringida al dueño. |

Después de crear los buckets, corré `supabase/storage.sql` (si todavía no lo corriste) para aplicar las políticas de acceso.

> Si preferís crear los buckets por SQL en vez del Dashboard, `storage.sql` tiene los `insert` comentados listos para descomentar.

## 6. Variables de entorno

Copiá `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Y completá:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=shirts
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Nunca subas `.env.local` al repositorio** (ya está en `.gitignore`).

## 7. Correr localmente

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Antes de dar por terminada cualquier tarea, corré también:

```bash
npm run build
```

para confirmar que el proyecto compila sin errores de TypeScript/Next.

## 8. Publicar en Vercel

1. Subí el proyecto a un repositorio de GitHub/GitLab.
2. Entrá a [vercel.com](https://vercel.com) → **New Project** → importá el repositorio.
3. En **Environment Variables**, cargá las mismas variables de `.env.local` (con `NEXT_PUBLIC_SITE_URL` apuntando a tu dominio de producción, ej. `https://mis-camisetas.vercel.app`).
4. Deploy.
5. En Supabase, andá a **Authentication > URL Configuration** y agregá tu dominio de Vercel a las **Redirect URLs** (necesario para la confirmación de email).

## 9. Instalar la app como PWA

**Android (Chrome):**
1. Abrí la app en Chrome.
2. Tocá el menú (⋮) → **"Instalar app"** o **"Agregar a pantalla de inicio"**.
3. Confirmá. El ícono va a aparecer como una app más en el celular.

**iPhone (Safari):**
1. Abrí la app en Safari (tiene que ser Safari, no Chrome).
2. Tocá el botón de compartir (el cuadrado con flecha hacia arriba).
3. Elegí **"Agregar a pantalla de inicio"**.
4. Confirmá el nombre y tocá **"Agregar"**.

**Desktop (Chrome/Edge):**
1. Abrí la app.
2. En la barra de direcciones vas a ver un ícono de instalación (⊕ o similar).
3. Hacé clic e instalá.

Una vez instalada, la app abre en modo standalone (sin la barra del navegador), como cualquier otra app.

## 10. Seguridad

Toda la seguridad real está en la base de datos, no en el frontend:

- **Row Level Security (RLS)** activado en `profiles`, `shirts`, `wishlist` y `subscriptions`. Cada usuario solo puede ver/crear/editar/borrar sus propias filas (`auth.uid() = user_id`).
- **Storage**: las políticas de `storage.objects` restringen la escritura al propio usuario usando la convención de carpetas `{user_id}/archivo`. El bucket de camisetas es privado (se accede vía signed URLs con expiración); el de avatars es de lectura pública pero escritura restringida.
- El campo `role` en `profiles` (`user` / `admin`) está preparado para un futuro panel de administrador, que todavía no está construido.

## 11. Qué falta a propósito (V1)

Para no complicar el MVP, estas funciones están **contempladas en el diseño de datos pero no implementadas todavía**:

- Panel de administrador
- Pagos (Mercado Pago / PayPal) y plan PRO — la tabla `subscriptions` ya está lista para esto
- Perfiles públicos / compartir colección / seguir usuarios
- Reconocimiento de camisetas con IA
- Wrapped anual
- Intercambio de camisetas / marketplace
- Notificaciones

Ninguna decisión técnica actual debería complicar agregarlas más adelante.

## 12. Flujo principal (MVP) a validar

1. Un usuario se registra.
2. Inicia sesión.
3. Agrega una camiseta (con foto).
4. La foto se sube comprimida a Supabase Storage.
5. La camiseta aparece en su colección.
6. La puede abrir, editar, marcar como favorita y eliminar.
7. Puede agregar camisetas a su wishlist.
8. Puede pasar un ítem de la wishlist a su colección.
9. Puede ver sus estadísticas.

Este flujo es la prioridad absoluta antes de sumar cualquier función adicional.

## V2.1 - Subida directa de imágenes del catálogo

El panel `/admin/catalogo` permite elegir una foto desde el dispositivo. La imagen se comprime en el navegador y se guarda en el bucket público `catalog-images` de Supabase Storage. Solo los perfiles con `role = admin` tienen permisos de escritura.

Antes de usar la subida directa, ejecutar una vez en Supabase SQL Editor:

`supabase/catalog_storage_migration.sql`
Actualización V2 catálogo
