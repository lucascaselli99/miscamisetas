import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 1;
const MAX_WIDTH_OR_HEIGHT = 1600;

/**
 * Comprime y redimensiona una imagen en el navegador antes de subirla a
 * Supabase Storage, para no gastar almacenamiento innecesario.
 * Corre 100% client-side (Web Worker interno de la libreria).
 */
export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.82,
    });
  } catch (error) {
    console.error("No se pudo comprimir la imagen, se sube el original", error);
    return file;
  }
}

/** Extension segura para el nombre de archivo final, en base al tipo comprimido. */
export function getFileExtension(file: File): string {
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  const fromName = file.name.split(".").pop();
  return fromName ? fromName.toLowerCase() : "jpg";
}

/** Genera un nombre de archivo unico para evitar colisiones en el bucket. */
export function generateStorageFileName(file: File): string {
  const ext = getFileExtension(file);
  const random = crypto.randomUUID();
  return `${random}.${ext}`;
}
