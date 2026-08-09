import type { Database } from "@/types/database.types";
import type { Shirt, ShirtFilters, ShirtFormValues, ShirtSortOption } from "@/types/shirt";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { getSignedUrls, deleteShirtImage } from "./storage";

type Client = TypedSupabaseClient;
type ShirtRow = Database["public"]["Tables"]["shirts"]["Row"];

// Alias nombrados para los tipos de insert/update (ver nota en profile.ts):
// resuelven el "indexed access type" una sola vez en vez de repetirlo inline
// en cada firma que le pasa un payload a PostgREST.
type ShirtInsert = Database["public"]["Tables"]["shirts"]["Insert"];
type ShirtUpdate = Database["public"]["Tables"]["shirts"]["Update"];

function mapShirt(row: ShirtRow, resolvedImageUrl: string | null): Shirt {
  return {
    id: row.id,
    userId: row.user_id,
    teamName: row.team_name,
    season: row.season,
    shirtType: row.shirt_type,
    brand: row.brand,
    playerName: row.player_name,
    shirtNumber: row.shirt_number,
    size: row.size,
    version: row.version,
    condition: row.condition,
    purchaseDate: row.purchase_date,
    purchasePrice: row.purchase_price,
    currency: row.currency,
    purchasePlace: row.purchase_place,
    notes: row.notes,
    imagePath: row.image_url,
    imageUrl: resolvedImageUrl,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Resuelve la imagen visible de cada camiseta con esta prioridad:
 * 1) Foto personal de la colección (bucket privado -> signed URL).
 * 2) Foto global de la camiseta del catálogo.
 * 3) Sin imagen.
 *
 * Así, cuando una camiseta se agrega desde el catálogo sin subir una foto
 * personal, en la colección se muestra automáticamente la imagen del catálogo.
 */
async function mapShirtsWithImages(
  supabase: Client,
  rows: ShirtRow[]
): Promise<Shirt[]> {
  const personalPaths = rows
    .map((row) => row.image_url)
    .filter((path): path is string => Boolean(path));

  const signedUrlMap = await getSignedUrls(supabase, personalPaths);

  const catalogIds = Array.from(
    new Set(
      rows
        .filter((row) => !row.image_url && row.catalog_shirt_id)
        .map((row) => row.catalog_shirt_id as string)
    )
  );

  const catalogImageMap = new Map<string, string>();

  if (catalogIds.length > 0) {
    const { data, error } = await supabase
      .from("catalog_shirts")
      .select("id, image_url")
      .in("id", catalogIds);

    if (error) {
      throw new Error(
        `No se pudieron cargar las imágenes del catálogo: ${error.message}`
      );
    }

    (data ?? []).forEach((catalogShirt) => {
      if (catalogShirt.image_url) {
        catalogImageMap.set(catalogShirt.id, catalogShirt.image_url);
      }
    });
  }

  return rows.map((row) => {
    let imageUrl: string | null = null;

    if (row.image_url) {
      imageUrl = signedUrlMap.get(row.image_url) ?? null;
    } else if (row.catalog_shirt_id) {
      imageUrl = catalogImageMap.get(row.catalog_shirt_id) ?? null;
    }

    return mapShirt(row, imageUrl);
  });
}

interface ListShirtsOptions {
  filters?: Partial<ShirtFilters>;
  sort?: ShirtSortOption;
}

/** Trae toda la coleccion del usuario. El filtrado/orden fino se hace en memoria
 * (services/shirts) porque el volumen tipico de una coleccion personal es chico
 * y esto simplifica muchisimo la logica de filtros combinados + busqueda. */
export async function listShirts(supabase: Client, userId: string): Promise<Shirt[]> {
  const { data, error } = await supabase
    .from("shirts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudo cargar la colección: ${error.message}`);

  return mapShirtsWithImages(supabase, data ?? []);
}

export function filterAndSortShirts(
  shirts: Shirt[],
  { filters, sort = "recent" }: ListShirtsOptions
): Shirt[] {
  let result = shirts;

  if (filters?.search) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter((s) =>
        [s.teamName, s.playerName, s.brand, s.season]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q))
      );
    }
  }

  if (filters?.team) result = result.filter((s) => s.teamName === filters.team);
  if (filters?.brand) result = result.filter((s) => s.brand === filters.brand);
  if (filters?.season) result = result.filter((s) => s.season === filters.season);
  if (filters?.shirtType) result = result.filter((s) => s.shirtType === filters.shirtType);
  if (filters?.onlyFavorites) result = result.filter((s) => s.isFavorite);

  const sorted = [...result];

  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "team":
      sorted.sort((a, b) => a.teamName.localeCompare(b.teamName, "es"));
      break;
    case "season":
      sorted.sort((a, b) => b.season.localeCompare(a.season, "es"));
      break;
    case "recent":
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return sorted;
}

