-- Migration: 20260801000000_create_schema_and_triggers.sql
-- Description: Core schema tables, indexes, constraints, and auth triggers for EpCraft

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  address text,
  is_admin boolean default false not null,
  created_at timestamptz default now() not null
);

-- 2. Categories Table
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  image_url text
);

-- 3. Makers Table
create table if not exists public.makers (
  id text primary key,
  name text not null,
  bio text,
  photo_url text
);

-- 4. Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric not null check (price >= 0),
  category_id text references public.categories(id) on delete set null,
  maker_id text references public.makers(id) on delete set null,
  material text,
  wood_type text,
  in_stock boolean default true not null,
  description text,
  image_url text,
  created_at timestamptz default now() not null
);

-- 5. Cart Items Table
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer default 1 not null check (quantity > 0),
  custom_options jsonb,
  created_at timestamptz default now() not null
);

-- Unique constraint on (user_id, product_id) when custom_options is null
create unique index if not exists cart_items_user_product_no_custom_idx
  on public.cart_items (user_id, product_id)
  where custom_options is null;

-- 6. Wishlist Items Table
create table if not exists public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz default now() not null,
  constraint wishlist_items_user_product_unique unique (user_id, product_id)
);

-- 7. Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text default 'pending_payment' not null,
  payment_status text default 'unpaid' not null,
  payhere_order_id text,
  delivery_method text,
  subtotal numeric not null check (subtotal >= 0),
  tax numeric default 0 check (tax >= 0),
  shipping numeric default 0 check (shipping >= 0),
  total numeric not null check (total >= 0),
  shipping_address jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 8. Order Items Table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null check (price_at_purchase >= 0),
  custom_options jsonb
);

-- 9. Custom Order Requests Table
create table if not exists public.custom_order_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  base_product_id text references public.products(id) on delete set null,
  finish text,
  dimension text,
  engraving_text text,
  font text,
  status text default 'pending_review' not null check (status in ('pending_review', 'quoted', 'accepted', 'declined')),
  quoted_price numeric check (quoted_price >= 0),
  quoted_lead_time text,
  admin_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  updated_by uuid references public.profiles(id) on delete set null
);

-- Automatic Profile Creation Trigger on Auth Sign-Up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone, address, is_admin)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger binding
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
