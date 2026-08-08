import type { Shirt } from "@/types/shirt";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import type { CollectionStats, DistributionItem, MonthlyCount } from "@/types/stats";

function topOf(items: DistributionItem[]): DistributionItem | null {
  if (items.length === 0) return null;
  return items.reduce((max, item) => (item.count > max.count ? item : max), items[0]);
}

function distributionBy(shirts: Shirt[], getKey: (s: Shirt) => string | null): DistributionItem[] {
  const counts = new Map<string, number>();
  for (const shirt of shirts) {
    const key = getKey(shirt);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** Calcula todas las estadisticas de la coleccion en memoria, a partir de
 * las camisetas ya cargadas. Funciona bien aunque falten precio/fecha de
 * compra en algunas (o todas) las camisetas. */
export function computeStats(shirts: Shirt[], wishlistCount: number): CollectionStats {
  const now = new Date();
  const currentYear = now.getFullYear();

  const addedThisMonth = shirts.filter((s) => {
    const d = new Date(s.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const addedThisYear = shirts.filter((s) => new Date(s.createdAt).getFullYear() === currentYear).length;

  const favoritesCount = shirts.filter((s) => s.isFavorite).length;

  const shirtsWithPrice = shirts.filter((s) => typeof s.purchasePrice === "number");
  const hasPriceData = shirtsWithPrice.length > 0;
  const totalSpent = shirtsWithPrice.reduce((sum, s) => sum + (s.purchasePrice ?? 0), 0);

  const spentThisMonth = shirtsWithPrice
    .filter((s) => {
      const dateSource = s.purchaseDate ?? s.createdAt;
      const d = new Date(dateSource);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, s) => sum + (s.purchasePrice ?? 0), 0);

  const hasDateData = shirts.some((s) => Boolean(s.purchaseDate));

  const byTeam = distributionBy(shirts, (s) => s.teamName);
  const byBrand = distributionBy(shirts, (s) => s.brand);
  const byType = distributionBy(shirts, (s) => (s.shirtType ? SHIRT_TYPE_LABELS[s.shirtType] : null));

  // Agregado por mes usando fecha de compra si existe, si no fecha de carga.
  const monthCounts = new Map<string, number>();
  for (const shirt of shirts) {
    const dateSource = shirt.purchaseDate ?? shirt.createdAt;
    const d = new Date(dateSource);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }

  const addedByMonth: MonthlyCount[] = Array.from(monthCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => {
      const [year, monthNum] = month.split("-").map(Number);
      const label = new Intl.DateTimeFormat("es-AR", { month: "short", year: "2-digit" }).format(
        new Date(Date.UTC(year, monthNum - 1, 1))
      );
      return { month, label, count };
    });

  return {
    totalShirts: shirts.length,
    addedThisMonth,
    addedThisYear,
    favoritesCount,
    wishlistCount,
    topTeam: topOf(byTeam),
    topBrand: topOf(byBrand),
    topType: topOf(byType),
    totalSpent,
    spentThisMonth,
    hasPriceData,
    hasDateData,
    addedByMonth,
    byBrand: byBrand.slice(0, 8),
    byTeam: byTeam.slice(0, 8),
  };
}
