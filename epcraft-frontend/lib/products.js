// Real database integration layer - hardcoded arrays removed.
// Fetch functions have moved to lib/data/products.js and lib/data/categories.js.

export function formatPrice(amount) {
  if (amount === undefined || amount === null) return "Rs. 0";
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export function getProductImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Resolve against public Supabase storage bucket "product-images"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqgnhkhcepvtfujvbnte.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/product-images/${imageUrl}`;
}

