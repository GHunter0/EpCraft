"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  Package,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getProductImageUrl } from "@/lib/products";

const STOCK_FILTERS = [
  { key: "", label: "All" },
  { key: "in_stock", label: "In Stock" },
  { key: "out_of_stock", label: "Out of Stock" },
];

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, price, in_stock, image_url, wood_type, material, created_at,
         category:categories!products_category_id_fkey ( id, name ),
         maker:makers!products_maker_id_fkey ( id, name )`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch products:", error);
    }
    setProducts(data || []);
    setLoading(false);
  }

  async function handleToggleStock(productId, currentInStock) {
    setTogglingId(productId);
    const { error } = await supabase
      .from("products")
      .update({ in_stock: !currentInStock })
      .eq("id", productId);

    if (error) {
      console.error("Toggle stock failed:", error);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_stock: !currentInStock } : p
        )
      );
    }
    setTogglingId(null);
  }

  // Client-side filtering
  const filtered = products.filter((p) => {
    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q) ||
        (p.maker?.name || "").toLowerCase().includes(q) ||
        (p.wood_type || "").toLowerCase().includes(q) ||
        (p.material || "").toLowerCase().includes(q);
      if (!matchesText) return false;
    }

    // Stock filter
    if (stockFilter === "in_stock" && !p.in_stock) return false;
    if (stockFilter === "out_of_stock" && p.in_stock) return false;

    return true;
  });

  const inStockCount = products.filter((p) => p.in_stock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-espresso">
            Products
          </h1>
          <p className="font-sans text-sm text-bark mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-green-600 font-semibold">{inStockCount} in stock</span>
            {outOfStockCount > 0 && (
              <span className="text-red-600 font-semibold ml-1">
                · {outOfStockCount} out of stock
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-espresso hover:bg-gold text-white px-6 py-3 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-bark/60"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, category, maker, wood type…"
            className="w-full rounded-xl border border-border/60 bg-white pl-11 pr-4 py-3 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {/* Stock filter pills */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-bark uppercase tracking-widest mr-1">
            <Filter size={14} />
          </span>
          {STOCK_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStockFilter(f.key)}
              className={`rounded-pill px-4 py-1.5 font-sans text-xs font-semibold border transition-colors ${
                stockFilter === f.key
                  ? "bg-espresso text-white border-espresso"
                  : "bg-white text-bark border-border/40 hover:border-espresso hover:text-espresso"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <span className="font-sans text-sm text-bark">Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="mx-auto text-bark/30 mb-4" />
            <p className="font-sans text-base text-bark italic">
              {searchQuery || stockFilter
                ? "No products match your filters."
                : "No products yet."}
            </p>
            {!searchQuery && !stockFilter && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 mt-4 text-gold hover:text-espresso font-sans text-sm font-semibold"
              >
                <Plus size={14} /> Create your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border/40 bg-cream/60">
                <tr>
                  {[
                    "",
                    "Product",
                    "Category",
                    "Maker",
                    "Price",
                    "Stock",
                    "",
                  ].map((h, i) => (
                    <th
                      key={`${h}-${i}`}
                      className="px-5 py-4 font-sans text-[11px] font-semibold uppercase tracking-widest text-bark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map((p) => {
                  const imgUrl = getProductImageUrl(p.image_url);
                  return (
                    <tr
                      key={p.id}
                      className="group hover:bg-cream/40 transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="pl-5 py-3 w-16">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-sand border border-border/20 shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-sand to-border/40" />
                          )}
                        </div>
                      </td>

                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <p className="font-sans text-sm font-semibold text-espresso">
                          {p.name}
                        </p>
                        <p className="font-sans text-[11px] text-bark">
                          {p.id}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="font-sans text-sm text-ink">
                          {p.category?.name || "—"}
                        </span>
                      </td>

                      {/* Maker */}
                      <td className="px-5 py-4">
                        <span className="font-sans text-sm text-ink">
                          {p.maker?.name || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 font-serif text-sm font-bold text-espresso">
                        {formatPrice(p.price)}
                      </td>

                      {/* Stock toggle */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStock(p.id, p.in_stock)}
                          disabled={togglingId === p.id}
                          className="inline-flex items-center gap-2 group/toggle"
                          title={
                            p.in_stock
                              ? "Click to mark out of stock"
                              : "Click to mark in stock"
                          }
                        >
                          {togglingId === p.id ? (
                            <Loader2
                              size={20}
                              className="animate-spin text-bark"
                            />
                          ) : p.in_stock ? (
                            <ToggleRight
                              size={24}
                              className="text-green-600 group-hover/toggle:text-green-700 transition-colors"
                            />
                          ) : (
                            <ToggleLeft
                              size={24}
                              className="text-red-400 group-hover/toggle:text-red-500 transition-colors"
                            />
                          )}
                          <span
                            className={`font-sans text-[11px] font-semibold ${
                              p.in_stock ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {p.in_stock ? "In Stock" : "Out"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-espresso hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Edit <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
