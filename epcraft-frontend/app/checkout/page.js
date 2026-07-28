"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useShop();
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");

  const shipping = delivery === "express" ? 150 : (cart.length > 0 ? 0 : 0);
  const tax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const total = cartSubtotal + shipping + tax;

  function handlePlaceOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    clearCart();
    router.push("/order-confirmation");
  }

  return (
    <div className="container-page flex flex-col gap-10 py-12 pb-24">
      <div className="flex items-center justify-between">
        <Link href="/cart" className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-bark hover:text-espresso">
          <ArrowLeft size={16} /> Return to Cart
        </Link>
        <span className="font-serif text-2xl font-bold text-espresso">EpCraft Secure Checkout</span>
        <div className="w-24" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-8 border-y border-border/40 py-6">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-pill font-sans text-sm font-bold ${
                  i === 0 ? "bg-espresso text-white" : "border border-bark/40 text-ink opacity-40"
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-sans text-sm font-medium ${i === 0 ? "text-espresso" : "text-ink opacity-40"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-16 bg-gold/50" />}
          </div>
        ))}
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          {/* Shipping Address */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Full Name" placeholder="Julian Vane" className="md:col-span-2" required />
              <Field label="Address" placeholder="128 Artisan Way, Studio 4" className="md:col-span-2" required />
              <Field label="City" placeholder="High Point" required />
              <Field label="Postal / Zip Code" placeholder="27260" required />
              <Field label="Phone Number" placeholder="+1 (555) 000-0000" className="md:col-span-2" required />
            </div>
          </section>

          {/* Delivery Method */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Delivery Option</h2>
            <div className="flex flex-col gap-4">
              <DeliveryOption
                selected={delivery === "standard"}
                onSelect={() => setDelivery("standard")}
                title="Standard Insured Delivery"
                price="Free"
                detail="Arrives in 4-6 weeks • Insured white glove installation"
              />
              <DeliveryOption
                selected={delivery === "express"}
                onSelect={() => setDelivery("express")}
                title="Express Priority Crafting"
                price="Rs. 150.00"
                detail="Arrives in 2-3 weeks • Priority workshop slot"
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Payment Method</h2>
            <div className="flex gap-8 border-b border-border/40">
              {[
                { id: "card", label: "Credit / Debit Card" },
                { id: "bank", label: "Direct Bank Transfer" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPayment(tab.id)}
                  className={`pb-4 font-sans text-sm font-semibold transition-colors ${
                    payment === tab.id
                      ? "border-b-2 border-espresso text-espresso"
                      : "text-bark hover:text-espresso"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {payment === "card" && (
              <div className="flex flex-col gap-6 pt-2">
                <Field label="Card Number" placeholder="0000 0000 0000 0000" required />
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Expiry Date" placeholder="MM / YY" required />
                  <Field label="CVV" placeholder="123" required />
                </div>
              </div>
            )}
            {payment === "bank" && (
              <p className="font-sans text-sm text-bark">
                Bank transfer instructions and invoice will be sent to your email after placing the order.
              </p>
            )}
            {payment === "cod" && (
              <p className="font-sans text-sm text-bark">
                Pay with cash or card upon delivery to your home.
              </p>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border/40 bg-cream/60 p-8 shadow-soft">
            <h3 className="font-serif text-2xl font-bold text-espresso">Order Summary</h3>

            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="font-sans text-sm text-bark italic">No items selected.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-4 border-b border-border/30 pb-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-sand text-center font-serif text-[10px] text-bark">
                      {item.name}
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-sm font-bold text-espresso">{item.name}</p>
                      <p className="font-sans text-xs text-bark">Qty: {item.quantity}</p>
                      <p className="pt-0.5 font-serif text-sm font-semibold text-espresso">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="h-px w-full bg-gold/50" />

            <div className="flex flex-col gap-3 font-sans text-sm text-bark">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "font-medium text-green-700" : "font-medium text-ink"}>
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-ink">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <span className="font-serif text-2xl font-bold text-ink">Total</span>
              <span className="font-serif text-2xl font-bold text-espresso">{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0}
              className={`flex items-center justify-center gap-2 rounded-pill py-4 font-sans text-base font-semibold text-white shadow-soft transition-colors ${
                cart.length === 0 ? "bg-sand text-bark/50 cursor-not-allowed" : "bg-espresso hover:bg-gold"
              }`}
            >
              <Lock size={16} />
              Place Order & Pay
            </button>

            <p className="flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wide text-bark opacity-80">
              <ShieldCheck size={16} className="text-espresso" />
              256-bit SSL Encrypted Guarantee
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, placeholder, className = "", required }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

function DeliveryOption({ selected, onSelect, title, price, detail }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-6 rounded-xl border p-5 transition-all ${
        selected ? "border-2 border-espresso bg-white shadow-sm" : "border-border/40 bg-cream/40"
      }`}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onSelect}
        className="h-5 w-5 accent-espresso"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-bold text-espresso">{title}</span>
          <span className="font-sans text-sm font-bold text-espresso">{price}</span>
        </div>
        <p className="font-sans text-xs text-bark mt-1">{detail}</p>
      </div>
    </label>
  );
}

