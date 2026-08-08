# Actualización Catálogo

Esta versión incluye:
- catálogo global de camisetas;
- colecciones personales aisladas por RLS;
- panel admin `/admin/catalogo`;
- detección de `role=admin` en navegación y catálogo;
- subida directa de imágenes del catálogo al bucket `catalog-images`;
- carga manual personal preservada.

## SQL requerido (solo si aún no fue ejecutado)
1. `supabase/catalog_migration.sql`
2. `supabase/catalog_storage_migration.sql`

No vuelvas a ejecutar los SQL si ya se ejecutaron correctamente: son idempotentes en su mayor parte, pero no hace falta repetirlos.
