"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2, Heart, ArrowRightCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { deleteWishlistItem, getWishlistItem, moveToCollection } from "@/services/wishlist";
import { WISHLIST_PRIORITY_LABELS } from "@/types/wishlist";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import type { WishlistItem } from "@/types/wishlist";

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [item, setItem] = useState<WishlistItem | null | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const data = await getWishlistItem(supabase, params.id);
        if (active) setItem(data);
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar el ítem.");
        if (active) setItem(null);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleDelete() {
    if (!item) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await deleteWishlistItem(supabase, item.id, item.imagePath);
      showSuccess("Eliminada de tu wishlist.");
      router.push("/wishlist");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo eliminar.");
      setBusy(false);
      setDeleteOpen(false);
    }
  }

  async function handleMoveToCollection() {
    if (!item) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const shirt = await moveToCollection(supabase, item);
      showSuccess("¡Pasó a tu colección!");
      router.push(`/coleccion/${shirt.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo pasar a la colección.");
      setBusy(false);
      setMoveOpen(false);
    }
  }

  if (item === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-[4/5] w-full max-w-sm rounded-2xl" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-ink-500">No encontramos este ítem.</p>
        <Link href="/wishlist" className="text-sm font-medium text-accent-600">
          Volver a wishlist
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/wishlist" className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
          <ArrowLeft className="h-4 w-4" />
          Wishlist
        </Link>
        <div className="flex gap-2">
          <Link href={`/wishlist/${item.id}/editar`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-favorite-500"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-cream-200 shadow-card">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.teamName}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <Heart className="h-16 w-16" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="mx-auto mt-5 max-w-sm">
        <h1 className="text-2xl font-semibold text-ink-900">{item.teamName}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.season && <Badge variant="accent">{item.season}</Badge>}
          {item.shirtType && <Badge>{SHIRT_TYPE_LABELS[item.shirtType]}</Badge>}
          <Badge variant="favorite">{WISHLIST_PRIORITY_LABELS[item.priority]}</Badge>
        </div>

        {(item.playerName || item.shirtNumber) && (
          <p className="mt-3 text-sm text-ink-500">
            {[item.playerName, item.shirtNumber ? `#${item.shirtNumber}` : null]
              .filter(Boolean)
              .join(" ")}
          </p>
        )}

        {item.notes && (
          <div className="mt-4 rounded-2xl border border-ink-900/[0.06] bg-white p-4">
            <p className="mb-1 text-sm font-medium text-ink-700">Notas</p>
            <p className="whitespace-pre-wrap text-sm text-ink-500">{item.notes}</p>
          </div>
        )}

        <Button size="lg" fullWidth className="mt-6 gap-2" onClick={() => setMoveOpen(true)}>
          <ArrowRightCircle className="h-[18px] w-[18px]" />
          Pasar a mi colección
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="¿Eliminar de tu wishlist?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={moveOpen}
        title="¿Pasar a tu colección?"
        description="Se va a crear una camiseta en tu colección con estos datos y se va a quitar de tu wishlist."
        confirmLabel="Pasar a colección"
        danger={false}
        loading={busy}
        onConfirm={handleMoveToCollection}
        onCancel={() => setMoveOpen(false)}
      />
    </div>
  );
}
