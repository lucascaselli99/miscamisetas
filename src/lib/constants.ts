export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "shirts";

/** Bucket publico para imagenes de la biblioteca global. Solo admins escriben. */
export const CATALOG_STORAGE_BUCKET = "catalog-images";

/** Bucket publico (solo lectura) para avatars de perfil. */
export const AVATAR_BUCKET = "avatars";

/** Cuanto dura una signed URL de foto antes de tener que regenerarla (segundos). */
export const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24; // 24hs
