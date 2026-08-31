"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Facebook, Instagram, ArrowUp } from "lucide-react";

const exploreLinks = [
  { label: "New Arrivals", href: "/shop" },
  { label: "Best Sellers", href: "/shop" },
  { label: "The AI Design Lab", href: "/ai-stylist" },
  { label: "Wholesale", href: "/wholesale" },
];
const conciergeLinks = [
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Care Instructions", href: "/care" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  // Floating back-to-top button — visible once the user has scrolled down,
  // instead of only being reachable after scrolling all the way to the footer.
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="relative border-t border-border/40 bg-cream px-6 py-16 md:px-16">
      <div className="container-page grid grid-cols-1 gap-12 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl font-semibold text-espresso">EpCraft</p>
          <p className="mt-3 max-w-xs font-sans font-light text-base leading-relaxed text-bark">
            Crafting the future of wood with the precision of AI and the soul of the artisan.
          </p>
          <div className="mt-4 flex flex-col gap-1 font-sans text-xs text-bark/80">
            <p>📍 No. 42 Artisan Way, Kandy Road, Colombo, Sri Lanka</p>
            <p>📞 +94 (075) 234-0642 • epcraft@gmail.com</p>
          </div>
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
            {exploreLinks.map((item) => (
              <li key={item.label} className="font-sans text-base text-bark hover:text-espresso">
                <Link href={item.href}>{item.label}</Link>
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
          {/* NOTE: no submit handler yet — intentionally left as-is per product owner,
              pending a decision on which email service (Mailchimp/ConvertKit/etc.) to wire up. */}
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

      {/* Persistent floating back-to-top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-pill bg-espresso text-white shadow-card transition-transform hover:scale-110 md:h-14 md:w-14"
          aria-label="Back to top"
        >
          <ArrowUp size={20} className="md:hidden" />
          <ArrowUp size={22} className="hidden md:block" />
        </button>
      )}
    </footer>
  );
}
