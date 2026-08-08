import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { AVATAR_BUCKET, CATALOG_STORAGE_BUCKET, STORAGE_BUCKET, SIGNED_URL_EXPIRES_IN } from "@/lib/constants";
import { compressImage, generateStorageFileName } from "@/utils/image";

type Client = TypedSupabaseClient;

/**
 * Sube una foto de camiseta al bucket privado, dentro de la carpeta del
 * usuario ({userId}/...), que es lo que exigen las policies de Storage.
 * Devuelve el path guardado (no una URL: el bucket es privado).
 */
export async function uploadShirtImage(
  supabase: Client,
  userId: string,
  file: File
): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = generateStorageFileName(compressed);
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
    contentType: compressed.type || "image/webp",
  });

  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);

  return path;
}

/** Borra una foto del bucket. No lanza error si el path es invalido/ya no existe. */
export async function deleteShirtImage(supabase: Client, path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

/** Genera una signed URL temporal para poder mostrar una foto privada. */
export async function getSignedUrl(supabase: Client, path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Genera signed URLs en batch para una lista de paths (mas eficiente que
 * pedirlas una por una cuando se renderiza un grid completo).
 */
export async function getSignedUrls(
  supabase: Client,
  paths: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  if (uniquePaths.length === 0) return map;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_EXPIRES_IN);

  if (error || !data) return map;

  data.forEach((item) => {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl);
  });

  return map;
}

/**
 * Sube (o reemplaza) el avatar del usuario en el bucket publico "avatars"
 * y devuelve una URL publica lista para usar en <img>.
 */
export async function uploadAvatar(supabase: Client, userId: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = generateStorageFileName(compressed);
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
    contentType: compressed.type || "image/webp",
  });

  if (error) throw new Error(`No se pudo subir el avatar: ${error.message}`);

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}


/**
 * Sube una imagen de la biblioteca global al bucket publico "catalog-images".
 * La policy de Storage permite escribir solo a usuarios con role=admin.
 * Devuelve una URL publica persistente para guardar en catalog_shirts.image_url.
 */
export async function uploadCatalogImage(
  supabase: Client,
  userId: string,
  file: File
): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = generateStorageFileName(compressed);
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(CATALOG_STORAGE_BUCKET)
    .upload(path, compressed, {
      cacheControl: "31536000",
      upsert: false,
      contentType: compressed.type || "image/webp",
    });

  if (error) throw new Error(`No se pudo subir la imagen del catálogo: ${error.message}`);

  const { data } = supabase.storage.from(CATALOG_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
