import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import { getProductById, getProducts } from "@/lib/data/products";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductById(params.id);
  if (!product) return notFound();

  const allProducts = await getProducts();
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container-page flex flex-col gap-16 py-8 pb-24">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery product={product} />
        </div>
        <div className="lg:col-span-5">
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      <ProductTabs product={product} />

      <section className="flex flex-col gap-10">
        <h2 className="font-serif text-3xl font-semibold text-espresso">You may also like</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
