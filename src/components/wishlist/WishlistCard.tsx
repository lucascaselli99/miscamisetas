"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { WishlistItem } from "@/types/wishlist";
import { WISHLIST_PRIORITY_LABELS } from "@/types/wishlist";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import { Badge } from "@/components/ui/Badge";

const PRIORITY_BADGE_VARIANT: Record<WishlistItem["priority"], "favorite" | "accent" | "neutral"> = {
  la_quiero_si_o_si: "favorite",
  me_interesa: "accent",
  algun_dia: "neutral",
};

export function WishlistCard({ item }: { item: WishlistItem }) {
  return (
    <Link
      href={`/wishlist/${item.id}`}
      className="flex gap-3 rounded-2xl border border-ink-900/[0.06] bg-white p-3 shadow-card transition active:scale-[0.99]"
    >
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.teamName} fill sizes="64px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
        <p className="truncate font-semibold text-ink-900">{item.teamName}</p>
        <p className="truncate text-xs text-ink-500">
          {[item.season, item.shirtType ? SHIRT_TYPE_LABELS[item.shirtType] : null]
            .filter(Boolean)
            .join(" · ") || "Sin más datos"}
        </p>
        <Badge variant={PRIORITY_BADGE_VARIANT[item.priority]} className="w-fit">
          {WISHLIST_PRIORITY_LABELS[item.priority]}
        </Badge>
      </div>
    </Link>
  );
}
