"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, isValidPassword, isRequired } from "@/utils/validation";

export interface AuthActionResult {
  error?: string;
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) return { error: "Ingresá un email válido." };
  if (!password) return { error: "Ingresá tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email o contraseña incorrectos." };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isRequired(displayName)) return { error: "Ingresá tu nombre." };
  if (!isValidEmail(email)) return { error: "Ingresá un email válido." };
  if (!isValidPassword(password)) return { error: "La contraseña debe tener al menos 6 caracteres." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: error.message };
  }

  // Si Supabase tiene confirmacion de email desactivada, la sesion ya
  // viene activa y podemos entrar directo. Si no, mostramos el aviso de
  // "revisá tu email" desde el formulario (data.session === null).
  if (data.session) {
    redirect("/dashboard");
  }

  return {};
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
