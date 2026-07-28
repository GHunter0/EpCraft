"use client";

import Link from "next/link";
import { Facebook, Instagram, ArrowUp } from "lucide-react";

const exploreLinks = ["New Arrivals", "Best Sellers", "The AI Design Lab", "Wholesale"];
const conciergeLinks = [
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Care Instructions", href: "/care" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-cream px-6 py-16 md:px-16">
      <div className="container-page grid grid-cols-1 gap-12 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl font-semibold text-espresso">EpCraft</p>
          <p className="mt-4 max-w-xs font-sans font-light text-lg leading-relaxed text-bark">
            Crafting the future of wood with the precision of AI and the soul of the artisan.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-bark hover:text-espresso"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-bark hover:text-espresso"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>

        <div>
          <p className="font-serif text-xl text-espresso">Explore</p>
          <ul className="mt-6 flex flex-col gap-3">
            {exploreLinks.map((label) => (
              <li key={label} className="font-sans text-base text-bark hover:text-espresso">
                <Link href="/shop">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-serif text-xl text-espresso">Concierge</p>
          <ul className="mt-6 flex flex-col gap-3">
            {conciergeLinks.map((item) => (
              <li key={item.label} className="font-sans text-base text-bark hover:text-espresso">
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-serif text-xl text-espresso">Newsletter</p>
          <p className="mt-6 font-sans text-base text-bark">
            Join our inner circle for early access and craftsmanship stories.
          </p>
          <form className="mt-3 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
            />
            <button type="submit" className="btn-dark w-full rounded-pill py-3">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container-page mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/40 pt-6 md:flex-row">
        <p className="font-sans text-sm text-bark">
          © {new Date().getFullYear()} EpCraft Handcrafted Wood. All rights reserved.
        </p>
        <div className="flex gap-8">
          <Link href="/terms" className="font-sans text-sm text-bark hover:text-espresso">
            Terms of Use
          </Link>
          <Link href="/privacy" className="font-sans text-sm text-bark hover:text-espresso">
            Privacy Policy
          </Link>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute right-10 top-10 flex h-14 w-14 items-center justify-center rounded-pill bg-espresso text-white shadow-soft"
        aria-label="Back to top"
      >
        <ArrowUp size={22} />
      </button>
    </footer>
  );
}
