"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCw } from "lucide-react";
import { getProductImageUrl } from "@/lib/products";

export default function ProductGallery({ product }) {
  const [active, setActive] = useState(0);
  const thumbs = [0, 1, 2, 3];
  const imageUrl = product ? getProductImageUrl(product.image_url || product.image) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-cream">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product?.name || "Product image"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sand to-border/60" />
        )}
        <button className="absolute bottom-6 right-6 flex items-center gap-2 rounded-pill border border-border/20 bg-white/80 px-4 py-2 font-sans text-sm font-semibold tracking-wide text-espresso shadow-sm backdrop-blur-sm">
          <RotateCw size={16} />
          360° View
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {thumbs.map((i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-sand transition relative ${
              active === i ? "ring-2 ring-walnut ring-offset-2" : "border border-border/40"
            }`}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${product?.name || "Product"} thumb ${i}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-sand/80 to-border/40" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
