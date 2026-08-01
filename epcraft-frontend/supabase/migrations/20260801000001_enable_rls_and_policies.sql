-- Migration: 20260801000001_enable_rls_and_policies.sql
-- Description: Row Level Security (RLS) policies and security functions for EpCraft

/*
  ================================================================================
  RLS ARCHITECTURE & SECURITY DESIGN DECISIONS
  ================================================================================

  1. ADMIN PRIVILEGE EVALUATION (`public.is_admin()`):
     - Uses a SECURITY DEFINER helper function to query `public.profiles.is_admin`.
     - `STABLE` function with `set search_path = ''` to prevent search path hijacking.
     - Prevents infinite recursion when policies on `profiles` call `is_admin()`.

  2. PUBLIC CATALOG ACCESS:
     - `products`, `categories`, and `makers` have public read access (`SELECT true`)
       so anonymous and logged-in users can browse catalog items.
     - `INSERT`, `UPDATE`, and `DELETE` on catalog tables are strictly restricted
       to authenticated admins (`is_admin()`).

  3. USER DATA ISOLATION (CART, WISHLIST, PROFILES):
     - `cart_items` and `wishlist_items` enforce full CRUD ownership checks (`auth.uid() = user_id`).
     - `profiles`: Users can select and update their own profile. Non-admins cannot elevate
       their own `is_admin` status. Admins can view all profiles.

  4. ORDERS & ORDER ITEMS PROTECTION:
     - Users can `SELECT` and `INSERT` only their own orders (`auth.uid() = user_id`).
     - Users cannot perform `UPDATE` on orders. Status and payment status updates are restricted:
       * Status updates: Admin only (`is_admin()`).
       * Payment status updates (PayHere callback): Executed exclusively via backend Route Handlers
         using the `SUPABASE_SERVICE_ROLE_KEY`, which safely bypasses RLS while protecting
         client-facing endpoints from unauthorized payment manipulation.

  5. CUSTOM ORDER REQUEST STATE MACHINE:
     - Users can `INSERT` custom requests with status default `'pending_review'` and null quotes.
     - Only Admins can set `quoted_price`, `quoted_lead_time`, and update status to `'quoted'`.
     - Users can only `UPDATE` requests that are currently in `'quoted'` status, and can only
       transition the status to `'accepted'` or `'declined'`.
  ================================================================================
*/

-- Security Definer helper for checking admin role
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.makers enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_order_requests enable row level security;

--------------------------------------------------------------------------------
-- 1. Profiles Policies
--------------------------------------------------------------------------------
create policy "Users can select own profile or admins select all"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile (cannot elevate admin status)"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

--------------------------------------------------------------------------------
-- 2. Catalog Policies (categories, makers, products)
--------------------------------------------------------------------------------
-- Public READ access
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read makers" on public.makers for select using (true);
create policy "Public read products" on public.products for select using (true);

-- Admin WRITE access
create policy "Admin insert categories" on public.categories for insert to authenticated with check (public.is_admin());
create policy "Admin update categories" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin delete categories" on public.categories for delete to authenticated using (public.is_admin());

create policy "Admin insert makers" on public.makers for insert to authenticated with check (public.is_admin());
create policy "Admin update makers" on public.makers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin delete makers" on public.makers for delete to authenticated using (public.is_admin());

create policy "Admin insert products" on public.products for insert to authenticated with check (public.is_admin());
create policy "Admin update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin delete products" on public.products for delete to authenticated using (public.is_admin());

--------------------------------------------------------------------------------
-- 3. Cart Items Policies
--------------------------------------------------------------------------------
create policy "Users select own cart items" on public.cart_items for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own cart items" on public.cart_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own cart items" on public.cart_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own cart items" on public.cart_items for delete to authenticated using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 4. Wishlist Items Policies
--------------------------------------------------------------------------------
create policy "Users select own wishlist items" on public.wishlist_items for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own wishlist items" on public.wishlist_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own wishlist items" on public.wishlist_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own wishlist items" on public.wishlist_items for delete to authenticated using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 5. Orders & Order Items Policies
--------------------------------------------------------------------------------
create policy "Users select own orders or admin select all"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own initial orders"
  on public.orders for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending_payment'
    and payment_status = 'unpaid'
  );

-- Only admins can update orders (e.g. status updates). Users cannot update payment_status directly (PayHere webhook uses service role key)
create policy "Admin update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users select order items for own orders or admin select all"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users insert order items for own orders"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and o.user_id = auth.uid()
    )
  );

create policy "Admin update order items"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

--------------------------------------------------------------------------------
-- 6. Custom Order Requests Policies
--------------------------------------------------------------------------------
create policy "Users select own custom requests or admin select all"
  on public.custom_order_requests for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own pending custom requests"
  on public.custom_order_requests for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending_review'
    and quoted_price is null
    and quoted_lead_time is null
  );

-- Admins can update any field (e.g., provide quotes, set status='quoted')
create policy "Admin update custom requests"
  on public.custom_order_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- User can only transition status from 'quoted' to 'accepted' or 'declined'
create policy "User respond to quoted custom requests"
  on public.custom_order_requests for update
  to authenticated
  using (
    auth.uid() = user_id
    and status = 'quoted'
  )
  with check (
    auth.uid() = user_id
    and status in ('accepted', 'declined')
  );
