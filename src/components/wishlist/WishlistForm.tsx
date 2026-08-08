"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PhotoPicker } from "@/components/shirts/PhotoPicker";
import { SHIRT_TYPE_LABELS } from "@/types/shirt";
import { WISHLIST_PRIORITY_LABELS, WISHLIST_PRIORITY_ORDER } from "@/types/wishlist";
import type { WishlistFormValues } from "@/types/wishlist";

interface WishlistFormProps {
  initialValues?: Partial<WishlistFormValues>;
  initialImageUrl?: string | null;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: WishlistFormValues, photo: File | null | undefined) => void;
}

const EMPTY_VALUES: WishlistFormValues = {
  teamName: "",
  season: null,
  shirtType: null,
  playerName: null,
  shirtNumber: null,
  priority: "me_interesa",
  notes: null,
};

export function WishlistForm({
  initialValues,
  initialImageUrl,
  submitLabel,
  loading,
  onSubmit,
}: WishlistFormProps) {
  const [values, setValues] = useState<WishlistFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [photo, setPhoto] = useState<File | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof WishlistFormValues>(key: K, value: WishlistFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.teamName.trim()) {
      setError("El equipo es obligatorio.");
      return;
    }
    setError(null);
    onSubmit(values, photo);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PhotoPicker
        existingImageUrl={initialImageUrl}
        onFileSelected={(file) => setPhoto(file)}
        className="mx-auto max-w-xs"
      />

      <Input
        label="Equipo / Selección *"
        placeholder="Ej: Boca Juniors, Francia..."
        value={values.teamName}
        onChange={(e) => update("teamName", e.target.value)}
        error={error ?? undefined}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Temporada"
          placeholder="Ej: 2024/25"
          value={values.season ?? ""}
          onChange={(e) => update("season", e.target.value || null)}
        />
        <Select
          label="Tipo"
          value={values.shirtType ?? ""}
          onChange={(e) =>
            update("shirtType", (e.target.value || null) as WishlistFormValues["shirtType"])
          }
        >
          <option value="">Sin especificar</option>
          {Object.entries(SHIRT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Jugador"
          placeholder="Ej: Mbappé"
          value={values.playerName ?? ""}
          onChange={(e) => update("playerName", e.target.value || null)}
        />
        <Input
          label="Número"
          type="number"
          min={0}
          max={99}
          placeholder="7"
          value={values.shirtNumber ?? ""}
          onChange={(e) => update("shirtNumber", e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Prioridad</label>
        <div className="flex gap-2">
          {WISHLIST_PRIORITY_ORDER.map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => update("priority", priority)}
              className={
                "flex-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition " +
                (values.priority === priority
                  ? "border-accent-500 bg-accent-50 text-accent-700"
                  : "border-ink-900/10 bg-white text-ink-500")
              }
            >
              {WISHLIST_PRIORITY_LABELS[priority]}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Notas"
        placeholder="Dónde la viste, talle que buscás, etc."
        value={values.notes ?? ""}
        onChange={(e) => update("notes", e.target.value || null)}
      />

      <Button type="submit" size="lg" loading={loading} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}
