"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, stockLevels } = useShop();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = cart.length > 0 ? 120 : 0;
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - discount);
  const tax = Math.round(subtotalAfterDiscount * 0.08 * 100) / 100;
  const total = subtotalAfterDiscount + shipping + tax;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promo.trim().toUpperCase() === "EPCRAFT10") {
      setDiscount(Math.round(cartSubtotal * 0.1));
    } else if (promo.trim().toUpperCase() === "WOOD20") {
      setDiscount(Math.round(cartSubtotal * 0.2));
    } else {
      alert("Invalid code. Try 'EPCRAFT10' or 'WOOD20'");
    }
  };

  return (
    <div className="container-page flex flex-col gap-12 py-12 pb-24">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
        Your Selection
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-12 lg:col-span-8">
          {/* Cart items */}
          <div className="flex flex-col gap-8">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/60 bg-white py-20 text-center shadow-soft">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-bark">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-ink">Your cart is currently empty</h3>
                <p className="max-w-md font-sans text-base text-bark">
                  Explore our handcrafted timber catalog or design a bespoke piece in our Customization Studio.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/shop" className="btn-primary">
                    Shop Catalog
                  </Link>
                  <Link href="/customize" className="btn-outline-dark">
                    Custom Studio
                  </Link>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-6 border-b border-border/40 pb-8"
                >
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-sand p-2 text-center font-serif text-xs text-bark/60">
                    {item.name}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl text-espresso font-semibold">{item.name}</h2>
                        <p className="mt-1 font-sans text-sm text-bark">
                          {item.customOptions ? (
                            <span>
                              Custom Finish: <strong>{item.customOptions.finish}</strong> • Dimension: <strong>{item.customOptions.dimension}</strong>
                              {item.customOptions.engraving && (
                                <span className="block italic text-gold mt-0.5">
                                  Engraving: &ldquo;{item.customOptions.engraving}&rdquo;
                                </span>
                              )}
                            </span>
                          ) : (
                            <span>Wood: {item.woodType || "Solid Timber"} • Category: {item.category || "Furniture"}</span>
                          )}
                        </p>
                        {(() => {
                          const stockInfo = stockLevels[item.id];
                          const isOutOfStock = stockInfo && !stockInfo.allowBackorder && stockInfo.stock < item.quantity;
                          if (isOutOfStock) {
                            return (
                              <p className="font-sans text-xs font-semibold text-red-600 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 max-w-md">
                                Insufficient stock: only {stockInfo.stock} unit(s) available. Please reduce quantity or remove item.
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Remove item"
                        className="text-bark hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 rounded-pill border border-border/60 bg-white px-3 py-1.5 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1 hover:text-espresso"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-sans text-sm font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1 hover:text-espresso"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-serif text-2xl font-bold text-espresso">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border/40 bg-white p-8 shadow-card">
            <h3 className="border-b border-border/40 pb-4 font-serif text-2xl font-bold text-espresso">
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 font-sans text-base">
              <div className="flex justify-between text-bark">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-bark">
                <span>Estimated Shipping</span>
                <span className="font-medium text-ink">{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-bark">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-ink">{formatPrice(tax)}</span>
              </div>
            </div>

            <form onSubmit={handleApplyPromo} className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Promo Code
              </span>
              <div className="flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="e.g. EPCRAFT10"
                  className="flex-1 rounded-xl border border-border/60 bg-cream/30 px-4 py-2.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-espresso bg-espresso px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-gold"
                >
                  Apply
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between border-t border-border/40 pt-6">
              <span className="font-serif text-2xl font-bold text-ink">Total</span>
              <div className="text-right">
                <p className="font-serif text-3xl font-bold text-espresso">
                  {formatPrice(total)}
                </p>
                <p className="font-sans text-xs text-bark">Including taxes & insured delivery</p>
              </div>
            </div>

            {cart.length > 0 ? (
              (() => {
                const hasStockErrors = cart.some((item) => {
                  const stockInfo = stockLevels[item.id];
                  return stockInfo && !stockInfo.allowBackorder && stockInfo.stock < item.quantity;
                });
                if (hasStockErrors) {
                  return (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 rounded-pill bg-sand/80 border border-border/40 py-4 font-sans text-base font-semibold text-red-700/80 cursor-not-allowed"
                    >
                      Resolve Stock Errors to Checkout
                    </button>
                  );
                }
                return (
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 rounded-pill bg-espresso py-4 font-sans text-base font-semibold text-white shadow-soft transition hover:bg-gold"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                );
              })()
            ) : (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-pill bg-sand py-4 font-sans text-base font-semibold text-bark/60"
              >
                Cart is Empty
              </button>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex gap-3 rounded-xl bg-cream p-4">
                <ShieldCheck size={20} className="shrink-0 text-espresso" />
                <p className="font-sans text-xs italic text-bark">
                  Every EpCraft purchase is protected by our Lifetime Craftsmanship Guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

