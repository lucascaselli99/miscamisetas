"use client";

import { useEffect } from "react";

/** Registra el service worker para que la app sea instalable como PWA. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker", error);
    });
  }, []);

  return null;
}
