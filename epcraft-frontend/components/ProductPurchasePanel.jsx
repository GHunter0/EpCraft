"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Sparkles, MessageCircleQuestion, Truck, ShieldCheck, Check } from "lucide-react";
import { useShop } from "@/lib/ShopContext";
import { formatPrice } from "@/lib/products";

const finishes = [
  { name: "Walnut", color: "#8b5a2b" },
  { name: "Honey Oak", color: "#c9a063" },
  { name: "Espresso", color: "#3e2723" },
];

export default function ProductPurchasePanel({ product }) {
  const [qty, setQty] = useState(1);
  const [finish, setFinish] = useState(finishes[0].name);
  const [size, setSize] = useState('Standard (72" L x 36" W x 30" H)');
  const [added, setAdded] = useState(false);

  const { addToCart } = useShop();

  const handleAddToCart = () => {
    addToCart(product, qty, {
      finish,
      dimension: size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-pill bg-[#c2e9c6] px-3 py-1 font-sans text-xs font-semibold text-[#486a4e]">
          {product.material || product.woodType || "Solid Timber"}
        </span>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
          {product.name}
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-serif text-3xl font-bold text-espresso">
            {formatPrice(product.price)}
          </span>
          <span className="font-sans text-xs text-bark font-medium">★★★★★ 4.8 (24 reviews)</span>
        </div>
      </div>

      <p className="max-w-md font-sans text-base leading-relaxed text-bark">
        {product.description} Each piece celebrates the natural variations and rich textures of
        premium solid wood.
      </p>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-ink">
            Wood Finish: <strong className="text-espresso">{finish}</strong>
          </span>
          <div className="flex gap-3">
            {finishes.map((f) => (
              <button
                key={f.name}
                onClick={() => setFinish(f.name)}
                aria-label={f.name}
                className="h-10 w-10 rounded-pill border border-border transition hover:scale-105"
                style={{
                  backgroundColor: f.color,
                  boxShadow: finish === f.name ? "0 0 0 2px white, 0 0 0 4px #805437" : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-ink">Dimensions</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="input-field !rounded-xl"
          >
            <option>Standard (72&quot; L x 36&quot; W x 30&quot; H)</option>
            <option>Compact (60&quot; L x 32&quot; W x 30&quot; H)</option>
            <option>Extended (84&quot; L x 38&quot; W x 30&quot; H)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 rounded-pill border border-border/60 bg-white px-5 py-3 shadow-xs">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              <Minus size={16} className="text-ink" />
            </button>
            <span className="font-sans text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              <Plus size={16} className="text-ink" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex-1 rounded-pill py-4 font-sans text-base font-semibold tracking-wide text-white shadow-soft transition-colors ${
              added ? "bg-green-700" : "bg-espresso hover:bg-gold"
            }`}
          >
            {added ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={18} /> Added to Cart!
              </span>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>

        <Link
          href="/customize"
          className="flex items-center justify-center gap-2 rounded-pill bg-gold/15 py-3.5 font-sans text-sm font-semibold tracking-wide text-espresso hover:bg-gold hover:text-white transition-colors"
        >
          <Sparkles size={16} />
          Customize This Piece in Studio
        </Link>

        <Link href="/ai-stylist" className="mx-auto flex items-center gap-1.5 font-sans text-xs text-bark hover:text-espresso">
          <MessageCircleQuestion size={14} />
          Ask AI Stylist about spatial matching
        </Link>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/40 pt-8 font-sans text-xs text-bark">
        <div className="flex items-center gap-3">
          <Truck size={20} className="text-espresso" />
          Free insured white-glove delivery in 4–6 weeks
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-espresso" />
          Lifetime warranty on structural timber integrity
        </div>
      </div>
    </div>
  );
}

