// Service worker minimo para que la app sea instalable como PWA.
// A proposito NO implementa una estrategia de cache agresiva: los datos
// viven en Supabase y necesitan red para estar al dia, asi que evitamos
// servir contenido desactualizado. Solo cacheamos assets estaticos
// (iconos, manifest) para que la app abra mas rapido y de forma mas
// confiable en conexiones lentas.

const CACHE_NAME = "mis-camisetas-static-v1";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo interceptamos GETs a assets estaticos propios; todo lo demas
  // (paginas, API de Supabase) va directo a la red.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.json");

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
