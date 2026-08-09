import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqgnhkhcepvtfujvbnte.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create a static public client that does not access cookies.
// This allows getProducts / getProductById to be called during generateStaticParams/static build.
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

/**
 * Fetch products from Supabase with optional filters.
 */
export async function getProducts({ category, wood, inStockOnly, sort, searchQuery } = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      maker:makers (
        name
      ),
      category:categories (
        name
      )
    `)

  if (category) {
    const catId = category.toLowerCase().trim().replace(/\s+/g, '-');
    query = query.eq('category_id', catId)
  }

  if (wood) {
    query = query.eq('wood_type', wood)
  }

  if (inStockOnly) {
    query = query.eq('in_stock', true)
  }

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  if (sort === "Price: Low to High") {
    query = query.order('price', { ascending: true })
  } else if (sort === "Price: High to Low") {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (data || []).map(p => ({
    ...p,
    maker: p.maker?.name || 'Artisan',
    category: p.category?.name || 'Woodcraft',
    woodType: p.wood_type,
    inStock: p.in_stock,
    image: p.image_url,
    stock: p.stock,
    allowBackorder: p.allow_backorder
  }))
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      maker:makers (*),
      category:categories (*)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching product by id ${id}:`, error)
    return null
  }

  if (!data) return null

  return {
    ...data,
    maker: data.maker?.name || 'Artisan',
    maker_details: data.maker,
    category: data.category?.name || 'Woodcraft',
    woodType: data.wood_type,
    inStock: data.in_stock,
    image: data.image_url,
    stock: data.stock,
    allowBackorder: data.allow_backorder
  }
}
