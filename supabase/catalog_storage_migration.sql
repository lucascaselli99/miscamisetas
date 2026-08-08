-- Mis Camisetas - V2.1: imagenes publicas del catalogo
-- Ejecutar UNA VEZ en Supabase SQL Editor.
-- Crea el bucket publico `catalog-images` y restringe la escritura a admins.

insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do update set public = true;

-- Lectura publica: las imagenes del catalogo se muestran en la app a todos.
drop policy if exists "catalog_images_select_public" on storage.objects;
create policy "catalog_images_select_public"
  on storage.objects for select
  using (bucket_id = 'catalog-images');

-- Solo administradores pueden subir imagenes al catalogo.
drop policy if exists "catalog_images_admin_insert" on storage.objects;
create policy "catalog_images_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'catalog-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Solo administradores pueden reemplazar imagenes del catalogo.
drop policy if exists "catalog_images_admin_update" on storage.objects;
create policy "catalog_images_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'catalog-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'catalog-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Solo administradores pueden borrar imagenes del catalogo.
drop policy if exists "catalog_images_admin_delete" on storage.objects;
create policy "catalog_images_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'catalog-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
