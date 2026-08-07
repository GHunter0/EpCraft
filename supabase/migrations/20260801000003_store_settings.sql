-- Migration Addendum: Create store_settings table
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1), -- Enforce single row
  standard_shipping numeric not null default 0 check (standard_shipping >= 0),
  express_shipping numeric not null default 150 check (express_shipping >= 0),
  tax_percentage numeric not null default 8 check (tax_percentage >= 0),
  store_name text not null default 'EpCraft',
  store_email text not null default 'contact@epcraft.com',
  store_phone text not null default '+94 11 234 5678',
  store_address text not null default '123 Artisan Lane, Colombo, Sri Lanka',
  updated_at timestamptz default now() not null
);

-- Insert default single settings row if not exists
insert into public.store_settings (id, standard_shipping, express_shipping, tax_percentage, store_name, store_email, store_phone, store_address)
values (1, 0, 150, 8, 'EpCraft', 'contact@epcraft.com', '+94 11 234 5678', '123 Artisan Lane, Colombo, Sri Lanka')
on conflict (id) do nothing;

-- Enable RLS
alter table public.store_settings enable row level security;

-- Policies
create policy "Public read store settings" on public.store_settings for select using (true);
create policy "Admin update store settings" on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
