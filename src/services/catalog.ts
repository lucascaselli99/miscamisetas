import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Database } from "@/types/database.types";
import type { CatalogFormValues, CatalogShirt } from "@/types/catalog";
import type { ShirtFormValues } from "@/types/shirt";

type Client = TypedSupabaseClient;
type Row = Database["public"]["Tables"]["catalog_shirts"]["Row"];
type Insert = Database["public"]["Tables"]["catalog_shirts"]["Insert"];
function map(row: Row, owners=0): CatalogShirt { return { id:row.id, teamName:row.team_name, country:row.country, season:row.season, shirtType:row.shirt_type, brand:row.brand, category:row.category, competition:row.competition, description:row.description, imageUrl:row.image_url, status:row.status, owners, createdAt:row.created_at }; }
export async function listCatalog(supabase:Client):Promise<CatalogShirt[]> {
  const [{data,error},{data:counts}] = await Promise.all([supabase.from("catalog_shirts").select("*").eq("status","approved").order("created_at",{ascending:false}), supabase.rpc("catalog_collection_counts")]);
  if(error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  const cm=new Map((counts??[]).map((x)=>[x.catalog_shirt_id, Number(x.owners)]));
  return (data??[]).map(r=>map(r,cm.get(r.id)??0));
}
export async function getCatalogShirt(supabase:Client,id:string):Promise<CatalogShirt|null>{ const {data,error}=await supabase.from("catalog_shirts").select("*").eq("id",id).maybeSingle(); if(error) throw new Error(error.message); if(!data)return null; const {data:counts}=await supabase.rpc("catalog_collection_counts"); const c=(counts??[]).find(x=>x.catalog_shirt_id===id); return map(data,Number(c?.owners??0)); }
export async function addCatalogToCollection(supabase:Client,userId:string,c:CatalogShirt,extra?:Partial<ShirtFormValues>){ const payload:Database["public"]["Tables"]["shirts"]["Insert"]={user_id:userId,catalog_shirt_id:c.id,team_name:c.teamName,season:c.season,shirt_type:c.shirtType,brand:c.brand,player_name:extra?.playerName??null,shirt_number:extra?.shirtNumber??null,size:extra?.size??null,version:extra?.version??null,condition:extra?.condition??null,purchase_date:extra?.purchaseDate??null,purchase_price:extra?.purchasePrice??null,currency:extra?.currency??"ARS",purchase_place:extra?.purchasePlace??null,notes:extra?.notes??null,is_favorite:extra?.isFavorite??false}; const {data,error}=await supabase.from("shirts").insert(payload).select("id").single(); if(error)throw new Error(error.message); return data.id; }
export async function addCatalogToWishlist(supabase:Client,userId:string,c:CatalogShirt){ const payload:Database["public"]["Tables"]["wishlist"]["Insert"]={user_id:userId,catalog_shirt_id:c.id,team_name:c.teamName,season:c.season,shirt_type:c.shirtType,priority:"me_interesa"}; const {error}=await supabase.from("wishlist").insert(payload); if(error)throw new Error(error.message); }
export async function createCatalogShirt(supabase:Client,userId:string,v:CatalogFormValues){ const payload:Insert={team_name:v.teamName.trim(),country:v.country?.trim()||null,season:v.season.trim(),shirt_type:v.shirtType,brand:v.brand?.trim()||null,category:v.category,competition:v.competition?.trim()||null,description:v.description?.trim()||null,image_url:v.imageUrl?.trim()||null,created_by:userId,status:"approved"}; const {error}=await supabase.from("catalog_shirts").insert(payload); if(error)throw new Error(error.message); }
export async function deleteCatalogShirt(supabase:Client,id:string){ const {error}=await supabase.from("catalog_shirts").delete().eq("id",id); if(error)throw new Error(error.message); }
