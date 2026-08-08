"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WishlistForm } from "@/components/wishlist/WishlistForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { createWishlistItem } from "@/services/wishlist";
import { uploadShirtImage } from "@/services/storage";
import type { WishlistFormValues } from "@/types/wishlist";

export default function AgregarWishlistPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: WishlistFormValues, photo: File | null | undefined) {
    setLoading(true);
    try {
      const supabase = createClient();
      const imagePath = photo ? await uploadShirtImage(supabase, user.id, photo) : null;
      const item = await createWishlistItem(supabase, user.id, values, imagePath);
      showSuccess("Agregada a tu wishlist.");
      router.push(`/wishlist/${item.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo agregar a la wishlist.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/wishlist" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-700">
        <ArrowLeft className="h-4 w-4" />
        Wishlist
      </Link>
      <PageHeader title="Agregar a wishlist" />
      <WishlistForm submitLabel="Agregar a wishlist" loading={loading} onSubmit={handleSubmit} />
    </div>
  );
}
