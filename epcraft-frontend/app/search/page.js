"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, PackageOpen, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSearchInput(query);
    });
    if (!query.trim()) {
      Promise.resolve().then(() => {
        setResults([]);
      });
      return;
    }

    async function executeSearch() {
      setLoading(true);
      const cleanQ = `%${query.trim()}%`;
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, price, in_stock, image_url, wood_type, material
        `)
        .or(`name.ilike.${cleanQ},description.ilike.${cleanQ},material.ilike.${cleanQ},wood_type.ilike.${cleanQ}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Search query execution failed:", error);
      }

      const mapped = (data || []).map((p) => ({
        ...p,
        maker: "EpCraft Master Artisan",
      }));

      setResults(mapped);
      setLoading(false);
    }

    executeSearch();
  }, [query]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  return (
    <div className="container-page flex flex-col gap-10 py-12 pb-24 min-h-screen bg-cream">
      {/* Search Header Form */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-espresso">Search Results</h1>
        <p className="font-sans text-sm text-bark">
          {query.trim()
            ? `Showing results for "${query}"`
            : "Enter a keyword to search our workshop collection"}
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 mt-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-bark/60"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search wood products, materials, custom designs…"
              className="w-full rounded-xl border border-border/60 bg-white pl-12 pr-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <button
            type="submit"
            className="bg-espresso hover:bg-gold text-white font-sans text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-soft"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results grid */}
      <div>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <span className="font-sans text-sm text-bark">Searching our workshops…</span>
          </div>
        ) : !query.trim() ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <Search size={48} className="mx-auto text-bark/20 mb-4" />
            <h3 className="font-serif text-lg font-bold text-espresso">Start Searching</h3>
            <p className="font-sans text-sm text-bark mt-1">
              Type product keywords, timber species (like Oak or Teak), or styles above to look up items.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <PackageOpen size={48} className="mx-auto text-bark/20 mb-4" />
            <h3 className="font-serif text-lg font-bold text-espresso">No Results Found</h3>
            <p className="font-sans text-sm text-bark mt-1">
              We couldn&apos;t find matches for &quot;{query}&quot;. Try checking spelling, using more generic terms, or contact us for custom order commissions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="font-sans text-xs font-semibold text-bark uppercase tracking-widest">
              Found {results.length} item{results.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans text-bark">
        Loading Search Suite...
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
