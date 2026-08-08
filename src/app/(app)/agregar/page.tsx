"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShirtForm } from "@/components/shirts/ShirtForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { createShirt } from "@/services/shirts";
import { uploadShirtImage } from "@/services/storage";
import type { ShirtFormValues } from "@/types/shirt";

export default function AgregarCamisetaPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: ShirtFormValues, photo: File | null | undefined) {
    setLoading(true);
    try {
      const supabase = createClient();
      const imagePath = photo ? await uploadShirtImage(supabase, user.id, photo) : null;
      const shirt = await createShirt(supabase, user.id, values, imagePath);
      showSuccess("Camiseta agregada a tu colección.");
      router.push(`/coleccion/${shirt.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo agregar la camiseta.");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Agregar camiseta" subtitle="Cargala rápido, después completás el resto." />
      <ShirtForm submitLabel="Agregar a mi colección" loading={loading} onSubmit={handleSubmit} />
    </div>
  );
}
