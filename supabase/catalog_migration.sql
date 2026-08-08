-- Mis Camisetas - Migracion V2: catalogo global
-- Ejecutar UNA VEZ sobre la base existente. Conserva todas las camisetas actuales.

create table if not exists public.catalog_shirts (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  country text,
  season text not null,
  shirt_type text check (shirt_type in ('local','visitante','tercera','arquero','otra')),
  brand text,
  category text not null default 'club' check (category in ('club','seleccion')),
  competition text,
  description text,
  image_url text,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'approved' check (status in ('approved','pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shirts add column if not exists catalog_shirt_id uuid references public.catalog_shirts(id) on delete set null;
alter table public.wishlist add column if not exists catalog_shirt_id uuid references public.catalog_shirts(id) on delete set null;
create index if not exists shirts_catalog_shirt_id_idx on public.shirts(catalog_shirt_id);
create index if not exists wishlist_catalog_shirt_id_idx on public.wishlist(catalog_shirt_id);
create index if not exists catalog_shirts_search_idx on public.catalog_shirts(team_name, season, brand);
create index if not exists catalog_shirts_status_idx on public.catalog_shirts(status);

drop trigger if exists set_updated_at on public.catalog_shirts;
create trigger set_updated_at before update on public.catalog_shirts
for each row execute function public.handle_updated_at();

alter table public.catalog_shirts enable row level security;

drop policy if exists "catalog_select_approved" on public.catalog_shirts;
create policy "catalog_select_approved" on public.catalog_shirts for select
using (status = 'approved' or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_admin_insert" on public.catalog_shirts;
create policy "catalog_admin_insert" on public.catalog_shirts for insert
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_admin_update" on public.catalog_shirts;
create policy "catalog_admin_update" on public.catalog_shirts for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_admin_delete" on public.catalog_shirts;
create policy "catalog_admin_delete" on public.catalog_shirts for delete
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Conteo agregado seguro: no expone filas privadas de otros usuarios.
create or replace function public.catalog_collection_counts()
returns table(catalog_shirt_id uuid, owners bigint)
language sql
security definer
set search_path = public
stable
as $$
  select s.catalog_shirt_id, count(distinct s.user_id)::bigint
  from public.shirts s
  where s.catalog_shirt_id is not null
  group by s.catalog_shirt_id;
$$;
grant execute on function public.catalog_collection_counts() to authenticated;
