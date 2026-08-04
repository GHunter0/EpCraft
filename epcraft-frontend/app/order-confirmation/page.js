"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useShop } from "@/lib/ShopContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useShop();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadOrderDetails() {
      if (!orderId) {
        setError("No order ID was found.");
        setLoading(false);
        return;
      }

      try {
        // Fetch order details
        const { data: orderData, error: orderErr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderErr || !orderData) {
          setError("Failed to locate order records. Please contact support.");
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Fetch order items details
        const { data: itemsData, error: itemsErr } = await supabase
          .from("order_items")
          .select(`
            *,
            product:products (
              name,
              image_url,
              wood_type
            )
          `)
          .eq("order_id", orderId);

        if (itemsErr) {
          console.error("Error loading order items:", itemsErr);
        } else {
          setItems(itemsData || []);
        }

        // Clear cart now that order is confirmed created in DB
        clearCart();
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred while loading order information.");
      } finally {
        setLoading(false);
      }
    }

    loadOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-cream gap-4 font-sans text-bark">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p>Confirming your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-cream gap-4 font-sans text-bark p-6 text-center">
        <p className="text-red-700 font-semibold">{error || "Order details could not be found."}</p>
        <Link href="/shop" className="btn-dark px-6 py-2.5">
          Return to Shop
        </Link>
      </div>
    );
  }

  const shippingDays = order.delivery_method === "express" ? 21 : 42;
  const deliveryDate = new Date(new Date(order.created_at).getTime() + shippingDays * 24 * 60 * 60 * 1000);
  const formattedDelivery = deliveryDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center py-24 bg-cream min-h-screen">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-gold/10">
          <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-gold shadow-soft">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
            Thank you, {order.shipping_address?.name?.split(" ")[0]}!
            <br />
            Your order is being
            <br />
            handcrafted.
          </h1>
          <div className="flex flex-col gap-1">
            <p className="font-sans text-sm font-semibold tracking-widest text-bark">
              ORDER #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="font-sans text-lg text-bark">
              Estimated delivery: <span className="text-espresso font-semibold">{formattedDelivery}</span>
            </p>
          </div>
        </div>

        <div className="h-px w-84 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 text-left shadow-card">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-espresso border-b border-border/40 pb-2">
            Order Summary
          </h2>
          <div className="flex flex-col gap-4 divide-y divide-border/20">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pt-4 first:pt-0">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-sand flex items-center justify-center font-serif text-[10px] text-bark">
                  {item.product?.name}
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm font-semibold tracking-wide text-ink">
                    {item.product?.name || "Bespoke Woodcraft"}
                  </p>
                  <p className="font-sans text-xs font-medium text-bark">
                    Qty: {item.quantity} • {item.product?.wood_type || "Solid Timber"}
                    {item.custom_options?.finish && (
                      <span className="block mt-0.5 text-gold font-semibold">
                        Finish: {item.custom_options.finish}
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-sans text-sm font-semibold tracking-wide text-espresso">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 font-sans text-sm text-bark border-t border-border/40 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping ({order.delivery_method})</span>
              <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-border/40 pt-4">
            <span className="font-sans text-sm font-semibold tracking-wide text-bark">
              Total Amount Paid
            </span>
            <span className="font-serif text-2xl font-bold text-espresso">
              {formatPrice(order.total)}
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

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] bg-cream flex items-center justify-center font-sans text-bark">
        Loading confirmation...
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
