"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import type { ShirtFilters as ShirtFiltersType, ShirtSortOption } from "@/types/shirt";

interface ShirtFiltersProps {
  filters: ShirtFiltersType;
  sort: ShirtSortOption;
  teams: string[];
  brands: string[];
  seasons: string[];
  onFiltersChange: (filters: ShirtFiltersType) => void;
  onSortChange: (sort: ShirtSortOption) => void;
}

const SORT_LABELS: Record<ShirtSortOption, string> = {
  recent: "Más recientes",
  oldest: "Más antiguas",
  team: "Equipo",
  season: "Temporada",
};

export function ShirtFilters({
  filters,
  sort,
  teams,
  brands,
  seasons,
  onFiltersChange,
  onSortChange,
}: ShirtFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.team,
    filters.brand,
    filters.season,
    filters.shirtType,
    filters.onlyFavorites ? true : null,
  ].filter(Boolean).length;

  function clearFilters() {
    onFiltersChange({ ...filters, team: null, brand: null, season: null, shirtType: null, onlyFavorites: false });
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Buscar por equipo, jugador..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="input-base pl-10"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border transition",
            open || activeCount > 0
              ? "border-accent-500 bg-accent-50 text-accent-700"
              : "border-ink-900/10 bg-white text-ink-700"
          )}
          aria-label="Filtros"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-500 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onFiltersChange({ ...filters, onlyFavorites: !filters.onlyFavorites })}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
            filters.onlyFavorites
              ? "border-favorite-500 bg-favorite-500/10 text-favorite-500"
              : "border-ink-900/10 bg-white text-ink-700"
          )}
        >
          ♥ Mis favoritas
        </button>
        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ShirtSortOption)}
          className="!h-9 w-auto shrink-0 !py-0 pr-8 text-sm"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              Ordenar: {label}
            </option>
          ))}
        </Select>
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-ink-900/[0.06] bg-white p-4">
          <Select
            label="Club/Selección"
            value={filters.team ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, team: e.target.value || null })}
          >
            <option value="">Todos</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </Select>
          <Select
            label="Marca"
            value={filters.brand ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value || null })}
          >
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
          <Select
            label="Temporada"
            value={filters.season ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, season: e.target.value || null })}
          >
            <option value="">Todas</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </Select>
          <Select
            label="Tipo"
            value={filters.shirtType ?? ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, shirtType: (e.target.value || null) as ShirtFiltersType["shirtType"] })
            }
          >
            <option value="">Todos</option>
            {Object.entries(SHIRT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 gap-1.5">
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
