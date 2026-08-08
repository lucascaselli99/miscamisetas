import type { Database } from "@/types/database.types";
import type { Profile } from "@/types/profile";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

type Client = TypedSupabaseClient;
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
// Alias nombrado (en vez de usar el "indexed access type" completo inline
// en cada firma) para que el tipo se resuelva una sola vez y quede fijo,
// en lugar de recalcularse cada vez que TypeScript tiene que angostarlo
// contra el parametro generico de `.update()` de PostgREST.
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(supabase: Client, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) throw new Error(`No se pudo cargar el perfil: ${error.message}`);
  if (!data) return null;
  return mapProfile(data);
}

export async function updateProfile(
  supabase: Client,
  userId: string,
  updates: { displayName?: string; avatarUrl?: string | null }
): Promise<Profile> {
  // Se arma el payload de forma imperativa contra el tipo `Update` generado,
  // en vez de con un objeto literal con spreads condicionales. Con spreads
  // condicionales (`...(cond ? {a} : {})`) TypeScript infiere la union de
  // las formas posibles del objeto y no siempre logra angostarla contra el
  // tipo `Update` esperado por PostgREST, lo que producia el error de build.
  // Declarando `payload` con el tipo `Update` explicito y asignando cada
  // campo por separado, cada asignacion se valida individualmente y el
  // resultado siempre es asignable al `.update(...)`.
  const payload: ProfileUpdate = {};
  if (updates.displayName !== undefined) {
    payload.display_name = updates.displayName;
  }
  if (updates.avatarUrl !== undefined) {
    payload.avatar_url = updates.avatarUrl;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw new Error(`No se pudo actualizar el perfil: ${error.message}`);
  return mapProfile(data);
}
