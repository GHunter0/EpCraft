"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice, getProductImageUrl } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";

export default function ProductCard({ product }) {
  const imageUrl = getProductImageUrl(product.image_url || product.image);
  const { toggleWishlist, isInWishlist } = useShop();
  const saved = isInWishlist(product.id);

  const isOutOfStock = (product.stock !== undefined && Number(product.stock) <= 0 && !product.allowBackorder) || (product.inStock === false) || (product.in_stock === false);

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col gap-6">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-sand">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sand to-border/60 transition group-hover:scale-105" />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-white bg-red-600/90 px-4 py-1.5 rounded-pill">
              Out of Stock
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-pill bg-white/80 backdrop-blur-md transition hover:bg-white"
        >
          <Heart size={18} className={saved ? "fill-red-600 text-red-600" : "text-espresso"} />
        </button>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="rounded-pill bg-cream px-3 py-1 font-sans text-[10px] uppercase tracking-widest text-bark">
          Handcrafted by EpCraft
        </span>
        <p className="pt-2 font-serif text-base text-ink">{product.name}</p>
        <p className="font-sans text-base text-espresso">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
