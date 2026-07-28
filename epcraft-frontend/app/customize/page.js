"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, ShoppingBag, Check } from "lucide-react";
import { useShop } from "@/lib/ShopContext";

const finishes = [
  { name: "Dark Walnut", color: "#4a3222" },
  { name: "Light Oak", color: "#d8b98a" },
  { name: "Cherry", color: "#8b3a2b" },
];

const fonts = [
  { name: "CLASSIC SERIF", className: "font-serif" },
  { name: "MODERN SANS", className: "font-sans font-bold" },
  { name: "HANDWRITTEN", className: "italic" },
];

const aiSuggestions = [
  "Gather Together",
  "Blessed Home",
  "Est. 2026",
  "Crafted With Love",
  "The Artisan's Table",
];

export default function CustomizationStudioPage() {
  const [finish, setFinish] = useState(finishes[0].name);
  const [dimension, setDimension] = useState('Standard (12"x18")');
  const [engraving, setEngraving] = useState("EpCraft Signature");
  const [font, setFont] = useState(fonts[0].name);
  const [added, setAdded] = useState(false);

  const { addToCart } = useShop();

  const fontClass = fonts.find((f) => f.name === font)?.className ?? "font-serif";

  const priceMap = {
    'Standard (12"x18")': 145,
    'Large (16"x24")': 195,
    'Compact (8"x12")': 115,
  };

  const totalPrice = priceMap[dimension] || 145;

  const handleAddToCart = () => {
    const customItem = {
      id: "custom-wood-board",
      name: `Custom ${finish} Board`,
      price: totalPrice,
      category: "Custom Craft",
      woodType: finish,
      image: "",
    };

    addToCart(customItem, 1, {
      finish,
      dimension,
      engraving,
      font,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleAiSuggest = () => {
    const random = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setEngraving(random);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Live Preview */}
        <div className="relative flex flex-1 items-center justify-center bg-cream p-6 lg:p-12 min-h-[400px]">
          <Link
            href="/shop"
            className="absolute left-6 top-6 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-bark hover:text-espresso lg:left-12 lg:top-12"
          >
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>
          <div className="relative flex aspect-[4/3] w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl bg-sand shadow-card p-8 text-center transition-all">
            <span
              className={`select-none text-4xl md:text-6xl tracking-widest text-espresso opacity-75 mix-blend-multiply ${fontClass}`}
            >
              {engraving || "Your Custom Engraving"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex w-full flex-col gap-8 border-l border-border/40 bg-white px-8 py-8 lg:w-[512px] lg:px-10">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Bespoke Woodworking
            </span>
            <h1 className="font-serif text-3xl font-bold text-ink">Customization Studio</h1>
            <p className="font-sans text-sm text-bark">
              Personalize your artisanal piece with wood species, exact dimensions, and laser engraving.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-espresso">
              1. Select Wood Finish
            </h3>
            <div className="flex gap-4">
              {finishes.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFinish(f.name)}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className="h-14 w-14 rounded-pill shadow-sm transition-transform hover:scale-105"
                    style={{
                      backgroundColor: f.color,
                      boxShadow: finish === f.name ? "0 0 0 2px white, 0 0 0 4px #502c12" : "none",
                    }}
                  />
                  <span
                    className={`font-sans text-xs font-medium ${
                      finish === f.name ? "text-espresso" : "text-bark"
                    }`}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-sans text-xs font-semibold uppercase tracking-widest text-espresso">
              2. Board Dimensions
            </label>
            <div className="relative">
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/60 bg-cream/30 px-5 py-3.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option>{'Standard (12"x18") - $145'}</option>
                <option>{'Large (16"x24") - $195'}</option>
                <option>{'Compact (8"x12") - $115'}</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-bark" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <label className="font-sans text-xs font-semibold uppercase tracking-widest text-espresso">
                3. Custom Engraving
              </label>
              <span className="font-sans text-xs text-bark">Max 24 chars</span>
            </div>
            <div className="flex gap-2">
              <input
                value={engraving}
                maxLength={24}
                onChange={(e) => setEngraving(e.target.value)}
                className="flex-1 rounded-xl border border-border/60 bg-cream/30 px-5 py-3.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                onClick={handleAiSuggest}
                className="flex items-center gap-1.5 rounded-xl bg-gold/15 px-4 py-3.5 font-sans text-xs font-semibold text-espresso hover:bg-gold hover:text-white transition-colors"
              >
                <Sparkles size={16} />
                AI Suggest
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-espresso">
              4. Typography Style
            </h3>
            <div className="flex gap-3">
              {fonts.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFont(f.name)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 transition-colors ${
                    font === f.name
                      ? "border-espresso bg-espresso/5 font-bold"
                      : "border-border/60 bg-white"
                  }`}
                >
                  <span className={`text-xl text-ink ${f.className}`}>Aa</span>
                  <span className="font-sans text-[10px] uppercase text-bark">{f.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-40 flex items-center justify-between border-t border-border/60 bg-white px-8 py-4 shadow-card lg:px-16">
        <p className="font-sans text-base text-bark">
          Customization Total: <span className="font-serif text-2xl font-bold text-espresso">${totalPrice}.00</span>
        </p>
        <button
          onClick={handleAddToCart}
          className={`flex items-center gap-3 rounded-pill px-8 py-4 font-sans text-base font-medium text-white shadow-soft transition-colors ${
            added ? "bg-green-700" : "bg-gold hover:bg-espresso"
          }`}
        >
          {added ? (
            <>
              <Check size={20} /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag size={20} /> Add Customized Item to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

