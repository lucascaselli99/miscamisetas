"use client";

import { Heart } from "lucide-react";
import { cn } from "@/utils/cn";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ isFavorite, onToggle, size = "md", className }: FavoriteButtonProps) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Quitar de favoritas" : "Marcar como favorita"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition active:scale-90",
        dimension,
        className
      )}
    >
      <Heart
        className={cn(
          iconSize,
          isFavorite ? "fill-favorite-500 text-favorite-500" : "text-ink-500"
        )}
      />
    </button>
  );
}
