import type { ShirtCondition, ShirtType, ShirtVersion } from "./database.types";

export type { ShirtCondition, ShirtType, ShirtVersion };

/** Camiseta de la coleccion, tal como se usa en la UI (imageUrl ya resuelta como signed URL). */
export interface Shirt {
  id: string;
  userId: string;
  teamName: string;
  season: string;
  shirtType: ShirtType | null;
  brand: string | null;
  playerName: string | null;
  shirtNumber: number | null;
  size: string | null;
  version: ShirtVersion | null;
  condition: ShirtCondition | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: string | null;
  purchasePlace: string | null;
  notes: string | null;
  /** Path privado dentro del bucket de storage (no una URL usable directamente). */
  imagePath: string | null;
  /** Signed URL temporal, lista para usar en <img>. Puede ser null si no hay foto. */
  imageUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Datos que el formulario de "agregar/editar camiseta" produce. */
export interface ShirtFormValues {
  teamName: string;
  season: string;
  shirtType: ShirtType | null;
  brand: string | null;
  playerName: string | null;
  shirtNumber: number | null;
  size: string | null;
  version: ShirtVersion | null;
  condition: ShirtCondition | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: string | null;
  purchasePlace: string | null;
  notes: string | null;
  isFavorite: boolean;
}

export const SHIRT_TYPE_LABELS: Record<ShirtType, string> = {
  local: "Local",
  visitante: "Visitante",
  tercera: "Tercera",
  arquero: "Arquero",
  otra: "Otra",
};

export const SHIRT_VERSION_LABELS: Record<ShirtVersion, string> = {
  fan: "Fan",
  player: "Player",
  retro: "Retro",
  otra: "Otra",
};

export const SHIRT_CONDITION_LABELS: Record<ShirtCondition, string> = {
  nueva: "Nueva",
  usada: "Usada",
};

export type ShirtSortOption = "recent" | "oldest" | "team" | "season";

export interface ShirtFilters {
  search: string;
  team: string | null;
  brand: string | null;
  season: string | null;
  shirtType: ShirtType | null;
  onlyFavorites: boolean;
}
