import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplicar el middleware a todas las rutas excepto:
     * - archivos estaticos de Next (_next/static, _next/image)
     * - favicon, manifest, iconos y el service worker (deben ser publicos
     *   para que el navegador pueda instalar la PWA sin sesion)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
