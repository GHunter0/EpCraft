import Link from "next/link";
import { Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

export const revalidate = 0;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  // Take the first 4 products as featured items
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[600px] w-full items-center overflow-hidden md:h-[819px]">
        <div className="absolute inset-0 bg-gradient-to-br from-espresso/40 to-ink/60" />
        <div className="absolute inset-0 -z-10 bg-sand" />
        <div className="container-page relative flex flex-col gap-4 text-white">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl leading-tight md:text-5xl">
              Handcrafted Wood,
              <br />
              Made For You
            </h1>
            <p className="mt-4 max-w-xl font-sans text-base opacity-90 md:text-lg">
              Artisanal furniture and decor crafted with soul and precision, bridging
              traditional techniques with modern intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop Collection
              </Link>
              <Link href="/story" className="btn-secondary">
                Meet Our Craftsmen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container-page flex flex-col items-center gap-16 py-24">
        <div className="flex flex-col items-center gap-4">
          <h2 className="h2 text-center">Shop by Category</h2>
          <div className="h-px w-72 bg-gradient-to-r from-transparent via-gold to-transparent md:w-[576px]" />
        </div>

        <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-6"
            >
              <div className="h-40 w-40 overflow-hidden rounded-pill bg-sand shadow-card md:h-56 md:w-56 flex items-center justify-center font-serif text-lg text-bark">
                {cat.name.charAt(0)}
              </div>
              <h3 className="h3 text-center">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page flex flex-col gap-16 py-24">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="h2">Featured Products</h2>
            <p className="font-sans italic text-bark">Tactile pieces for a modern home.</p>
          </div>
          <Link href="/shop" className="hidden font-sans text-gold hover:underline md:block">
            View All Products
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="py-12 text-center font-sans text-bark">No featured products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Link href="/shop" className="text-center font-sans text-gold hover:underline md:hidden">
          View All Products
        </Link>
      </section>

      {/* Testimonial */}
      <section className="border-y border-border/40 bg-cream py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-8 text-center">
          <div className="flex gap-1 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <blockquote className="font-serif text-xl italic leading-relaxed text-espresso md:text-3xl">
            &ldquo;The Walnut Dining Table is not just furniture; it&apos;s the heart of our home.
            You can feel the artisan&apos;s touch in every grain. The AI Stylist helped us pick
            the perfect dimensions for our space.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-pill bg-sand" />
            <div className="text-left">
              <p className="font-sans text-espresso">Eleanor Rigby</p>
              <p className="font-sans text-bark">London, UK</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
