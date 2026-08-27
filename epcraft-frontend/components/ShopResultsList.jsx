"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import ShopProductCard from "@/components/ShopProductCard";

const sortOptions = ["Best Selling", "Price: Low to High", "Price: High to Low", "Newest"];
const PAGE_SIZE = 9;

export default function ShopResultsList({ products = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [view, setView] = useState("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProducts = products.slice(0, visibleCount);

  const searchParamsString = searchParams.toString();
  const [prevParams, setPrevParams] = useState(searchParamsString);

  if (searchParamsString !== prevParams) {
    setPrevParams(searchParamsString);
    setVisibleCount(PAGE_SIZE);
  }

  const currentSort = searchParams.get("sort") || "Best Selling";

  const updateSort = (option) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setSortOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-espresso md:text-3xl">
            {products.length} {products.length === 1 ? "Product" : "Products"} Found
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
              {currentSort}
              <ChevronDown size={16} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-xl border border-border/40 bg-white p-2 shadow-card">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateSort(opt)}
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

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-espresso font-semibold">No products found</p>
          <p className="mt-2 font-sans text-base text-bark">
            No products match those filters yet — try clearing a filter.
          </p>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 gap-6 md:grid-cols-3"
              : "flex flex-col gap-6"
          }
        >
          {visibleProducts.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {visibleCount < products.length && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="btn-outline-dark px-12 py-4"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}
