"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { listWishlist } from "@/services/wishlist";
import { WISHLIST_PRIORITY_LABELS, WISHLIST_PRIORITY_ORDER } from "@/types/wishlist";
import type { WishlistItem, WishlistPriority } from "@/types/wishlist";
import { cn } from "@/utils/cn";

export default function WishlistPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<WishlistPriority | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const data = await listWishlist(supabase, user.id);
        if (active) setItems(data);
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar la wishlist.");
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

  const filtered = useMemo(
    () => (priorityFilter ? items.filter((i) => i.priority === priorityFilter) : items),
    [items, priorityFilter]
  );

  return (
    <div>
      <PageHeader
        title="Wishlist"
        subtitle={loading ? undefined : `${items.length} camisetas deseadas`}
        action={
          <Link href="/wishlist/agregar">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </Link>
        }
      />

      {!loading && items.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPriorityFilter(null)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              priorityFilter === null
                ? "border-accent-500 bg-accent-50 text-accent-700"
                : "border-ink-900/10 bg-white text-ink-700"
            )}
          >
            Todas
          </button>
          {WISHLIST_PRIORITY_ORDER.map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                priorityFilter === priority
                  ? "border-accent-500 bg-accent-50 text-accent-700"
                  : "border-ink-900/10 bg-white text-ink-700"
              )}
            >
              {WISHLIST_PRIORITY_LABELS[priority]}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={<Heart className="h-10 w-10" strokeWidth={1.5} />}
          title="Tu wishlist está vacía."
          description="Agregá las camisetas que soñás conseguir."
          action={
            <Link href="/wishlist/agregar">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Agregar a wishlist
              </Button>
            </Link>
          }
        />
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
