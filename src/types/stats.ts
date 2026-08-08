export interface MonthlyCount {
  /** Formato "YYYY-MM" */
  month: string;
  label: string;
  count: number;
}

export interface DistributionItem {
  label: string;
  count: number;
}

export interface CollectionStats {
  totalShirts: number;
  addedThisMonth: number;
  addedThisYear: number;
  favoritesCount: number;
  wishlistCount: number;
  topTeam: DistributionItem | null;
  topBrand: DistributionItem | null;
  topType: DistributionItem | null;
  totalSpent: number;
  spentThisMonth: number;
  /** true si al menos una camiseta tiene purchase_price cargado */
  hasPriceData: boolean;
  /** true si al menos una camiseta tiene purchase_date cargado */
  hasDateData: boolean;
  addedByMonth: MonthlyCount[];
  byBrand: DistributionItem[];
  byTeam: DistributionItem[];
}
