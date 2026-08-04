"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice, getProductImageUrl } from "@/lib/products";

export default function ProductCard({ product }) {
  const imageUrl = getProductImageUrl(product.image_url || product.image);

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
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Add to wishlist"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-pill bg-white/80 backdrop-blur-md transition hover:bg-white"
        >
          <Heart size={18} className="text-espresso" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="rounded-pill bg-cream px-3 py-1 font-sans text-[10px] uppercase tracking-widest text-bark">
          Handmade by {product.maker}
        </span>
        <p className="pt-2 font-serif text-base text-ink">{product.name}</p>
        <p className="font-sans text-base text-espresso">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
