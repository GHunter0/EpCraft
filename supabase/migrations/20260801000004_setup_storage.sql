-- Migration: 20260801000004_setup_storage.sql
-- Description: Create product-images storage bucket and configure access policies

-- 1. Ensure the product-images bucket exists
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Clean up any existing policies on storage.objects for the product-images bucket
-- to prevent duplicate policy errors.
drop policy if exists "Public Access to product-images" on storage.objects;
drop policy if exists "Admin Insert to product-images" on storage.objects;
drop policy if exists "Admin Update to product-images" on storage.objects;
drop policy if exists "Admin Delete from product-images" on storage.objects;

-- 3. Create public read policy
create policy "Public Access to product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- 4. Create admin insert policy
create policy "Admin Insert to product-images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated' 
    and public.is_admin()
  );

-- 5. Create admin update policy
create policy "Admin Update to product-images"
  on storage.objects for update
  using (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated' 
    and public.is_admin()
  );

-- 6. Create admin delete policy
create policy "Admin Delete from product-images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated' 
    and public.is_admin()
  );
