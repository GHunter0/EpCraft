import Breadcrumb from "@/components/Breadcrumb";
import ShopFilters from "@/components/ShopFilters";
import ShopResultsList from "@/components/ShopResultsList";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

export const revalidate = 0;

export const metadata = {
  title: "Wholesale Woodcraft Collections — EpCraft Workshop Catalog",
  description: "Browse our collection of handcrafted wooden pieces available for bulk orders.",
};

export default async function WholesalePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  
  // Extract parameters
  const category = resolvedSearchParams?.category || null;
  const wood = resolvedSearchParams?.wood || null;
  const inStockOnly = resolvedSearchParams?.inStock === "true";
  const sort = resolvedSearchParams?.sort || "Best Selling";
  const searchQuery = resolvedSearchParams?.search || null;

  // Parallel fetch: filtered wholesale products, all categories, and all wholesale products for dynamic wood types
  const [filteredProducts, categories, allProducts] = await Promise.all([
    getProducts({ category, wood, inStockOnly, sort, searchQuery, isWholesaleOnly: true }),
    getCategories(),
    getProducts({ isWholesaleOnly: true })
  ]);

  // Dynamically extract unique wood types present in the wholesale database catalog
  const woodTypes = Array.from(
    new Set(allProducts.map((p) => p.woodType || p.wood_type).filter(Boolean))
  ).sort();

  return (
    <div className="container-page flex flex-col gap-8 py-8 pb-24 bg-cream min-h-screen">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Wholesale", href: "/wholesale" },
          { label: category ?? "All Wholesale Products" },
        ]}
      />

      <div className="flex flex-col gap-8 md:flex-row">
        <ShopFilters categories={categories} woodTypes={woodTypes} />
        <ShopResultsList products={filteredProducts} />
      </div>
    </div>
  );
}
