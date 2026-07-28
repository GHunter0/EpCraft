"use client";

import Link from "next/link";
import { Heart, Check } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";

export default function ShopProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const [added, setAdded] = useState(false);
  const isWished = isInWishlist(product.id);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-[0px_10px_30px_0px_rgba(43,36,32,0.05)] transition-all hover:shadow-card">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-[280px] w-full overflow-hidden md:h-[320px]">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-border/60 p-4 font-serif text-sm text-bark/60 transition duration-300 group-hover:scale-105">
            {product.name}
          </div>
          <button
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-pill bg-white/80 shadow-sm backdrop-blur-sm transition hover:scale-110"
          >
            <Heart
              size={18}
              className={isWished ? "fill-red-600 text-red-600" : "text-espresso"}
            />
          </button>
          {!product.inStock && (
            <span className="absolute left-4 top-4 rounded-pill bg-ink/80 px-3 py-1 font-sans text-xs text-white">
              Out of Stock
            </span>
          )}
          <div className="absolute inset-x-[10%] bottom-0 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-[-16px] group-hover:opacity-100">
            <button
              onClick={handleCartClick}
              className={`w-full rounded-pill py-3 font-sans text-sm font-medium text-white shadow-soft transition-colors ${
                added ? "bg-green-700" : "bg-espresso hover:bg-gold"
              }`}
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 p-6 text-center">
          <h3 className="font-serif text-lg font-semibold text-espresso">{product.name}</h3>
          <p className="pb-1 font-sans text-xs text-bark">{product.woodType || product.material}</p>
          <p className="font-serif text-base font-bold text-espresso">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </div>
  );
}

