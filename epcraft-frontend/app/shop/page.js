"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ShopFilters from "@/components/ShopFilters";
import ShopProductCard from "@/components/ShopProductCard";
import { products } from "@/lib/products";

const sortOptions = ["Best Selling", "Price: Low to High", "Price: High to Low", "Newest"];

export default function ShopPage() {
  const [category, setCategory] = useState(null);
  const [wood, setWood] = useState(null);
  const [finish, setFinish] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(sortOptions[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState("grid");

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.category === category);
    if (wood) list = list.filter((p) => p.woodType === wood);
    if (inStockOnly) list = list.filter((p) => p.inStock);

    if (sort === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [category, wood, inStockOnly, sort]);

  return (
    <div className="container-page flex flex-col gap-8 py-8 pb-24">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category ?? "All Products" },
        ]}
      />

      <div className="flex flex-col gap-8 md:flex-row">
        <ShopFilters
          selectedCategory={category}
          onCategoryChange={setCategory}
          selectedWood={wood}
          onWoodChange={setWood}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
          selectedFinish={finish}
          onFinishChange={setFinish}
        />

        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-espresso md:text-3xl">
                {filtered.length} Products Found
              </h1>
              <p className="mt-1 font-sans text-base text-bark">
                Expertly curated furniture for your modern home.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-pill border border-border/40 bg-white px-6 py-2 font-sans text-base text-ink"
                >
                  {sort}
                  <ChevronDown size={16} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-xl border border-border/40 bg-white p-2 shadow-card">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSort(opt);
                          setSortOpen(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left font-sans text-sm text-bark hover:bg-cream"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 rounded-pill border border-border/40 bg-white p-1">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={`flex h-8 w-8 items-center justify-center rounded-pill ${
                    view === "grid" ? "bg-espresso text-white" : "text-bark"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={`flex h-8 w-8 items-center justify-center rounded-pill ${
                    view === "list" ? "bg-espresso text-white" : "text-bark"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

          {filtered.length === 0 ? (
            <p className="py-16 text-center font-sans text-bark">
              No products match those filters yet — try clearing a filter.
            </p>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-6 md:grid-cols-3"
                  : "flex flex-col gap-6"
              }
            >
              {filtered.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="flex justify-center pt-8">
            <button className="btn-outline-dark px-12 py-4">Load More Products</button>
          </div>
        </div>
      </div>
    </div>
  );
}
