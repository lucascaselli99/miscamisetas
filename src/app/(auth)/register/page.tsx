"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUpAction } from "../actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await signUpAction(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    // Si no hubo redirect (Supabase requiere confirmar el email primero)
    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <Card className="p-6 text-center sm:p-7">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
          <CheckCircle2 className="h-6 w-6 text-accent-600" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Revisá tu email</h1>
        <p className="mt-2 text-sm text-ink-500">
          Te enviamos un link para confirmar tu cuenta. Una vez confirmada, ya podés iniciar sesión.
        </p>
        <Link href="/login">
          <Button fullWidth className="mt-6">
            Ir a iniciar sesión
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <h1 className="text-xl font-semibold text-ink-900">Creá tu cuenta</h1>
      <p className="mt-1 text-sm text-ink-500">Empezá a armar tu colección.</p>

      <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Nombre" name="displayName" type="text" autoComplete="name" placeholder="Tu nombre" required />
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
          autoComplete="new-password"
          placeholder="Al menos 6 caracteres"
          required
          minLength={6}
        />

        {error && (
          <p className="rounded-lg bg-favorite-500/10 px-3 py-2 text-sm text-favorite-500">{error}</p>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-accent-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  );
}
