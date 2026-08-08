"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInAction } from "../actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await signInAction(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <Card className="p-6 sm:p-7">
      <h1 className="text-xl font-semibold text-ink-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-ink-500">Entrá para ver tu colección.</p>

      <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        {error && (
          <p className="rounded-lg bg-favorite-500/10 px-3 py-2 text-sm text-favorite-500">{error}</p>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-medium text-accent-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  );
}
