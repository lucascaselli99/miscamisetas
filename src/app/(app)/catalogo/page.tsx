"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users, Shirt as ShirtIcon, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { listCatalog } from "@/services/catalog";
import type { CatalogShirt } from "@/types/catalog";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import { useAuth } from "@/hooks/useAuth";

export default function CatalogoPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [items, setItems] = useState<CatalogShirt[]>([]);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCatalog(createClient())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(items.map((x) => x.brand).filter(Boolean) as string[])).sort(),
    [items]
  );

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = items
      .filter(
        (x) =>
          !query ||
          [x.teamName, x.season, x.brand, x.country]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(query))
      )
      .filter((x) => !brand || x.brand === brand);

    return [...filtered].sort((a, b) => {
      if (sort === "popular") return b.owners - a.owners;
      if (sort === "season") return b.season.localeCompare(a.season);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, q, brand, sort]);

  return (
    <div>
      <PageHeader
        title="Catálogo"
        subtitle="Encontrá una camiseta y sumala a tu colección en segundos."
        action={
          isAdmin ? (
            <Link
              href="/admin/catalogo"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-3 text-sm font-medium text-white transition hover:bg-accent-600 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Agregar al catálogo
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Input
            placeholder="Buscar equipo, temporada..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Todas las marcas</option>
          {brands.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">Más populares</option>
          <option value="new">Más nuevas</option>
          <option value="season">Temporada</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-ink-500">Cargando catálogo...</p>
      ) : shown.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="mx-auto mb-3 h-7 w-7 text-ink-300" />
          <p className="font-medium">No encontramos esa camiseta.</p>
          <Link
            className="mt-2 inline-block text-sm text-accent-600"
            href={isAdmin ? "/admin/catalogo" : "/agregar"}
          >
            {isAdmin ? "Agregarla al catálogo" : "Cargarla manualmente"}
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((c) => (
            <Link key={c.id} href={`/catalogo/${c.id}`}>
              <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="aspect-[4/5] bg-cream-100">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShirtIcon className="h-10 w-10 text-ink-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold text-ink-900">{c.teamName}</p>
                  <p className="text-sm text-ink-500">
                    {c.season}
                    {c.shirtType ? ` · ${SHIRT_TYPE_LABELS[c.shirtType]}` : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-ink-300">
                    <Users className="h-3.5 w-3.5" />
                    {c.owners} la tienen
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
