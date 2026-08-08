"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/stats/StatTile";
import { StatCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { MonthlyBarChart } from "@/components/stats/MonthlyBarChart";
import { DistributionBarChart } from "@/components/stats/DistributionBarChart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { listShirts } from "@/services/shirts";
import { listWishlist } from "@/services/wishlist";
import { computeStats } from "@/services/stats";
import type { CollectionStats } from "@/types/stats";
import { formatCurrency } from "@/utils/format";
import { BarChart3 } from "lucide-react";

export default function EstadisticasPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const [shirts, wishlist] = await Promise.all([
          listShirts(supabase, user.id),
          listWishlist(supabase, user.id),
        ]);
        if (active) setStats(computeStats(shirts, wishlist.length));
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas.");
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

  if (loading) {
    return (
      <div>
        <PageHeader title="Estadísticas" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="mt-6 h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (!stats || stats.totalShirts === 0) {
    return (
      <div>
        <PageHeader title="Estadísticas" />
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" strokeWidth={1.5} />}
          title="Todavía no hay datos suficientes."
          description="Agregá camisetas a tu colección para ver estadísticas."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Estadísticas" subtitle="Un resumen de tu colección." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total de camisetas" value={stats.totalShirts} />
        <StatTile label="Compradas este mes" value={stats.addedThisMonth} />
        <StatTile label="Compradas este año" value={stats.addedThisYear} />
        <StatTile label="Favoritas" value={stats.favoritesCount} />
        <StatTile label="Club con más camisetas" value={stats.topTeam?.label ?? "—"} />
        <StatTile label="Marca más frecuente" value={stats.topBrand?.label ?? "—"} />
        <StatTile label="Tipo más frecuente" value={stats.topType?.label ?? "—"} />
        <StatTile label="En wishlist" value={stats.wishlistCount} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-1 text-xs font-medium text-ink-500">Gasto total registrado</p>
          {stats.hasPriceData ? (
            <p className="text-2xl font-semibold text-ink-900">{formatCurrency(stats.totalSpent)}</p>
          ) : (
            <p className="text-sm text-ink-300">Todavía no cargaste precios de compra.</p>
          )}
        </Card>
        <Card className="p-4">
          <p className="mb-1 text-xs font-medium text-ink-500">Gasto de este mes</p>
          {stats.hasPriceData ? (
            <p className="text-2xl font-semibold text-ink-900">{formatCurrency(stats.spentThisMonth)}</p>
          ) : (
            <p className="text-sm text-ink-300">Todavía no cargaste precios de compra.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-4">
        <p className="mb-3 text-sm font-semibold text-ink-900">Camisetas agregadas por mes</p>
        {stats.addedByMonth.length > 0 ? (
          <MonthlyBarChart data={stats.addedByMonth} />
        ) : (
          <p className="py-8 text-center text-sm text-ink-300">Sin datos suficientes todavía.</p>
        )}
        {!stats.hasDateData && (
          <p className="mt-2 text-xs text-ink-300">
            * Como no cargaste fechas de compra, se usa la fecha en que agregaste cada camiseta.
          </p>
        )}
      </Card>

      <Card className="mt-4 p-4">
        <p className="mb-3 text-sm font-semibold text-ink-900">Distribución por marca</p>
        {stats.byBrand.length > 0 ? (
          <DistributionBarChart data={stats.byBrand} />
        ) : (
          <p className="py-8 text-center text-sm text-ink-300">Todavía no cargaste marcas.</p>
        )}
      </Card>

      <Card className="mt-4 p-4">
        <p className="mb-3 text-sm font-semibold text-ink-900">Distribución por club/selección</p>
        <DistributionBarChart data={stats.byTeam} />
      </Card>
    </div>
  );
}
