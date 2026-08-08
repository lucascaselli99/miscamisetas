import type { Database } from "@/types/database.types";
import type { WishlistFormValues, WishlistItem } from "@/types/wishlist";
import type { ShirtFormValues } from "@/types/shirt";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { getSignedUrls, deleteShirtImage } from "./storage";
import { createShirt } from "./shirts";

type Client = TypedSupabaseClient;
type WishlistRow = Database["public"]["Tables"]["wishlist"]["Row"];
// Alias nombrados para los tipos de insert/update (ver nota en profile.ts).
type WishlistInsert = Database["public"]["Tables"]["wishlist"]["Insert"];
type WishlistUpdate = Database["public"]["Tables"]["wishlist"]["Update"];

function mapWishlistItem(row: WishlistRow, signedUrl: string | null): WishlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    catalogShirtId: row.catalog_shirt_id,
    teamName: row.team_name,
    season: row.season,
    shirtType: row.shirt_type,
    playerName: row.player_name,
    shirtNumber: row.shirt_number,
    priority: row.priority,
    notes: row.notes,
    imagePath: row.image_url,
    imageUrl: signedUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function mapWishlistWithImages(supabase: Client, rows: WishlistRow[]): Promise<WishlistItem[]> {
  const paths = rows.map((r) => r.image_url).filter((p): p is string => Boolean(p));
  const urlMap = await getSignedUrls(supabase, paths);
  return rows.map((row) =>
    mapWishlistItem(row, row.image_url ? urlMap.get(row.image_url) ?? null : null)
  );
}

export async function listWishlist(supabase: Client, userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudo cargar la wishlist: ${error.message}`);
  return mapWishlistWithImages(supabase, data ?? []);
}

export async function getWishlistItem(supabase: Client, id: string): Promise<WishlistItem | null> {
  const { data, error } = await supabase.from("wishlist").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el ítem: ${error.message}`);
  if (!data) return null;
  const [item] = await mapWishlistWithImages(supabase, [data]);
  return item;
}

function toSharedFields(values: WishlistFormValues) {
  return {
    team_name: values.teamName.trim(),
    season: values.season?.trim() || null,
    shirt_type: values.shirtType,
    player_name: values.playerName?.trim() || null,
    shirt_number: values.shirtNumber,
    priority: values.priority,
    notes: values.notes?.trim() || null,
  };
}

export async function createWishlistItem(
  supabase: Client,
  userId: string,
  values: WishlistFormValues,
  imagePath: string | null
): Promise<WishlistItem> {
  const insertPayload: WishlistInsert = {
    user_id: userId,
    image_url: imagePath,
    ...toSharedFields(values),
  };

  const { data, error } = await supabase
    .from("wishlist")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) throw new Error(`No se pudo guardar el ítem: ${error.message}`);
  const [item] = await mapWishlistWithImages(supabase, [data]);
  return item;
}

interface UpdateWishlistOptions {
  imagePath?: string | null;
  previousImagePath?: string | null;
}

export async function updateWishlistItem(
  supabase: Client,
  id: string,
  values: WishlistFormValues,
  options: UpdateWishlistOptions = {}
): Promise<WishlistItem> {
  const updatePayload: WishlistUpdate = {
    ...toSharedFields(values),
  };
  if (options.imagePath !== undefined) {
    updatePayload.image_url = options.imagePath;
  }

  const { data, error } = await supabase
    .from("wishlist")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`No se pudo actualizar el ítem: ${error.message}`);

  if (options.imagePath !== undefined && options.previousImagePath) {
    await deleteShirtImage(supabase, options.previousImagePath);
  }

  const [item] = await mapWishlistWithImages(supabase, [data]);
  return item;
}

export async function deleteWishlistItem(
  supabase: Client,
  id: string,
  imagePath: string | null
): Promise<void> {
  const { error } = await supabase.from("wishlist").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el ítem: ${error.message}`);
  await deleteShirtImage(supabase, imagePath);
}

/**
 * Pasa un item de la wishlist a la coleccion: crea la camiseta reutilizando
 * los datos disponibles y, recien si eso funciona, borra el item de la
 * wishlist. Se prioriza no perder datos: si la creacion falla, el item
 * sigue en la wishlist.
 */
export async function moveToCollection(supabase: Client, item: WishlistItem) {
  const shirtValues: ShirtFormValues = {
    teamName: item.teamName,
    season: item.season || "Sin especificar",
    shirtType: item.shirtType,
    brand: null,
    playerName: item.playerName,
    shirtNumber: item.shirtNumber,
    size: null,
    version: null,
    condition: null,
    purchaseDate: null,
    purchasePrice: null,
    currency: "ARS",
    purchasePlace: null,
    notes: item.notes,
    isFavorite: false,
  };

  // Reutilizamos el mismo path de imagen (no hace falta re-subir el archivo):
  // la camiseta nueva apunta al mismo objeto en el bucket.
  const shirt = await createShirt(supabase, item.userId, shirtValues, item.imagePath, item.catalogShirtId);

  const { error } = await supabase.from("wishlist").delete().eq("id", item.id);
  if (error) {
    // La camiseta ya se creo; avisamos pero no revertimos para no perder
    // la carga. El usuario puede borrar el item de wishlist manualmente.
    throw new Error(
      "La camiseta se agregó a tu colección, pero no se pudo quitar de la wishlist. Podés borrarla manualmente."
    );
  }

  return shirt;
}
