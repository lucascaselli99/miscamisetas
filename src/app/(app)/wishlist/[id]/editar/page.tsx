"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { WishlistForm } from "@/components/wishlist/WishlistForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { getWishlistItem, updateWishlistItem } from "@/services/wishlist";
import { uploadShirtImage } from "@/services/storage";
import type { WishlistFormValues, WishlistItem } from "@/types/wishlist";

export default function EditarWishlistPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [item, setItem] = useState<WishlistItem | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(values: WishlistFormValues, photo: File | null | undefined) {
    if (!item) return;
    setSaving(true);
    try {
      const supabase = createClient();

      let imagePath: string | null | undefined = undefined;
      if (photo === null) {
        imagePath = null;
      } else if (photo instanceof File) {
        imagePath = await uploadShirtImage(supabase, user.id, photo);
      }

      const updated = await updateWishlistItem(supabase, item.id, values, {
        imagePath,
        previousImagePath: item.imagePath,
      });

      showSuccess("Cambios guardados.");
      router.push(`/wishlist/${updated.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo guardar los cambios.");
      setSaving(false);
    }
  }

  if (item === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-[4/5] w-full max-w-xs rounded-2xl" />
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
      <Link
        href={`/wishlist/${item.id}`}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancelar
      </Link>
      <PageHeader title="Editar ítem" />
      <WishlistForm
        submitLabel="Guardar cambios"
        loading={saving}
        initialImageUrl={item.imageUrl}
        initialValues={{
          teamName: item.teamName,
          season: item.season,
          shirtType: item.shirtType,
          playerName: item.playerName,
          shirtNumber: item.shirtNumber,
          priority: item.priority,
          notes: item.notes,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
