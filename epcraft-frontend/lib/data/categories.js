import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqgnhkhcepvtfujvbnte.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

/**
 * Fetch categories from Supabase.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return (data || []).map(cat => ({
    ...cat,
    image: cat.image_url
  }))
}

