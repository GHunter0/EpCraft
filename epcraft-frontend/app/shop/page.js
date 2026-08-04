import Breadcrumb from "@/components/Breadcrumb";
import ShopFilters from "@/components/ShopFilters";
import ShopResultsList from "@/components/ShopResultsList";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

export default async function ShopPage({ searchParams }) {
  // Extract parameters
  const category = searchParams?.category || null;
  const wood = searchParams?.wood || null;
  const inStockOnly = searchParams?.inStock === "true";
  const sort = searchParams?.sort || "Best Selling";
  const searchQuery = searchParams?.search || null;

  // Parallel fetch: filtered products, all categories, and all products to extract dynamic wood types
  const [filteredProducts, categories, allProducts] = await Promise.all([
    getProducts({ category, wood, inStockOnly, sort, searchQuery }),
    getCategories(),
    getProducts()
  ]);

  // Dynamically extract unique wood types present in the database catalog
  const woodTypes = Array.from(
    new Set(allProducts.map((p) => p.woodType || p.wood_type).filter(Boolean))
  ).sort();

  return (
    <div className="container-page flex flex-col gap-8 py-8 pb-24 bg-cream min-h-screen">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category ?? "All Products" },
        ]}
      />

      <div className="flex flex-col gap-8 md:flex-row">
        <ShopFilters categories={categories} woodTypes={woodTypes} />

        <ShopResultsList products={filteredProducts} />
      </div>
    </div>
  );
}
