import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Shipping & Returns | EpCraft",
};

export default function ShippingPage() {
  return (
    <div className="container-page flex flex-col gap-12 py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
          Shipping & Returns
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-bark">
          Every EpCraft piece is made to order, so we build extra care into how it
          travels to you and what happens if something isn&apos;t right.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-8 shadow-soft">
          <Truck size={24} className="text-espresso" />
          <h2 className="font-serif text-xl font-semibold text-espresso">Delivery Times</h2>
          <p className="font-sans text-sm leading-relaxed text-bark">
            Most standard pieces ship within 6–8 weeks of order confirmation, since
            each one is crafted after you order. Custom Studio pieces may take
            longer — your artisan will confirm a timeline within 48 hours of your
            request. White-glove delivery is available in select regions across
            Sri Lanka.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-8 shadow-soft">
          <RotateCcw size={24} className="text-espresso" />
          <h2 className="font-serif text-xl font-semibold text-espresso">Returns & Exchanges</h2>
          <p className="font-sans text-sm leading-relaxed text-bark">
            Standard, non-customized pieces can be returned within 30 days of
            delivery for a full refund, provided the item is unused and in its
            original condition. Custom or engraved pieces are final sale unless
            the item arrives defective or damaged in transit.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-8 shadow-soft">
          <ShieldCheck size={24} className="text-espresso" />
          <h2 className="font-serif text-xl font-semibold text-espresso">Damaged on Arrival</h2>
          <p className="font-sans text-sm leading-relaxed text-bark">
            Every purchase is protected by our Lifetime Craftsmanship Guarantee.
            If a piece arrives damaged, contact us within 7 days with photos of
            the item and packaging and we&apos;ll arrange a replacement or repair at
            no cost to you.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-cream/60 p-8 text-center">
        <p className="font-sans text-base text-bark">
          Questions about an existing order?
        </p>
        <Link href="/contact" className="btn-primary mt-4 inline-flex">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
