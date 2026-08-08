// Tipos generados a mano a partir de supabase/schema.sql
// Si en el futuro se usa `supabase gen types typescript`, este archivo se
// puede reemplazar por el generado automaticamente sin romper el resto de
// la app (los tipos de dominio en src/types/*.ts dependen de este archivo).
// La forma (Tables/Views/Functions/Enums/CompositeTypes, Relationships: [])
// sigue la misma convencion que ese generador para ser compatible con los
// generics de @supabase/supabase-js.

export type ShirtType = "local" | "visitante" | "tercera" | "arquero" | "otra";
export type ShirtVersion = "fan" | "player" | "retro" | "otra";
export type ShirtCondition = "nueva" | "usada";
export type WishlistPriority = "la_quiero_si_o_si" | "me_interesa" | "algun_dia";
export type UserRole = "user" | "admin";
export type SubscriptionPlan = "FREE" | "PRO";
export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due";
export type SubscriptionProvider = "mercadopago" | "paypal" | "gift" | "none";
export type CatalogStatus = "approved" | "pending";
export type CatalogCategory = "club" | "seleccion";

export interface Database {
  public: {
    Tables: {
      catalog_shirts: {
        Row: { id: string; team_name: string; country: string | null; season: string; shirt_type: ShirtType | null; brand: string | null; category: CatalogCategory; competition: string | null; description: string | null; image_url: string | null; created_by: string | null; status: CatalogStatus; created_at: string; updated_at: string; };
        Insert: { id?: string; team_name: string; country?: string | null; season: string; shirt_type?: ShirtType | null; brand?: string | null; category?: CatalogCategory; competition?: string | null; description?: string | null; image_url?: string | null; created_by?: string | null; status?: CatalogStatus; };
        Update: Partial<Database["public"]["Tables"]["catalog_shirts"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      shirts: {
        Row: {
          id: string;
          user_id: string;
          catalog_shirt_id: string | null;
          team_name: string;
          season: string;
          shirt_type: ShirtType | null;
          brand: string | null;
          player_name: string | null;
          shirt_number: number | null;
          size: string | null;
          version: ShirtVersion | null;
          condition: ShirtCondition | null;
          purchase_date: string | null;
          purchase_price: number | null;
          currency: string | null;
          purchase_place: string | null;
          notes: string | null;
          image_url: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          catalog_shirt_id?: string | null;
          team_name: string;
          season: string;
          shirt_type?: ShirtType | null;
          brand?: string | null;
          player_name?: string | null;
          shirt_number?: number | null;
          size?: string | null;
          version?: ShirtVersion | null;
          condition?: ShirtCondition | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          currency?: string | null;
          purchase_place?: string | null;
          notes?: string | null;
          image_url?: string | null;
          is_favorite?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["shirts"]["Insert"]>;
        Relationships: [];
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          catalog_shirt_id: string | null;
          team_name: string;
          season: string | null;
          shirt_type: ShirtType | null;
          player_name: string | null;
          shirt_number: number | null;
          priority: WishlistPriority;
          notes: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          catalog_shirt_id?: string | null;
          team_name: string;
          season?: string | null;
          shirt_type?: ShirtType | null;
          player_name?: string | null;
          shirt_number?: number | null;
          priority?: WishlistPriority;
          notes?: string | null;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          provider: SubscriptionProvider;
          provider_subscription_id: string | null;
          started_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          provider?: SubscriptionProvider;
          provider_subscription_id?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { catalog_collection_counts: { Args: Record<string, never>; Returns: { catalog_shirt_id: string; owners: number }[] } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
