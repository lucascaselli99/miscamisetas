-- =========================================================================
-- Mis Camisetas - Esquema de base de datos
-- =========================================================================
-- Ejecutar este script en el SQL Editor de Supabase (Project > SQL Editor).
-- Es seguro volver a correrlo: usa "if not exists" / "or replace" donde aplica.
-- Despues de este script, correr policies.sql y storage.sql.
-- =========================================================================

-- Extension necesaria para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- Tabla: profiles
-- Un perfil por usuario de auth.users. Se crea automaticamente via trigger
-- cuando el usuario se registra (ver handle_new_user mas abajo).
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  -- Preparado para el futuro rol de administrador. No se construye panel
  -- de admin todavia, pero el campo queda listo.
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil publico de cada usuario, 1 a 1 con auth.users';

-- -------------------------------------------------------------------------
-- Tabla: shirts (coleccion personal)
-- -------------------------------------------------------------------------
create table if not exists public.shirts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Campos obligatorios
  team_name text not null,
  season text not null,

  -- Campos opcionales
  shirt_type text check (shirt_type in ('local', 'visitante', 'tercera', 'arquero', 'otra')),
  brand text,
  player_name text,
  shirt_number smallint check (shirt_number is null or (shirt_number >= 0 and shirt_number <= 99)),
  size text,
  version text check (version in ('fan', 'player', 'retro', 'otra')),
  condition text check (condition in ('nueva', 'usada')),
  purchase_date date,
  purchase_price numeric(10, 2) check (purchase_price is null or purchase_price >= 0),
  currency text default 'ARS',
  purchase_place text,
  notes text,

  -- Ruta privada dentro del bucket de Storage (no una URL publica).
  -- La app genera signed URLs a partir de este valor.
  image_url text,

  is_favorite boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.shirts is 'Camisetas de la coleccion personal de cada usuario';
comment on column public.shirts.image_url is 'Path del objeto en el bucket privado de Storage, no una URL publica';

create index if not exists shirts_user_id_idx on public.shirts (user_id);
create index if not exists shirts_user_id_created_at_idx on public.shirts (user_id, created_at desc);
create index if not exists shirts_user_id_favorite_idx on public.shirts (user_id, is_favorite);

-- -------------------------------------------------------------------------
-- Tabla: wishlist
-- -------------------------------------------------------------------------
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  team_name text not null,
  season text,
  shirt_type text check (shirt_type in ('local', 'visitante', 'tercera', 'arquero', 'otra')),
  player_name text,
  shirt_number smallint check (shirt_number is null or (shirt_number >= 0 and shirt_number <= 99)),

  priority text not null default 'me_interesa'
    check (priority in ('la_quiero_si_o_si', 'me_interesa', 'algun_dia')),

  notes text,
  image_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.wishlist is 'Camisetas deseadas por el usuario, pendientes de conseguir';

create index if not exists wishlist_user_id_idx on public.wishlist (user_id);
create index if not exists wishlist_user_id_priority_idx on public.wishlist (user_id, priority);

-- -------------------------------------------------------------------------
-- Tabla: subscriptions
-- Preparada para planes FREE/PRO y pasarelas de pago futuras
-- (Mercado Pago, PayPal, cuentas PRO regaladas, etc). Todavia no hay
-- integracion de pagos: todos los usuarios arrancan en plan FREE.
-- -------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  plan text not null default 'FREE' check (plan in ('FREE', 'PRO')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'canceled', 'past_due')),

  -- 'none' = sin proveedor (ej. plan FREE por defecto o cuenta regalada manual)
  provider text not null default 'none'
    check (provider in ('mercadopago', 'paypal', 'gift', 'none')),
  provider_subscription_id text,

  started_at timestamptz not null default now(),
  expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Estado de suscripcion/plan de cada usuario. V1: siempre FREE.';

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- -------------------------------------------------------------------------
-- Funcion generica para mantener updated_at al dia
-- -------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.shirts;
create trigger set_updated_at
  before update on public.shirts
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.wishlist;
create trigger set_updated_at
  before update on public.wishlist
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------------------
-- Funcion + trigger: al crear un usuario en auth.users, crear su profile
-- y su registro de subscription FREE automaticamente.
-- SECURITY DEFINER: corre con permisos del owner (postgres), por lo que
-- puede escribir en public.profiles / public.subscriptions aunque RLS
-- bloquee esas tablas para el usuario recien creado.
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status, provider)
  values (new.id, 'FREE', 'active', 'none');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
