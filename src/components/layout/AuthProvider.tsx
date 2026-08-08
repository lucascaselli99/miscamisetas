"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Profile } from "@/types/profile";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/services/profile";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  user: AuthUser;
  initialProfile: Profile | null;
  children: ReactNode;
}

/**
 * Provee el usuario autenticado y su perfil a todo el arbol de la app
 * protegida, evitando volver a pedirlos en cada pantalla. El perfil inicial
 * se resuelve server-side en el layout de (app) para el primer render.
 */
export function AuthProvider({ user, initialProfile, children }: AuthProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const fresh = await getProfile(supabase, user.id);
    if (fresh) setProfile(fresh);
  }, [user.id]);

  return (
    <AuthContext.Provider value={{ user, profile, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
