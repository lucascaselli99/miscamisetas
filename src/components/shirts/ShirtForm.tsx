"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PhotoPicker } from "./PhotoPicker";
import {
  SHIRT_CONDITION_LABELS,
  SHIRT_TYPE_LABELS,
  SHIRT_VERSION_LABELS,
} from "@/types/shirt";
import type { ShirtFormValues } from "@/types/shirt";

interface ShirtFormProps {
  initialValues?: Partial<ShirtFormValues>;
  initialImageUrl?: string | null;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: ShirtFormValues, photo: File | null | undefined) => void;
}

const EMPTY_VALUES: ShirtFormValues = {
  teamName: "",
  season: "",
  shirtType: null,
  brand: null,
  playerName: null,
  shirtNumber: null,
  size: null,
  version: null,
  condition: null,
  purchaseDate: null,
  purchasePrice: null,
  currency: "ARS",
  purchasePlace: null,
  notes: null,
  isFavorite: false,
};

export function ShirtForm({
  initialValues,
  initialImageUrl,
  submitLabel,
  loading,
  onSubmit,
}: ShirtFormProps) {
  const [values, setValues] = useState<ShirtFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [showMore, setShowMore] = useState(Boolean(initialValues && Object.keys(initialValues).length > 3));
  const [photo, setPhoto] = useState<File | null | undefined>(undefined);
  const [errors, setErrors] = useState<{ teamName?: string; season?: string }>({});

  function update<K extends keyof ShirtFormValues>(key: K, value: ShirtFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.teamName.trim()) nextErrors.teamName = "El equipo es obligatorio.";
    if (!values.season.trim()) nextErrors.season = "La temporada es obligatoria.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
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
        placeholder="Ej: River Plate, Argentina, Brasil..."
        value={values.teamName}
        onChange={(e) => update("teamName", e.target.value)}
        error={errors.teamName}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Temporada *"
          placeholder="Ej: 2023/24"
          value={values.season}
          onChange={(e) => update("season", e.target.value)}
          error={errors.season}
          required
        />
        <Select
          label="Tipo"
          value={values.shirtType ?? ""}
          onChange={(e) => update("shirtType", (e.target.value || null) as ShirtFormValues["shirtType"])}
        >
          <option value="">Sin especificar</option>
          {Object.entries(SHIRT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-ink-900/10 bg-white py-2.5 text-sm font-medium text-ink-700 transition hover:bg-cream-100"
      >
        Agregar más información
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showMore && (
        <div className="flex flex-col gap-4 rounded-2xl bg-cream-100/70 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marca"
              placeholder="Ej: Adidas, Nike..."
              value={values.brand ?? ""}
              onChange={(e) => update("brand", e.target.value || null)}
            />
            <Select
              label="Versión"
              value={values.version ?? ""}
              onChange={(e) => update("version", (e.target.value || null) as ShirtFormValues["version"])}
            >
              <option value="">Sin especificar</option>
              {Object.entries(SHIRT_VERSION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jugador"
              placeholder="Ej: Messi"
              value={values.playerName ?? ""}
              onChange={(e) => update("playerName", e.target.value || null)}
            />
            <Input
              label="Número"
              type="number"
              min={0}
              max={99}
              placeholder="10"
              value={values.shirtNumber ?? ""}
              onChange={(e) => update("shirtNumber", e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Talle"
              placeholder="Ej: M, L, XL..."
              value={values.size ?? ""}
              onChange={(e) => update("size", e.target.value || null)}
            />
            <Select
              label="Estado"
              value={values.condition ?? ""}
              onChange={(e) =>
                update("condition", (e.target.value || null) as ShirtFormValues["condition"])
              }
            >
              <option value="">Sin especificar</option>
              {Object.entries(SHIRT_CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha de compra"
              type="date"
              value={values.purchaseDate ?? ""}
              onChange={(e) => update("purchaseDate", e.target.value || null)}
            />
            <Input
              label="Lugar de compra"
              placeholder="Ej: tienda oficial"
              value={values.purchasePlace ?? ""}
              onChange={(e) => update("purchasePlace", e.target.value || null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio pagado"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={values.purchasePrice ?? ""}
              onChange={(e) =>
                update("purchasePrice", e.target.value ? Number(e.target.value) : null)
              }
            />
            <Select
              label="Moneda"
              value={values.currency ?? "ARS"}
              onChange={(e) => update("currency", e.target.value)}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="BRL">BRL</option>
              <option value="OTRA">Otra</option>
            </Select>
          </div>

          <Textarea
            label="Notas"
            placeholder="Cualquier detalle que quieras recordar..."
            value={values.notes ?? ""}
            onChange={(e) => update("notes", e.target.value || null)}
          />

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              checked={values.isFavorite}
              onChange={(e) => update("isFavorite", e.target.checked)}
              className="h-[18px] w-[18px] rounded border-ink-900/20 text-accent-500 focus:ring-accent-500/30"
            />
            Marcar como favorita
          </label>
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}
