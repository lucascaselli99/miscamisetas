-- =========================================================================
-- Mis Camisetas - Row Level Security (RLS)
-- =========================================================================
-- Correr despues de schema.sql.
-- Regla de oro: nunca confiar solo en el frontend. Cada usuario solo puede
-- ver/crear/editar/borrar SUS propios datos, esto se aplica a nivel de
-- base de datos.
-- =========================================================================

-- -------------------------------------------------------------------------
-- profiles
-- -------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- IMPORTANTE: RLS controla FILAS, no COLUMNAS. La policy de arriba permite
-- al usuario actualizar su propia fila de profiles, pero sin una guarda
-- extra podria mandar un update con role='admin' y auto-promoverse (la
-- policy no distingue que columnas cambian). Este trigger cierra ese hueco:
-- si alguien que no sea la service role intenta cambiar `role`, el cambio
-- se descarta silenciosamente y queda el valor anterior.
create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profiles_role on public.profiles;
create trigger guard_profiles_role
  before update on public.profiles
  for each row execute function public.prevent_unauthorized_role_change();

-- No se permite insert/delete desde el cliente: el perfil se crea via
-- trigger (handle_new_user) y se borra en cascada al borrar el usuario.

-- -------------------------------------------------------------------------
-- shirts
-- -------------------------------------------------------------------------
alter table public.shirts enable row level security;

drop policy if exists "shirts_select_own" on public.shirts;
create policy "shirts_select_own"
  on public.shirts for select
  using (auth.uid() = user_id);

drop policy if exists "shirts_insert_own" on public.shirts;
create policy "shirts_insert_own"
  on public.shirts for insert
  with check (auth.uid() = user_id);

drop policy if exists "shirts_update_own" on public.shirts;
create policy "shirts_update_own"
  on public.shirts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "shirts_delete_own" on public.shirts;
create policy "shirts_delete_own"
  on public.shirts for delete
  using (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- wishlist
-- -------------------------------------------------------------------------
alter table public.wishlist enable row level security;

drop policy if exists "wishlist_select_own" on public.wishlist;
create policy "wishlist_select_own"
  on public.wishlist for select
  using (auth.uid() = user_id);

drop policy if exists "wishlist_insert_own" on public.wishlist;
create policy "wishlist_insert_own"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "wishlist_update_own" on public.wishlist;
create policy "wishlist_update_own"
  on public.wishlist for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "wishlist_delete_own" on public.wishlist;
create policy "wishlist_delete_own"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- subscriptions
-- -------------------------------------------------------------------------
-- El usuario puede LEER su propia suscripcion, pero no puede insertar,
-- editar ni borrar filas directamente: eso lo maneja el trigger de alta
-- (FREE por defecto) y, en el futuro, el backend/webhooks de Mercado Pago
-- o PayPal usando la service role key (que bypassea RLS).
alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);
