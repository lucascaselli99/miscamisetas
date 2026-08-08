"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, CalendarDays, Shirt as ShirtIcon, Pencil, Check, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/services/profile";
import { uploadAvatar } from "@/services/storage";
import { countShirts } from "@/services/shirts";
import { formatDate } from "@/utils/format";
import { signOutAction } from "@/app/(auth)/actions";

export default function PerfilPage() {
  const { user, profile, setProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [shirtCount, setShirtCount] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile?.displayName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const count = await countShirts(supabase, user.id);
        if (active) setShirtCount(count);
      } catch (error) {
        showError(error instanceof Error ? error.message : "No se pudo cargar el perfil.");
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function handleAvatarChange(file: File) {
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const avatarUrl = await uploadAvatar(supabase, user.id, file);
      const updated = await updateProfile(supabase, user.id, { avatarUrl });
      setProfile(updated);
      showSuccess("Avatar actualizado.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo actualizar el avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveName() {
    if (!nameDraft.trim()) {
      showError("El nombre no puede estar vacío.");
      return;
    }
    setSavingName(true);
    try {
      const supabase = createClient();
      const updated = await updateProfile(supabase, user.id, { displayName: nameDraft.trim() });
      setProfile(updated);
      setEditingName(false);
      showSuccess("Nombre actualizado.");
    } catch (error) {
      showError(error instanceof Error ? error.message : "No se pudo actualizar el nombre.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAction();
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Perfil" />

      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <AvatarPicker
          name={profile.displayName ?? user.email}
          currentUrl={profile.avatarUrl}
          onFileSelected={handleAvatarChange}
        />
        {uploadingAvatar && <p className="text-xs text-ink-300">Subiendo avatar...</p>}

        {editingName ? (
          <div className="flex w-full max-w-xs items-center gap-2">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              className="text-center"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName}
              aria-label="Guardar nombre"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditingName(false);
                setNameDraft(profile.displayName ?? "");
              }}
              aria-label="Cancelar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900/5 text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 text-lg font-semibold text-ink-900"
          >
            {profile.displayName || "Sin nombre"}
            <Pencil className="h-3.5 w-3.5 text-ink-300" />
          </button>
        )}

        <div className="flex w-full flex-col gap-2 border-t border-ink-900/[0.06] pt-4 text-left text-sm">
          <div className="flex items-center gap-2 text-ink-500">
            <Mail className="h-4 w-4 shrink-0" />
            {profile.email}
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <CalendarDays className="h-4 w-4 shrink-0" />
            Miembro desde {formatDate(profile.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <ShirtIcon className="h-4 w-4 shrink-0" />
            {shirtCount === null ? "..." : shirtCount} camisetas en tu colección
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <p className="mb-3 text-sm font-semibold text-ink-900">Cambiar contraseña</p>
        <ChangePasswordForm />
      </Card>

      <Button
        variant="outline"
        fullWidth
        className="mt-6 gap-2 text-favorite-500"
        onClick={handleSignOut}
        loading={signingOut}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}
