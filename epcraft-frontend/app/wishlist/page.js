"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { products, formatPrice } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="flex flex-col md:flex-row">
      <AccountSidebar active="Wishlist" />

      <div className="flex flex-1 flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-espresso">My Wishlist</h1>
            <p className="font-sans text-sm text-bark mt-1">
              {savedProducts.length} items saved in your favorites
            </p>
          </div>
          {savedProducts.length > 0 && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Wishlist link copied to clipboard!");
              }}
              className="border-b border-gold/50 font-sans text-xs font-semibold uppercase tracking-wider text-gold hover:text-espresso"
            >
              Share List
            </button>
          )}
        </div>

        {savedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/60 bg-white py-20 text-center shadow-soft">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-bark">
              <Heart size={32} />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-ink">Your wishlist is empty</h3>
            <p className="max-w-md font-sans text-sm text-bark">
              Browse our catalog and click the heart icon on any piece to save it to your wishlist.
            </p>
            <Link href="/shop" className="btn-primary">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl bg-white shadow-soft transition hover:shadow-card">
                <div className="relative flex h-64 w-full items-center justify-center bg-sand p-4 text-center font-serif text-sm text-bark/60">
                  {item.name}
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    aria-label="Remove from wishlist"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-pill bg-white/90 shadow-sm transition hover:scale-110"
                  >
                    <Heart size={18} className="fill-red-600 text-red-600" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 p-6">
                  <h3 className="font-serif text-lg font-semibold text-espresso">{item.name}</h3>
                  <p className="font-sans text-xs text-bark">{item.woodType || item.category}</p>
                  <div className="flex items-center justify-between pt-4">
                    <p className="font-serif text-lg font-bold text-espresso">
                      {formatPrice(item.price)}
                    </p>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="flex items-center gap-2 rounded-pill bg-gold px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-soft transition hover:bg-espresso"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 border-t border-border/40 pt-12">
          <p className="font-sans text-base text-bark">Looking for something more custom?</p>
          <Link href="/customize" className="btn-outline-dark">
            Launch Customization Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

