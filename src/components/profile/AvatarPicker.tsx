"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { getInitials } from "@/utils/format";

interface AvatarPickerProps {
  name: string | null;
  currentUrl: string | null;
  onFileSelected: (file: File) => void;
}

export function AvatarPicker({ name, currentUrl, onFileSelected }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  return (
    <div className="relative h-24 w-24">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        id="avatar-input"
      />
      <label
        htmlFor="avatar-input"
        className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent-100 text-xl font-semibold text-accent-700 shadow-card"
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="Avatar" width={96} height={96} className="h-full w-full object-cover" unoptimized />
        ) : (
          getInitials(name)
        )}
      </label>
      <label
        htmlFor="avatar-input"
        className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink-900 text-white shadow-card"
      >
        <Camera className="h-4 w-4" />
      </label>
    </div>
  );
}
