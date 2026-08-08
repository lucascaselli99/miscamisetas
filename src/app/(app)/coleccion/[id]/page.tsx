"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2, Shirt as ShirtIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { deleteShirt, getShirt, toggleFavorite } from "@/services/shirts";
import {
  SHIRT_CONDITION_LABELS,
  SHIRT_TYPE_LABELS,
  SHIRT_VERSION_LABELS,
} from "@/types/shirt";
import type { Shirt } from "@/types/shirt";
import { formatCurrency, formatDate } from "@/utils/format";

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b border-ink-900/[0.06] py-3 last:border-0">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}

export default function ShirtDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [shirt, setShirt] = useState<Shirt | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const data = await getShirt(supabase, params.id);
        if (active) setShirt(data);
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar la camiseta.");
        if (active) setShirt(null);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleToggleFavorite() {
    if (!shirt) return;
    const next = !shirt.isFavorite;
    setShirt({ ...shirt, isFavorite: next });
    try {
      const supabase = createClient();
      await toggleFavorite(supabase, shirt.id, next);
    } catch (error) {
      setShirt({ ...shirt, isFavorite: !next });
      showError(error instanceof Error ? error.message : "No se pudo actualizar favorita.");
    }
  }

  async function handleDelete() {
    if (!shirt) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await deleteShirt(supabase, shirt.id, shirt.imagePath);
      showSuccess("Camiseta eliminada.");
      router.push("/coleccion");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo eliminar la camiseta.");
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (shirt === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (shirt === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-ink-500">No encontramos esta camiseta.</p>
        <Link href="/coleccion">
          <Button variant="outline">Volver a la colección</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/coleccion" className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
          <ArrowLeft className="h-4 w-4" />
          Colección
        </Link>
        <div className="flex gap-2">
          <Link href={`/coleccion/${shirt.id}/editar`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-favorite-500"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-cream-200 shadow-card">
        {shirt.imageUrl ? (
          <Image
            src={shirt.imageUrl}
            alt={`Camiseta de ${shirt.teamName}`}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <ShirtIcon className="h-16 w-16" strokeWidth={1.5} />
          </div>
        )}
        <FavoriteButton
          isFavorite={shirt.isFavorite}
          onToggle={handleToggleFavorite}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="mx-auto mt-5 max-w-sm">
        <h1 className="text-2xl font-semibold text-ink-900">{shirt.teamName}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="accent">{shirt.season}</Badge>
          {shirt.shirtType && <Badge>{SHIRT_TYPE_LABELS[shirt.shirtType]}</Badge>}
          {shirt.version && <Badge>{SHIRT_VERSION_LABELS[shirt.version]}</Badge>}
          {shirt.condition && <Badge>{SHIRT_CONDITION_LABELS[shirt.condition]}</Badge>}
        </div>

        <div className="mt-5 rounded-2xl border border-ink-900/[0.06] bg-white px-4">
          <DetailRow label="Marca" value={shirt.brand} />
          <DetailRow
            label="Jugador"
            value={
              [shirt.playerName, shirt.shirtNumber ? `#${shirt.shirtNumber}` : null]
                .filter(Boolean)
                .join(" ") || null
            }
          />
          <DetailRow label="Talle" value={shirt.size} />
          <DetailRow label="Fecha de compra" value={formatDate(shirt.purchaseDate)} />
          <DetailRow
            label="Precio pagado"
            value={
              typeof shirt.purchasePrice === "number"
                ? formatCurrency(shirt.purchasePrice, shirt.currency ?? "ARS")
                : null
            }
          />
          <DetailRow label="Lugar de compra" value={shirt.purchasePlace} />
        </div>

        {shirt.notes && (
          <div className="mt-4 rounded-2xl border border-ink-900/[0.06] bg-white p-4">
            <p className="mb-1 text-sm font-medium text-ink-700">Notas</p>
            <p className="text-sm text-ink-500 whitespace-pre-wrap">{shirt.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar esta camiseta?"
        description="Esta acción no se puede deshacer. Se va a borrar también la foto asociada."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
