import type { ShirtType } from "./database.types";
import type { WishlistPriority } from "./database.types";

export type { WishlistPriority };

export interface WishlistItem {
  id: string;
  userId: string;
  catalogShirtId: string | null;
  teamName: string;
  season: string | null;
  shirtType: ShirtType | null;
  playerName: string | null;
  shirtNumber: number | null;
  priority: WishlistPriority;
  notes: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistFormValues {
  teamName: string;
  season: string | null;
  shirtType: ShirtType | null;
  playerName: string | null;
  shirtNumber: number | null;
  priority: WishlistPriority;
  notes: string | null;
}

export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
  la_quiero_si_o_si: "La quiero sí o sí",
  me_interesa: "Me interesa",
  algun_dia: "Algún día",
};

export const WISHLIST_PRIORITY_ORDER: WishlistPriority[] = [
  "la_quiero_si_o_si",
  "me_interesa",
  "algun_dia",
];
