"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import { getProductImageUrl } from "@/lib/products";

export default function ProductGallery({ product }) {
  const [zoomed, setZoomed] = useState(false);
  const imageUrl = product ? getProductImageUrl(product.image_url || product.image) : null;

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => imageUrl && setZoomed(true)}
        aria-label="Tap to zoom product image"
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-cream"
      >
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
        {imageUrl && (
          <span className="absolute bottom-6 right-6 flex items-center gap-2 rounded-pill border border-border/20 bg-white/80 px-4 py-2 font-sans text-sm font-semibold tracking-wide text-espresso shadow-sm backdrop-blur-sm transition group-hover:bg-white">
            <ZoomIn size={16} />
            Tap to Zoom
          </span>
        )}
      </button>

      {/* Full-screen zoom overlay */}
      {zoomed && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            aria-label="Close zoomed image"
            className="absolute right-5 top-5 text-white"
            onClick={() => setZoomed(false)}
          >
            <X size={28} />
          </button>
          <div className="relative h-full max-h-[90vh] w-full max-w-3xl">
            <Image
              src={imageUrl}
              alt={product?.name || "Product image"}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
