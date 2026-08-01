-- Supabase Seed File: EpCraft Seed Catalog Data
-- Populates categories, makers, and products extracted from lib/products.js

-- 1. Categories Seed
insert into public.categories (id, name, image_url) values
  ('furniture', 'Furniture', '/images/categories/furniture.jpg'),
  ('decor', 'Decor', '/images/categories/decor.jpg'),
  ('kitchenware', 'Kitchenware', '/images/categories/kitchenware.jpg'),
  ('custom-gifts', 'Custom Gifts', '/images/categories/custom-gifts.jpg')
on conflict (id) do update set
  name = excluded.name,
  image_url = excluded.image_url;

-- 2. Makers Seed
insert into public.makers (id, name, bio, photo_url) values
  ('elias', 'Elias', 'Master woodworker specializing in live-edge walnut dining tables and custom furniture.', '/images/makers/elias.jpg'),
  ('sarah', 'Sarah', 'Artisan craftsman creating sustainable white oak serving boards and kitchenware.', '/images/makers/sarah.jpg'),
  ('marco', 'Marco', 'Sculptor and woodworker crafting aromatic cedar wall art and home accents.', '/images/makers/marco.jpg'),
  ('anna', 'Anna', 'Fine furniture maker focusing on solid cherry nightstands and bedroom pieces.', '/images/makers/anna.jpg'),
  ('theo', 'Theo', 'Woodturner creating elegant hand-turned maple bowl sets and dining accessories.', '/images/makers/theo.jpg'),
  ('sofia', 'Sofia', 'Minimalist designer crafting natural matte ash floating shelves and decor.', '/images/makers/sofia.jpg'),
  ('lucas', 'Lucas', 'Detail artisan specializing in dark ebony valet trays and luxury custom gifts.', '/images/makers/lucas.jpg'),
  ('julian', 'Julian', 'Ergonomic furniture designer creating bent-wood desk chairs and studio pieces.', '/images/makers/julian.jpg')
on conflict (id) do update set
  name = excluded.name,
  bio = excluded.bio,
  photo_url = excluded.photo_url;

-- 3. Products Seed
insert into public.products (id, name, price, category_id, maker_id, material, wood_type, in_stock, description, image_url) values
  ('walnut-dining-table', 'Walnut Dining Table', 52400, 'furniture', 'elias', 'Premium American Walnut', 'Walnut', true, 'A solid walnut dining table hand-finished with natural oil, built to seat six comfortably.', '/images/products/placeholder-1.jpg'),
  ('oak-serving-board', 'Oak Serving Board', 3120, 'kitchenware', 'sarah', 'Live Edge White Oak', 'Oak', true, 'A live-edge oak serving board, food-safe finished, ideal for cheese and charcuterie.', '/images/products/placeholder-2.jpg'),
  ('cedar-wall-art', 'Cedar Wall Art', 9850, 'decor', 'marco', 'Aromatic Cedar', 'Cedar', true, 'Hand-carved cedar wall panel with a warm, aromatic finish.', '/images/products/placeholder-3.jpg'),
  ('cherry-nightstand', 'Cherry Nightstand', 11200, 'furniture', 'anna', 'Solid Cherry Wood', 'Cherry', true, 'A compact cherry-wood nightstand with a single soft-close drawer.', '/images/products/placeholder-4.jpg'),
  ('maple-bowl-set', 'Maple Bowl Set', 2320, 'kitchenware', 'theo', 'Hand-Turned Maple', 'Maple', true, 'A set of three hand-turned maple bowls, finished with food-grade oil.', '/images/products/placeholder-5.jpg'),
  ('ash-floating-shelf', 'Ash Floating Shelf', 4450, 'decor', 'sofia', 'Natural Matte Ash', 'Ash', false, 'A minimalist ash floating shelf with a hidden mounting bracket.', '/images/products/placeholder-6.jpg'),
  ('ebony-valet-tray', 'Ebony Valet Tray', 6280, 'custom-gifts', 'lucas', 'Dark Ebony', 'Ebony', true, 'A dark ebony valet tray, hand-sanded to a satin finish.', '/images/products/placeholder-7.jpg'),
  ('organic-desk-chair', 'Organic Desk Chair', 71800, 'furniture', 'julian', 'Black Walnut Collection', 'Walnut', true, 'An ergonomic bent-wood desk chair with an organic, sculpted silhouette.', '/images/products/placeholder-8.jpg')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  category_id = excluded.category_id,
  maker_id = excluded.maker_id,
  material = excluded.material,
  wood_type = excluded.wood_type,
  in_stock = excluded.in_stock,
  description = excluded.description,
  image_url = excluded.image_url;
