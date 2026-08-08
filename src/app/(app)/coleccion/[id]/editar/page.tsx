"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShirtForm } from "@/components/shirts/ShirtForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { getShirt, updateShirt } from "@/services/shirts";
import { uploadShirtImage } from "@/services/storage";
import type { Shirt, ShirtFormValues } from "@/types/shirt";

export default function EditarCamisetaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [shirt, setShirt] = useState<Shirt | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(values: ShirtFormValues, photo: File | null | undefined) {
    if (!shirt) return;
    setSaving(true);
    try {
      const supabase = createClient();

      let imagePath: string | null | undefined = undefined;
      if (photo === null) {
        // El usuario quito la foto explicitamente.
        imagePath = null;
      } else if (photo instanceof File) {
        imagePath = await uploadShirtImage(supabase, user.id, photo);
      }

      const updated = await updateShirt(supabase, shirt.id, user.id, values, {
        imagePath,
        previousImagePath: shirt.imagePath,
      });

      showSuccess("Cambios guardados.");
      router.push(`/coleccion/${updated.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo guardar los cambios.");
      setSaving(false);
    }
  }

  if (shirt === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-[4/5] w-full max-w-xs rounded-2xl" />
      </div>
    );
  }

  if (shirt === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-ink-500">No encontramos esta camiseta.</p>
        <Link href="/coleccion" className="text-sm font-medium text-accent-600">
          Volver a la colección
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/coleccion/${shirt.id}`}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancelar
      </Link>
      <PageHeader title="Editar camiseta" />
      <ShirtForm
        submitLabel="Guardar cambios"
        loading={saving}
        initialImageUrl={shirt.imageUrl}
        initialValues={{
          teamName: shirt.teamName,
          season: shirt.season,
          shirtType: shirt.shirtType,
          brand: shirt.brand,
          playerName: shirt.playerName,
          shirtNumber: shirt.shirtNumber,
          size: shirt.size,
          version: shirt.version,
          condition: shirt.condition,
          purchaseDate: shirt.purchaseDate,
          purchasePrice: shirt.purchasePrice,
          currency: shirt.currency,
          purchasePlace: shirt.purchasePlace,
          notes: shirt.notes,
          isFavorite: shirt.isFavorite,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
