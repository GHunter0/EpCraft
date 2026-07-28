"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  maker: string;
  category: string;
  price: string;
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Walnut Dining Table",
    maker: "Elias",
    category: "Furniture",
    price: "Rs. 52,400",
    image: "/epcraft/walnut-dining-table.jpg",
  },
  {
    id: 2,
    name: "Oak Serving Board",
    maker: "Sarah",
    category: "Kitchenware",
    price: "Rs. 3,120",
    image: "/epcraft/oak-serving-board.jpg",
  },
  {
    id: 3,
    name: "Cedar Wall Art",
    maker: "Marco",
    category: "Decor",
    price: "Rs. 9,850",
    image: "/epcraft/cedar-wall-art.jpg",
  },
  {
    id: 4,
    name: "Cherry Nightstand",
    maker: "Anna",
    category: "Furniture",
    price: "Rs. 11,200",
    image: "/epcraft/cherry-nightstand.jpg",
  },
  {
    id: 5,
    name: "Maple Bowl Set",
    maker: "Theo",
    category: "Kitchenware",
    price: "Rs. 2,320",
    image: "/epcraft/maple-bowl-set.jpg",
  },
  {
    id: 6,
    name: "Ash Floating Shelf",
    maker: "Sofia",
    category: "Furniture",
    price: "Rs. 4,450",
    image: "/epcraft/ash-floating-shelf.jpg",
  },
  {
    id: 7,
    name: "Ebony Valet Tray",
    maker: "Lucas",
    category: "Custom Gifts",
    price: "Rs. 5,880",
    image: "/epcraft/ebony-valet-tray.jpg",
  },
  {
    id: 8,
    name: "Organic Desk Chair",
    maker: "Julian",
    category: "Furniture",
    price: "Rs. 7,180",
    image: "/epcraft/organic-desk-chair.jpg",
  },
];

const categories = [
  "All",
  "Furniture",
  "Decor",
  "Kitchenware",
  "Custom Gifts",
];

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M20.8 4.8a5.3 5.3 0 0 0-7.5 0L12 6.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" />
    </svg>
  );
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.maker.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  function toggleWishlist(productId: number) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] text-[#5a321b]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fbf5ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1500px] items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className="font-[Georgia,serif] text-[34px] font-semibold tracking-[-0.04em] text-[#5a2e14]"
          >
            EpCraft
          </Link>

          <nav className="flex items-center gap-8 text-[16px] text-[#5d5047]">
            <Link href="/" className="transition hover:text-[#5a2e14]">
              Home
            </Link>

            <Link
              href="/shop"
              className="border-b-2 border-[#6b4328] pb-2 font-medium text-[#5a2e14]"
            >
              Shop
            </Link>
          </nav>
        </div>
      </header>

      {/* SHOP HEADER */}
      <section className="border-b border-[#eadfce] px-6 py-16 text-center md:px-12">
        <p className="text-[12px] uppercase tracking-[0.25em] text-[#b7771d]">
          Handcrafted Collection
        </p>

        <h1 className="mt-4 font-[Georgia,serif] text-[42px] md:text-[56px]">
          Shop EpCraft
        </h1>

        <p className="mx-auto mt-5 max-w-[650px] text-[16px] leading-7 text-[#6c6058]">
          Discover handcrafted wooden furniture, decor, kitchenware and
          meaningful custom gifts made by independent artisans.
        </p>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, categories or makers..."
              className="w-full rounded-full border border-[#ddcbb7] bg-white px-6 py-4 text-[15px] outline-none focus:border-[#6b4328] lg:max-w-[470px]"
            />

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-5 py-2.5 text-[14px] transition ${
                    selectedCategory === category
                      ? "border-[#5a2e14] bg-[#5a2e14] text-white"
                      : "border-[#ddcbb7] bg-transparent text-[#5d5047] hover:border-[#5a2e14]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-[14px] text-[#75685e]">
            Showing {filteredProducts.length} products
          </p>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-[1400px]">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[#eadfce] bg-white px-6 py-20 text-center">
              <h2 className="font-[Georgia,serif] text-[28px]">
                No products found
              </h2>

              <p className="mt-3 text-[#71655c]">
                Try another search word or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const saved = wishlist.includes(product.id);

                return (
                  <article key={product.id} className="group text-center">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#e9ddce]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.035]"
                      />

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md transition ${
                          saved
                            ? "text-[#8e3b2c]"
                            : "text-[#6a4a36] hover:text-[#8e3b2c]"
                        }`}
                        aria-label={`Save ${product.name}`}
                      >
                        <HeartIcon filled={saved} />
                      </button>
                    </div>

                    <span className="mt-4 inline-block rounded-full bg-white px-4 py-1 text-[9px] uppercase tracking-[0.17em] text-[#6c6058]">
                      Handmade by {product.maker}
                    </span>

                    <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-[#9a806d]">
                      {product.category}
                    </p>

                    <h2 className="mt-2 font-[Georgia,serif] text-[19px]">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-[15px] font-semibold text-[#b7771d]">
                      {product.price}
                    </p>

                    <button
                      type="button"
                      className="mt-5 w-full rounded-full border border-[#5a2e14] px-5 py-3 text-[14px] font-medium transition hover:bg-[#5a2e14] hover:text-white"
                    >
                      View Product
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}