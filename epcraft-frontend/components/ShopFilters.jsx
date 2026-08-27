"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const finishSwatches = [
  { name: "Natural Oak", color: "#e5d5c0" },
  { name: "Dark Espresso", color: "#3d2b1f" },
  { name: "Honey Gold", color: "#c68e17" },
  { name: "Charcoal Grey", color: "#5c5c5c" },
];

function FilterSection({ title, children }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="border-b border-border/40 pb-2 font-serif text-base text-espresso">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ShopFilters({ categories = [], woodTypes = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read current filters from URL
  const selectedCategory = searchParams.get("category");
  const selectedWood = searchParams.get("wood");
  const selectedFinish = searchParams.get("finish");
  const inStockOnly = searchParams.get("inStock") === "true";

  const activeCount = [selectedCategory, selectedWood, selectedFinish, inStockOnly || null].filter(
    Boolean
  ).length;

  const updateQuery = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const filterContent = (
    <>
      <FilterSection title="Category">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <label key={cat.id || cat.name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategory === cat.name}
                onChange={() => updateQuery("category", selectedCategory === cat.name ? null : cat.name)}
                className="h-5 w-5 rounded border-border/60 text-espresso focus:ring-gold"
              />
              <span className="font-sans text-base text-bark">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Wood Type">
        <div className="flex flex-col gap-3">
          {woodTypes.map((wood) => (
            <label key={wood} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedWood === wood}
                onChange={() => updateQuery("wood", selectedWood === wood ? null : wood)}
                className="h-5 w-5 rounded border-border/60 text-espresso focus:ring-gold"
              />
              <span className="font-sans text-base text-bark">{wood}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Finish">
        <div className="flex gap-3">
          {finishSwatches.map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              aria-label={swatch.name}
              onClick={() => updateQuery("finish", selectedFinish === swatch.name ? null : swatch.name)}
              className="h-8 w-8 rounded-pill transition"
              style={{
                backgroundColor: swatch.color,
                boxShadow:
                  selectedFinish === swatch.name
                    ? "0 0 0 2px white, 0 0 0 4px #502c12"
                    : "0 0 0 2px white",
              }}
            />
          ))}
        </div>
      </FilterSection>

      <div className="flex items-center justify-between">
        <span className="font-serif text-base text-espresso">In Stock Only</span>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          onClick={() => updateQuery("inStock", inStockOnly ? null : "true")}
          className={`relative h-6 w-11 rounded-pill transition ${
            inStockOnly ? "bg-espresso" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow transition ${
              inStockOnly ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile trigger — filters no longer push the product grid down the page */}
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-pill border border-border/60 bg-white px-5 py-2.5 font-sans text-sm font-semibold text-espresso"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-espresso text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="font-sans text-sm font-medium text-bark underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col gap-8 overflow-y-auto bg-cream p-6 shadow-card animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-espresso">Filters</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X size={22} className="text-espresso" />
              </button>
            </div>
            {filterContent}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="btn-dark sticky bottom-0 mt-auto w-full py-3.5"
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar — unchanged */}
      <aside className="hidden w-full flex-col gap-8 md:flex md:w-64 md:shrink-0">{filterContent}</aside>
    </>
  );
}
