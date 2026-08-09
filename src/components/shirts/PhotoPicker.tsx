"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from "react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface PhotoPickerProps {
  /** URL para mostrar como preview (foto ya subida, en edición). */
  existingImageUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

export function PhotoPicker({
  existingImageUrl,
  onFileSelected,
  className,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingImageUrl ?? null
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function selectFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setPreviewUrl(objectUrl);
    setSelectedFileName(file.name);
    setIsDragging(false);
    onFileSelected(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    selectFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();

    // Evita apagar el estado cuando el cursor pasa por encima
    // de un hijo del mismo dropzone.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith("image/")
    );

    if (!file) return;

    selectFile(file);
  }

  function handleRemove(event?: MouseEvent) {
    event?.stopPropagation();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreviewUrl(null);
    setSelectedFileName(null);
    setIsDragging(false);
    onFileSelected(null);

    if (inputRef.current) inputRef.current.value = "";
  }

  function chooseAnother() {
    inputRef.current?.click();
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        id={inputId}
      />

      {!previewUrl ? (
        <label
          htmlFor={inputId}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed bg-white px-5 text-center transition",
            isDragging
              ? "scale-[1.01] border-accent-500 bg-accent-50 text-accent-700 shadow-sm"
              : "border-ink-900/15 text-ink-500 hover:border-accent-500/50 hover:bg-accent-50/40"
          )}
        >
          {isDragging ? (
            <>
              <UploadCloud className="h-9 w-9" />
              <span className="text-sm font-semibold">Soltá la foto acá</span>
              <span className="text-xs text-accent-600">
                La imagen quedará lista para subir
              </span>
            </>
          ) : (
            <>
              <Camera className="h-8 w-8" />
              <span className="text-sm font-semibold text-ink-700">
                Arrastrá una foto acá
              </span>
              <span className="text-xs text-ink-300">
                o tocá para elegir una imagen
              </span>
              <span className="mt-1 flex items-center gap-1 text-xs text-ink-300">
                <ImagePlus className="h-3.5 w-3.5" />
                Cámara, galería o archivo
              </span>
            </>
          )}
        </label>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-accent-500/25 bg-white shadow-sm">
          <div className="relative aspect-[4/5] w-full bg-cream-100">
            {/* object URLs no necesitan optimización de Next/Image y <img> evita previews rotas en mobile */}
            <img
              src={previewUrl}
              alt="Vista previa de la camiseta"
              className="h-full w-full object-contain"
            />

            <button
              type="button"
              onClick={handleRemove}
              aria-label="Quitar foto"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/75 text-white shadow backdrop-blur"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Foto lista
              </div>

              <p className="mt-0.5 truncate text-xs text-ink-300">
                {selectedFileName ?? "Imagen actual"}
              </p>
            </div>

            <button
              type="button"
              onClick={chooseAnother}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-900/10 px-3 py-2 text-xs font-medium text-ink-700 transition hover:bg-cream-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Cambiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
