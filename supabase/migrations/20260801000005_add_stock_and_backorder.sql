-- Migration: 20260801000005_add_stock_and_backorder.sql
-- Description: Add stock and allow_backorder columns, cart constraints, and atomic decrement logic

-- 1. Add columns to products table
alter table public.products
  add column if not exists stock integer not null default 10 check (stock >= 0),
  add column if not exists allow_backorder boolean not null default false;

-- 2. Trigger function to validate cart items stock level server-side
create or replace function public.check_cart_item_stock()
returns trigger
language plpgsql
security definer
as $$
declare
  v_stock integer;
  v_allow_backorder boolean;
  v_name text;
begin
  select stock, allow_backorder, name into v_stock, v_allow_backorder, v_name
  from public.products
  where id = new.product_id;
  
  if not found then
    raise exception 'Product not found.';
  end if;
  
  if not v_allow_backorder and v_stock < new.quantity then
    raise exception 'Insufficient stock: only % unit(s) of % are available.', v_stock, v_name;
  end if;
  
  return new;
end;
$$;

-- 3. Bind the validation trigger to cart_items
drop trigger if exists check_cart_item_stock_trigger on public.cart_items;
create trigger check_cart_item_stock_trigger
  before insert or update on public.cart_items
  for each row execute function public.check_cart_item_stock();

-- 4. Stored procedure to atomically decrement stock for all items in an order
create or replace function public.decrement_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  item record;
  v_updated integer;
  v_name text;
begin
  -- Loop through order items and update product stocks
  for item in 
    select product_id, quantity 
    from public.order_items 
    where order_id = p_order_id
  loop
    update public.products
    set stock = stock - item.quantity,
        in_stock = case when (stock - item.quantity) > 0 then true else false end
    where id = item.product_id 
      and (allow_backorder = true or stock >= item.quantity);
      
    get diagnostics v_updated = row_count;
    
    if v_updated = 0 then
      -- Retrieve product name for the error message
      select name into v_name from public.products where id = item.product_id;
      raise exception 'Failed to purchase: product "%" has insufficient stock.', coalesce(v_name, item.product_id);
    end if;
  end loop;
  
  return true;
end;
$$;
