"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/utils/validation";

export function ChangePasswordForm() {
  const { showSuccess, showError } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidPassword(newPassword)) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw new Error(updateError.message);
      showSuccess("Contraseña actualizada.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Nueva contraseña"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Al menos 6 caracteres"
        autoComplete="new-password"
      />
      <Input
        label="Confirmar contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repetí la contraseña"
        autoComplete="new-password"
      />
      {error && <p className="text-sm text-favorite-500">{error}</p>}
      <Button type="submit" variant="outline" loading={loading} className="self-start">
        Cambiar contraseña
      </Button>
    </form>
  );
}
