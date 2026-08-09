"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Shirt as ShirtIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShirtGridSkeleton } from "@/components/ui/Skeleton";
import { ShirtCard } from "@/components/shirts/ShirtCard";
import { ShirtFilters } from "@/components/shirts/ShirtFilters";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import {
  filterAndSortShirts,
  listShirts,
  toggleFavorite,
} from "@/services/shirts";
import type {
  Shirt,
  ShirtFilters as ShirtFiltersType,
  ShirtSortOption,
} from "@/types/shirt";

const EMPTY_FILTERS: ShirtFiltersType = {
  search: "",
  team: null,
  brand: null,
  season: null,
  shirtType: null,
  onlyFavorites: false,
};

export default function ColeccionPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [shirts, setShirts] = useState<Shirt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ShirtFiltersType>(EMPTY_FILTERS);
  const [sort, setSort] = useState<ShirtSortOption>("recent");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const data = await listShirts(supabase, user.id);
        if (active) setShirts(data);
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar tu colección.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const { teams, brands, seasons } = useMemo(() => {
    const teamSet = new Set<string>();
    const brandSet = new Set<string>();
    const seasonSet = new Set<string>();
    shirts.forEach((s) => {
      teamSet.add(s.teamName);
      if (s.brand) brandSet.add(s.brand);
      seasonSet.add(s.season);
    });
    return {
      teams: Array.from(teamSet).sort(),
      brands: Array.from(brandSet).sort(),
      seasons: Array.from(seasonSet).sort().reverse(),
    };
  }, [shirts]);

  const filtered = useMemo(
    () => filterAndSortShirts(shirts, { filters, sort }),
    [shirts, filters, sort]
  );

  async function handleToggleFavorite(shirt: Shirt) {
    const next = !shirt.isFavorite;
    setShirts((prev) =>
      prev.map((s) => (s.id === shirt.id ? { ...s, isFavorite: next } : s))
    );
    try {
      const supabase = createClient();
      await toggleFavorite(supabase, shirt.id, next);
    } catch (error) {
      setShirts((prev) =>
        prev.map((s) => (s.id === shirt.id ? { ...s, isFavorite: !next } : s))
      );
      showError(error instanceof Error ? error.message : "No se pudo actualizar favorita.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Colección"
        subtitle={loading ? undefined : `${shirts.length} camisetas`}
        action={
          !loading ? (
            <Link href="/agregar">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Agregar camiseta
              </Button>
            </Link>
          ) : undefined
        }
      />

      {!loading && shirts.length > 0 && (
        <ShirtFilters
          filters={filters}
          sort={sort}
          teams={teams}
          brands={brands}
          seasons={seasons}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      )}

      {loading && <ShirtGridSkeleton count={8} />}

      {!loading && shirts.length === 0 && (
        <EmptyState
          icon={<ShirtIcon className="h-10 w-10" strokeWidth={1.5} />}
          title="Tu colección está vacía."
          description="Agregá tu primera camiseta para empezar a armar tu colección."
          action={
            <Link href="/agregar">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Agregar camiseta
              </Button>
            </Link>
          }
        />
      )}

      {!loading && shirts.length > 0 && filtered.length === 0 && (
        <EmptyState
          title="No encontramos camisetas con esos filtros."
          description="Probá cambiar la búsqueda o limpiar los filtros."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((shirt) => (
            <ShirtCard key={shirt.id} shirt={shirt} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
