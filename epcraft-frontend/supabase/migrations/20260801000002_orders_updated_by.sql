-- Migration: 20260801000002_orders_updated_by.sql
-- Description: Add updated_by column to orders to track which admin last changed the status

alter table public.orders
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

-- Trigger: auto-update updated_at whenever orders row is modified
create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_orders_updated_at();
