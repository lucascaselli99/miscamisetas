"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, CalendarPlus, Heart, Bookmark, ArrowRight, Plus, Shirt as ShirtIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCardSkeleton, ShirtGridSkeleton } from "@/components/ui/Skeleton";
import { StatTile } from "@/components/stats/StatTile";
import { ShirtCard } from "@/components/shirts/ShirtCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { listShirts, toggleFavorite } from "@/services/shirts";
import { listWishlist } from "@/services/wishlist";
import { computeStats } from "@/services/stats";
import type { Shirt } from "@/types/shirt";
import type { CollectionStats } from "@/types/stats";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { showError } = useToast();
  const [shirts, setShirts] = useState<Shirt[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const [shirtsData, wishlist] = await Promise.all([
          listShirts(supabase, user.id),
          listWishlist(supabase, user.id),
        ]);
        if (!active) return;
        setShirts(shirtsData);
        setStats(computeStats(shirtsData, wishlist.length));
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar el inicio.");
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

  async function handleToggleFavorite(shirt: Shirt) {
    const next = !shirt.isFavorite;
    setShirts((prev) => prev.map((s) => (s.id === shirt.id ? { ...s, isFavorite: next } : s)));
    try {
      const supabase = createClient();
      await toggleFavorite(supabase, shirt.id, next);
    } catch (error) {
      setShirts((prev) => prev.map((s) => (s.id === shirt.id ? { ...s, isFavorite: !next } : s)));
      showError(error instanceof Error ? error.message : "No se pudo actualizar favorita.");
    }
  }

  const firstName = (profile?.displayName || user.email.split("@")[0] || "").split(" ")[0];
  const recentShirts = shirts.slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Hola, {firstName || "coleccionista"} 👋
        </h1>
        <p className="mt-0.5 text-sm text-ink-500">Este es el resumen de tu colección.</p>
      </div>

      {loading && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total camisetas" value={stats.totalShirts} icon={<Layers className="h-4 w-4" />} />
          <StatTile
            label="Este mes"
            value={stats.addedThisMonth}
            icon={<CalendarPlus className="h-4 w-4" />}
          />
          <StatTile
            label="Favoritas"
            value={stats.favoritesCount}
            icon={<Heart className="h-4 w-4" />}
            accent
          />
          <StatTile
            label="En wishlist"
            value={stats.wishlistCount}
            icon={<Bookmark className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Últimas agregadas</h2>
        {!loading && shirts.length > 0 && (
          <Link href="/coleccion" className="flex items-center gap-1 text-sm font-medium text-accent-600">
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {loading && <ShirtGridSkeleton count={4} />}

      {!loading && shirts.length === 0 && (
        <EmptyState
          icon={<ShirtIcon className="h-10 w-10" strokeWidth={1.5} />}
          title="Tu colección está vacía."
          description="Agregá tu primera camiseta."
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

      {!loading && recentShirts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recentShirts.map((shirt) => (
            <ShirtCard key={shirt.id} shirt={shirt} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}

      {!loading && stats && stats.totalShirts > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Estadísticas rápidas</h2>
            <Link
              href="/estadisticas"
              className="flex items-center gap-1 text-sm font-medium text-accent-600"
            >
              Ver más
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Club con más camisetas" value={stats.topTeam?.label ?? "—"} />
            <StatTile label="Marca más frecuente" value={stats.topBrand?.label ?? "—"} />
            <StatTile label="Tipo más frecuente" value={stats.topType?.label ?? "—"} />
          </div>
        </div>
      )}
    </div>
  );
}
