"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const tabs = ["Description", "Dimensions & Care", "Craftsman Story", "Reviews (24)"];

export default function ProductTabs({ product }) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="flex flex-col gap-12 border-t border-border/20 pt-12">
      <div className="flex gap-12 overflow-x-auto border-b border-border/10 pb-px">
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

      <div className="flex flex-col gap-16 md:flex-row md:justify-center">
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

        <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border/10 bg-white p-8 shadow-card">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-pill bg-sand" />
            <div>
              <h4 className="font-serif text-2xl text-[#2b2420]">Maker: {product.maker}</h4>
              <p className="font-sans text-xs font-medium text-walnut">Master Woodworker</p>
              <p className="mt-1 flex items-center gap-1 font-sans text-xs text-bark">
                <MapPin size={13} /> Workshop: Cotswolds, UK
              </p>
            </div>
          </div>
          <p className="font-sans italic leading-relaxed text-bark">
            &ldquo;I believe every piece of wood has a hidden geometry. My work is simply to
            listen to the grain and reveal it in a way that serves the home for generations.&rdquo;
          </p>
          <div className="flex gap-3">
            <button className="rounded-pill bg-cream px-4 py-2.5 font-sans text-xs font-medium text-espresso">
              Follow Artist
            </button>
            <button className="rounded-pill border border-border/40 px-4 py-2.5 font-sans text-xs font-medium text-bark">
              View Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
