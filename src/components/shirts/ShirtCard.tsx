"use client";

import Image from "next/image";
import Link from "next/link";
import { Shirt as ShirtIcon } from "lucide-react";
import type { Shirt } from "@/types/shirt";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface ShirtCardProps {
  shirt: Shirt;
  onToggleFavorite?: (shirt: Shirt) => void;
}

export function ShirtCard({ shirt, onToggleFavorite }: ShirtCardProps) {
  return (
    <Link
      href={`/coleccion/${shirt.id}`}
      className="group flex flex-col gap-2 rounded-2xl transition active:scale-[0.98]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-cream-200 shadow-card">
        {shirt.imageUrl ? (
          <Image
            src={shirt.imageUrl}
            alt={`Camiseta de ${shirt.teamName}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <ShirtIcon className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}

        {onToggleFavorite && (
          <FavoriteButton
            isFavorite={shirt.isFavorite}
            onToggle={() => onToggleFavorite(shirt)}
            size="sm"
            className="absolute right-2 top-2"
          />
        )}
      </div>

      <div className="px-0.5">
        <p className="truncate text-sm font-semibold text-ink-900">{shirt.teamName}</p>
        <p className="truncate text-xs text-ink-500">
          {shirt.season}
          {shirt.shirtType && ` · ${SHIRT_TYPE_LABELS[shirt.shirtType]}`}
        </p>
        {(shirt.playerName || shirt.shirtNumber) && (
          <p className="truncate text-xs text-ink-300">
            {[shirt.playerName, shirt.shirtNumber ? `#${shirt.shirtNumber}` : null]
              .filter(Boolean)
              .join(" ")}
          </p>
        )}
      </div>
    </Link>
  );
}
