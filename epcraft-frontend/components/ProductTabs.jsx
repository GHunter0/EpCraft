"use client";

import { useState } from "react";
import { MapPin, MessageSquareOff } from "lucide-react";

const tabs = ["Description", "Dimensions & Care", "Craftsman Story", "Reviews"];

function DescriptionPanel({ product }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <h3 className="font-serif text-3xl font-semibold text-espresso">
        The Art of the Heirloom
      </h3>
      <p className="max-w-xl font-sans text-base leading-relaxed text-bark">
        Inspired by the clean lines of Scandinavian modernism and the enduring strength of
        traditional craftsmanship, the {product.name} is designed to be the anchor of your
        home. Each piece is book-matched to ensure color consistency and a flowing grain
        pattern that tells a story.
      </p>
      <ul className="flex flex-col gap-4 font-sans text-base text-bark">
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Hand-rubbed oil and wax finish for a natural, breathable surface.
        </li>
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Traditional mortise and tenon joinery for superior durability.
        </li>
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Sustainably-harvested {product.woodType ?? "hardwood"}.
        </li>
      </ul>
    </div>
  );
}

function DimensionsCarePanel({ product }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <h3 className="font-serif text-3xl font-semibold text-espresso">Dimensions & Care</h3>
      <p className="max-w-xl font-sans text-base leading-relaxed text-bark">
        Exact dimensions for the {product.name} can be selected above before adding it to your
        cart. Every piece is solid {product.woodType ?? "hardwood"}, so weight and grain will
        vary slightly between units — that&apos;s part of what makes it one-of-a-kind.
      </p>
      <ul className="flex flex-col gap-4 font-sans text-base text-bark">
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Wipe clean with a dry or slightly damp soft cloth — avoid soaking the surface.
        </li>
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Re-oil every 6–12 months with food-safe mineral or beeswax oil to keep the finish breathable.
        </li>
        <li className="flex gap-3">
          <span className="pt-1 text-walnut">●</span>
          Keep out of direct, prolonged sunlight and away from heating vents to prevent warping.
        </li>
      </ul>
    </div>
  );
}

function CraftsmanStoryPanel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border/10 bg-white p-8 shadow-card">
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-pill flex items-center justify-center font-serif text-2xl font-bold text-white bg-espresso">
          Ep
        </div>
        <div>
          <h4 className="font-serif text-xl font-bold text-espresso">EpCraft Studio</h4>
          <p className="font-sans text-xs font-semibold text-gold">Master Artisan Workshop</p>
          <p className="mt-1 flex items-center gap-1 font-sans text-xs text-bark">
            <MapPin size={13} /> Workshop: Colombo, Sri Lanka
          </p>
        </div>
      </div>
      <p className="font-sans italic leading-relaxed text-bark text-sm">
        &ldquo;Every piece of timber has a unique soul. My mission is to listen to the natural grain and shape custom heirlooms built to last generations.&rdquo;
      </p>
    </div>
  );
}

function ReviewsPanel() {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 py-8 text-center">
      <MessageSquareOff size={28} className="text-bark/40" />
      <h3 className="font-serif text-2xl font-semibold text-espresso">No reviews yet</h3>
      <p className="max-w-sm font-sans text-sm text-bark">
        Be the first to share what you think once your piece arrives.
      </p>
    </div>
  );
}

export default function ProductTabs({ product }) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="flex flex-col gap-12 border-t border-border/20 pt-12">
      <div className="relative">
        <div className="flex gap-8 overflow-x-auto border-b border-border/10 pb-px sm:gap-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap pb-4 font-sans text-sm font-semibold tracking-wide ${
                active === tab
                  ? "border-b-2 border-walnut text-espresso"
                  : "text-bark/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Fade hint that the tab bar scrolls horizontally on narrow screens */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-cream to-transparent sm:hidden" />
      </div>

      <div className="flex flex-col gap-16 md:flex-row md:justify-center">
        {active === "Description" && <DescriptionPanel product={product} />}
        {active === "Dimensions & Care" && <DimensionsCarePanel product={product} />}
        {active === "Craftsman Story" && <CraftsmanStoryPanel />}
        {active === "Reviews" && <ReviewsPanel />}
      </div>
    </div>
  );
}
