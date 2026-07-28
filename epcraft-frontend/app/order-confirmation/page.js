import Link from "next/link";
import { Check } from "lucide-react";

const orderItems = [
  { name: "Modern Heirloom Dining Table", meta: "Solid Walnut / 8-Seater", price: 3450 },
  { name: "Organic Form Bowl", meta: "Oak / Small", price: 492 },
];

export default function OrderConfirmationPage() {
  const total = orderItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="flex flex-col items-center py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-gold/10">
          <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-gold shadow-soft">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
            Thank you, Julian!
            <br />
            Your order is being
            <br />
            handcrafted.
          </h1>
          <div className="flex flex-col gap-1">
            <p className="font-sans text-sm font-semibold tracking-widest text-bark">
              ORDER #EPC-82910
            </p>
            <p className="font-sans text-lg text-bark">
              Estimated delivery: <span className="text-espresso">October 12 – 18</span>
            </p>
          </div>
        </div>

        <div className="h-px w-84 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 text-left shadow-card">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-espresso">
            Order Summary
          </h2>
          <div className="flex flex-col gap-4">
            {orderItems.map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-sand" />
                <div className="flex-1">
                  <p className="font-sans text-sm font-semibold tracking-wide text-ink">
                    {item.name}
                  </p>
                  <p className="font-sans text-xs font-medium text-bark">{item.meta}</p>
                </div>
                <p className="font-sans text-sm font-semibold tracking-wide text-espresso">
                  Rs. {item.price.toLocaleString("en-LK")}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-baseline justify-between border-t border-border/40 pt-4">
            <span className="font-sans text-sm font-semibold tracking-wide text-bark">
              Total Amount Paid
            </span>
            <span className="font-serif text-2xl font-bold text-espresso">
              Rs. {total.toLocaleString("en-LK")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/orders" className="btn-dark">
            Track Your Order
          </Link>
          <Link href="/shop" className="btn-outline-dark border-0 px-10">
            Continue Shopping
          </Link>
        </div>

        <p className="pt-4 font-sans italic text-bark">
          &ldquo;Your craftsman will begin work within 24 hours&rdquo;
        </p>
      </div>
    </div>
  );
}
