"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PhotoPicker } from "@/components/shirts/PhotoPicker";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import {
  createCatalogShirt,
  deleteCatalogShirt,
  listCatalog,
} from "@/services/catalog";
import { uploadCatalogImage } from "@/services/storage";
import type { CatalogFormValues, CatalogShirt } from "@/types/catalog";
import type { ShirtType } from "@/types/database.types";

const empty: CatalogFormValues = {
  teamName: "",
  country: null,
  season: "",
  shirtType: null,
  brand: null,
  category: "club",
  competition: null,
  description: null,
  imageUrl: null,
};

export default function AdminCatalog() {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [v, setV] = useState(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPickerKey, setPhotoPickerKey] = useState(0);
  const [items, setItems] = useState<CatalogShirt[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => listCatalog(createClient()).then(setItems);

  useEffect(() => {
    if (profile?.role === "admin") load();
  }, [profile?.role]);

  if (profile?.role !== "admin") {
    return (
      <Card className="p-8 text-center">
        <p className="font-semibold">Acceso restringido</p>
        <p className="mt-1 text-sm text-ink-500">
          Esta sección es solo para administradores.
        </p>
      </Card>
    );
  }

  const set = (
    k: keyof CatalogFormValues,
    x: CatalogFormValues[keyof CatalogFormValues]
  ) => setV((p) => ({ ...p, [k]: x }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();

    try {
      let imageUrl: string | null = null;
      if (photo) {
        imageUrl = await uploadCatalogImage(supabase, user.id, photo);
      }

      await createCatalogShirt(supabase, user.id, { ...v, imageUrl });
      showSuccess("Camiseta agregada al catálogo.");
      setV(empty);
      setPhoto(null);
      setPhotoPickerKey((x) => x + 1);
      await load();
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Administrar catálogo"
        subtitle="Cargá la biblioteca general que verán todos los usuarios."
      />

      <Card className="mb-6 p-5">
        <form className="grid gap-4" onSubmit={submit}>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Foto del catálogo</p>
            <PhotoPicker
              key={photoPickerKey}
              onFileSelected={setPhoto}
              className="mx-auto max-w-xs"
            />
            <p className="mt-2 text-center text-xs text-ink-300">
              Se comprime automáticamente y se guarda en Supabase Storage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Equipo / Selección *"
              required
              value={v.teamName}
              onChange={(e) => set("teamName", e.target.value)}
            />
            <Input
              label="Temporada *"
              required
              placeholder="Ej. 2025/26"
              value={v.season}
              onChange={(e) => set("season", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marca"
              placeholder="adidas, Nike, Puma..."
              value={v.brand ?? ""}
              onChange={(e) => set("brand", e.target.value || null)}
            />
            <Select
              label="Tipo"
              value={v.shirtType ?? ""}
              onChange={(e) =>
                set("shirtType", (e.target.value || null) as ShirtType | null)
              }
            >
              <option value="">Sin especificar</option>
              <option value="local">Local</option>
              <option value="visitante">Visitante</option>
              <option value="tercera">Tercera</option>
              <option value="arquero">Arquero</option>
              <option value="otra">Otra</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoría"
              value={v.category}
              onChange={(e) =>
                set("category", e.target.value as "club" | "seleccion")
              }
            >
              <option value="club">Club</option>
              <option value="seleccion">Selección</option>
            </Select>
            <Input
              label="País"
              value={v.country ?? ""}
              onChange={(e) => set("country", e.target.value || null)}
            />
          </div>

          <Textarea
            label="Descripción"
            value={v.description ?? ""}
            onChange={(e) => set("description", e.target.value || null)}
          />

          <Button loading={busy} type="submit">
            Agregar al catálogo
          </Button>
        </form>
      </Card>

      <h2 className="mb-3 font-semibold">Catálogo actual ({items.length})</h2>
      <div className="space-y-2">
        {items.map((x) => (
          <Card key={x.id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                {x.imageUrl ? (
                  <Image
                    src={x.imageUrl}
                    alt={`${x.teamName} ${x.season}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {x.teamName} · {x.season}
                </p>
                <p className="text-xs text-ink-500">
                  {x.brand ?? "Sin marca"} · {x.owners} la tienen
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                if (
                  !confirm(
                    "¿Eliminar del catálogo? Las colecciones personales no se borrarán."
                  )
                )
                  return;
                try {
                  await deleteCatalogShirt(createClient(), x.id);
                  await load();
                } catch (e) {
                  showError(e instanceof Error ? e.message : "Error");
                }
              }}
            >
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
