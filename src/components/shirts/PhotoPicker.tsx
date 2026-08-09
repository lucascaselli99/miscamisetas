"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ImagePlus, RefreshCw, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface PhotoPickerProps {
  /** URL para mostrar como preview (foto ya subida, en edición). */
  existingImageUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

export function PhotoPicker({ existingImageUrl, onFileSelected, className }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setSelectedFileName(file.name);
    onFileSelected(file);
  }

  function handleRemove(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setSelectedFileName(null);
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
        id="shirt-photo-input"
      />

      {!previewUrl ? (
        <label
          htmlFor="shirt-photo-input"
          className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-ink-900/15 bg-white text-ink-500 transition hover:border-accent-500/50"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm font-medium">Agregar foto</span>
          <span className="flex items-center gap-1 text-xs text-ink-300">
            <ImagePlus className="h-3.5 w-3.5" />
            Cámara o galería
          </span>
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
