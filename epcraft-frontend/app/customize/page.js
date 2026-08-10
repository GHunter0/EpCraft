"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const finishes = [
  {
    name: "Dark Walnut",
    color: "#4a3222",
    image: "https://tqgnhkhcepvtfujvbnte.supabase.co/storage/v1/object/public/product-images/dark%20walnut.jpg",
  },
  {
    name: "Light Oak",
    color: "#d8b98a",
    image: "https://tqgnhkhcepvtfujvbnte.supabase.co/storage/v1/object/public/product-images/light%20oak.jpg",
  },
  {
    name: "Cherry",
    color: "#8b3a2b",
    image: "https://tqgnhkhcepvtfujvbnte.supabase.co/storage/v1/object/public/product-images/cherry.jpg",
  },
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fontClass = fonts.find((f) => f.name === font)?.className ?? "font-serif";
  const selectedFinishObj = finishes.find((f) => f.name === finish) || finishes[0];

  const priceMap = {
    'Standard (12"x18")': 2500,
    'Large (16"x24")': 3500,
    'Compact (8"x12")': 1800,
  };

  const totalPrice = priceMap[dimension] || 2500;

  const handleRequestQuote = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/login?returnTo=/customize`;
        return;
      }

      const { error: insertErr } = await supabase
        .from("custom_order_requests")
        .insert({
          user_id: user.id,
          finish,
          dimension,
          engraving_text: engraving,
          font,
          status: "pending_review",
        });

      if (insertErr) throw insertErr;

      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit custom quote request:", err);
      setError(err.message || "Failed to submit quote request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggest = () => {
    const random = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setEngraving(random);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
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
          <div
            className="relative flex aspect-[4/3] w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl bg-sand shadow-card p-8 text-center transition-all bg-cover bg-center"
            style={{
              backgroundImage: `url(${selectedFinishObj.image})`,
            }}
          >
            <div className="absolute inset-0 bg-black/25" />
            <span
              className={`relative z-10 select-none text-4xl md:text-6xl tracking-widest text-white drop-shadow-lg ${fontClass}`}
            >
              {engraving || "Your Custom Engraving"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex w-full flex-col gap-8 border-l border-border/40 bg-white px-8 py-8 lg:w-[512px] lg:px-10 justify-center">
          {success ? (
            <div className="flex flex-col items-center text-center gap-6 py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-700 shadow-soft">
                <Check size={40} className="stroke-[3]" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-espresso">Request Received</h2>
              <p className="font-sans text-base text-bark max-w-sm">
                Your custom quote request has been sent to our artisans for review. You can track its status and accept/decline quotes in your Account overview page.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link href="/account" className="btn-primary py-3.5 text-center text-sm font-semibold rounded-pill">
                  Track in My Account
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm font-semibold text-espresso hover:underline py-2"
                >
                  Customize Another Piece
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                  Bespoke Woodworking
                </span>
                <h1 className="font-serif text-3xl font-bold text-ink">Customization Studio</h1>
                <p className="font-sans text-sm text-bark">
                  Personalize your artisanal piece with wood species, exact dimensions, and laser engraving.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

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
                        className="h-14 w-14 rounded-pill shadow-sm transition-transform hover:scale-105 bg-cover bg-center overflow-hidden border border-white"
                        style={{
                          backgroundImage: `url(${f.image})`,
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
                    <option value='Standard (12"x18")'>{'Standard (12"x18") - 2,500 LKR'}</option>
                    <option value='Large (16"x24")'>{'Large (16"x24") - 3,500 LKR'}</option>
                    <option value='Compact (8"x12")'>{'Compact (8"x12") - 1,800 LKR'}</option>
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
            </>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {!success && (
        <div className="sticky bottom-0 z-40 flex items-center justify-between border-t border-border/60 bg-white px-8 py-4 shadow-card lg:px-16">
          <p className="font-sans text-base text-bark">
            Estimated Value: <span className="font-serif text-2xl font-bold text-espresso">{totalPrice.toLocaleString()} LKR</span>
          </p>
          <button
            onClick={handleRequestQuote}
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-pill px-8 py-4 font-sans text-base font-semibold text-white shadow-soft transition-colors ${
              loading ? "bg-sand text-bark/50 cursor-not-allowed" : "bg-espresso hover:bg-gold"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting Request...
              </>
            ) : (
              "Request Custom Quote"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
