import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-16 py-24 text-center">
      <div className="relative">
        <div className="h-80 w-80 rounded-2xl bg-sand shadow-card overflow-hidden relative border border-border/30">
          <img
            src="https://tqgnhkhcepvtfujvbnte.supabase.co/storage/v1/object/public/product-images/404.jpg"
            alt="404 - Page Not Found"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 border-l-2 border-t-2 border-gold/40" />
        <div className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 border-b-2 border-r-2 border-gold/40" />
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
          This page has wandered off the workbench.
        </h1>
        <p className="font-sans text-base text-bark opacity-80">
          Don&apos;t worry, we&apos;ll help you find your way back to the craft. Whether
          you&apos;re looking for our latest collection or an artisan story, we&apos;ve got you
          covered.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link href="/" className="btn-dark">
          Back to Homepage
        </Link>
        <Link href="/shop" className="btn-outline-dark">
          Browse Shop
        </Link>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="flex items-center gap-4 rounded-pill border border-border/40 bg-cream px-6 py-3 shadow-sm">
          <Search size={18} className="text-bark" />
          <input
            placeholder="Search for products or artisans..."
            className="w-full bg-transparent font-sans text-sm font-semibold tracking-wide text-bark placeholder:text-bark/50 focus:outline-none"
          />
        </div>
        <p className="font-sans text-sm uppercase tracking-widest text-border">
          Try searching for &ldquo;Walnut Bowl&rdquo; or &ldquo;Live Edge&rdquo;
        </p>
      </div>
    </div>
  );
}
