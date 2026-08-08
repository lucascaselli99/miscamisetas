-- =========================================================================
-- Mis Camisetas - Supabase Storage (bucket privado de fotos)
-- =========================================================================
-- Paso 1: crear el bucket "shirts" desde el Dashboard
--   Storage > New bucket > name: shirts > Public bucket: DESACTIVADO
-- (o descomentar el insert de abajo para crearlo por SQL).
--
-- Convencion de path dentro del bucket: {user_id}/{archivo}
-- Ejemplo: 3fa85f64-5717-4562-b3fc-2c963f66afa6/1719499200000-camiseta.jpg
-- Las policies de abajo usan esa convencion para restringir el acceso.
-- =========================================================================

-- Descomentar si preferis crear el bucket por SQL en vez del Dashboard:
-- insert into storage.buckets (id, name, public)
-- values ('shirts', 'shirts', false)
-- on conflict (id) do nothing;

-- -------------------------------------------------------------------------
-- Policies sobre storage.objects, acotadas al bucket "shirts"
-- El primer segmento del path (storage.foldername) debe ser el user_id
-- del usuario autenticado.
-- -------------------------------------------------------------------------
drop policy if exists "shirts_storage_select_own" on storage.objects;
create policy "shirts_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'shirts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "shirts_storage_insert_own" on storage.objects;
create policy "shirts_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'shirts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "shirts_storage_update_own" on storage.objects;
create policy "shirts_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'shirts'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'shirts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "shirts_storage_delete_own" on storage.objects;
create policy "shirts_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'shirts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =========================================================================
-- Bucket "avatars" (foto de perfil)
-- =========================================================================
-- A diferencia de "shirts", este bucket es PUBLICO de lectura (es normal
-- que un avatar se muestre sin necesidad de signed URLs). La escritura
-- sigue restringida al propio usuario con la misma convencion de path
-- {user_id}/archivo.
--
-- Storage > New bucket > name: avatars > Public bucket: ACTIVADO
-- (o descomentar el insert de abajo).

-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict (id) do nothing;

drop policy if exists "avatars_storage_select_public" on storage.objects;
create policy "avatars_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_storage_insert_own" on storage.objects;
create policy "avatars_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_storage_update_own" on storage.objects;
create policy "avatars_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_storage_delete_own" on storage.objects;
create policy "avatars_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