/** Cuenta las camisetas del usuario sin traer todas las filas (para el perfil). */
export async function countShirts(supabase: Client, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("shirts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(`No se pudo contar las camisetas: ${error.message}`);

  return count ?? 0;
}

export async function getShirt(supabase: Client, id: string): Promise<Shirt | null> {
  const { data, error } = await supabase
    .from("shirts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar la camiseta: ${error.message}`);
  if (!data) return null;

  const [shirt] = await mapShirtsWithImages(supabase, [data]);
  return shirt;
}

/** Campos compartidos entre insert y update, sin user_id ni image_url
 * (esos dos se agregan aparte segun el caso). */
function toSharedFields(values: ShirtFormValues) {
  return {
    team_name: values.teamName.trim(),
    season: values.season.trim(),
    shirt_type: values.shirtType,
    brand: values.brand?.trim() || null,
    player_name: values.playerName?.trim() || null,
    shirt_number: values.shirtNumber,
    size: values.size?.trim() || null,
    version: values.version,
    condition: values.condition,
    purchase_date: values.purchaseDate,
    purchase_price: values.purchasePrice,
    currency: values.currency || "ARS",
    purchase_place: values.purchasePlace?.trim() || null,
    notes: values.notes?.trim() || null,
    is_favorite: values.isFavorite,
  };
}

export async function createShirt(
  supabase: Client,
  userId: string,
  values: ShirtFormValues,
  imagePath: string | null,
  catalogShirtId: string | null = null
): Promise<Shirt> {
  const insertPayload: ShirtInsert = {
    user_id: userId,
    catalog_shirt_id: catalogShirtId,
    image_url: imagePath,
    ...toSharedFields(values),
  };

  const { data, error } = await supabase
    .from("shirts")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) throw new Error(`No se pudo guardar la camiseta: ${error.message}`);

  const [shirt] = await mapShirtsWithImages(supabase, [data]);
  return shirt;
}

interface UpdateShirtOptions {
  /** Si se subio una foto nueva, path nuevo. Si se quito la foto, null explicito. undefined = sin cambios. */
  imagePath?: string | null;
  /** Path de la imagen anterior, para borrarla del bucket si corresponde. */
  previousImagePath?: string | null;
}

export async function updateShirt(
  supabase: Client,
  id: string,
  _userId: string,
  values: ShirtFormValues,
  options: UpdateShirtOptions = {}
): Promise<Shirt> {
  const updatePayload: ShirtUpdate = {
    ...toSharedFields(values),
  };

  if (options.imagePath !== undefined) {
    updatePayload.image_url = options.imagePath;
  }

  const { data, error } = await supabase
    .from("shirts")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`No se pudo actualizar la camiseta: ${error.message}`);

  if (options.imagePath !== undefined && options.previousImagePath) {
    await deleteShirtImage(supabase, options.previousImagePath);
  }

  const [shirt] = await mapShirtsWithImages(supabase, [data]);
  return shirt;
}

export async function deleteShirt(
  supabase: Client,
  id: string,
  imagePath: string | null
): Promise<void> {
  const { error } = await supabase.from("shirts").delete().eq("id", id);

  if (error) throw new Error(`No se pudo eliminar la camiseta: ${error.message}`);

  await deleteShirtImage(supabase, imagePath);
}

export async function toggleFavorite(
  supabase: Client,
  id: string,
  isFavorite: boolean
): Promise<void> {
  const favoritePayload: ShirtUpdate = { is_favorite: isFavorite };

  const { error } = await supabase
    .from("shirts")
    .update(favoritePayload)
    .eq("id", id);

  if (error) throw new Error(`No se pudo actualizar favorita: ${error.message}`);
}
