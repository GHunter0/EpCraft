-- Migration: 20260801000006_sync_stock_in_stock.sql
-- Description: Automatically synchronize products.in_stock boolean with products.stock quantity

create or replace function public.sync_product_stock_and_availability()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If stock was changed
  if tg_op = 'UPDATE' and old.stock is distinct from new.stock then
    if new.stock > 0 then
      new.in_stock := true;
    else
      new.in_stock := false;
    end if;
  end if;

  -- If in_stock was changed
  if tg_op = 'UPDATE' and old.in_stock is distinct from new.in_stock then
    if new.in_stock = false then
      new.stock := 0;
    elsif new.in_stock = true and new.stock = 0 then
      -- If marked in stock but quantity was 0, reset to default stock of 10
      new.stock := 10;
    end if;
  end if;

  -- For new inserts, align stock and in_stock
  if tg_op = 'INSERT' then
    if new.stock > 0 then
      new.in_stock := true;
    else
      new.in_stock := false;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_product_stock_trigger on public.products;
create trigger sync_product_stock_trigger
  before insert or update on public.products
  for each row execute function public.sync_product_stock_and_availability();
