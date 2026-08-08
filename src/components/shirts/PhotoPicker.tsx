"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, X, ImagePlus } from "lucide-react";
import { cn } from "@/utils/cn";

interface PhotoPickerProps {
  /** URL para mostrar como preview (foto ya subida, en edicion). */
  existingImageUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

/**
 * Selector de foto unico: en mobile, el input file con accept="image/*"
 * ya le ofrece al usuario elegir entre camara y galeria de forma nativa
 * (tanto en iOS Safari como en Chrome Android), asi que no hace falta
 * duplicar botones para cada origen.
 */
export function PhotoPicker({ existingImageUrl, onFileSelected, className }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelected(file);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setPreviewUrl(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        id="shirt-photo-input"
      />
      <label
        htmlFor="shirt-photo-input"
        className={cn(
          "flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-ink-900/15 bg-white text-ink-500 transition hover:border-accent-500/50",
          previewUrl && "border-solid border-transparent p-0"
        )}
      >
        {previewUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={previewUrl}
              alt="Foto de la camiseta"
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <>
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">Agregar foto</span>
            <span className="flex items-center gap-1 text-xs text-ink-300">
              <ImagePlus className="h-3.5 w-3.5" />
              Cámara o galería
            </span>
          </>
        )}
      </label>

      {previewUrl && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Quitar foto"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/70 text-white backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
