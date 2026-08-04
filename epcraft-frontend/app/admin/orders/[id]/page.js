import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Package, MapPin, CreditCard, Clock, User } from "lucide-react";
import { formatPrice } from "@/lib/products";
import OrderStatusControl from "@/app/admin/orders/OrderStatusControl";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  processing:      "bg-blue-50 text-blue-700 border-blue-200",
  shipped:         "bg-purple-50 text-purple-700 border-purple-200",
  delivered:       "bg-green-50 text-green-700 border-green-200",
};

const PAYMENT_STYLES = {
  unpaid:  "bg-red-50 text-red-700 border-red-200",
  paid:    "bg-green-50 text-green-700 border-green-200",
};

// Status pipeline for visual stepper
const PIPELINE = ["pending_payment", "processing", "shipped", "delivered"];

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-card border border-border/40 flex flex-col gap-5">
      <h3 className="font-serif text-lg font-bold text-espresso flex items-center gap-2 border-b border-border/30 pb-4">
        <Icon size={18} className="text-gold" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }) {
  const supabase = createClient();
  const { id } = params;

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, status, payment_status, delivery_method,
      subtotal, tax, shipping, total,
      shipping_address, created_at, updated_at,
      profile:profiles!orders_user_id_fkey ( name, email ),
      updated_by_profile:profiles!orders_updated_by_fkey ( name ),
      order_items (
        id, quantity, price_at_purchase, custom_options,
        product:products ( id, name )
      )
      `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  const currentStepIndex = PIPELINE.indexOf(order.status);

  const shippingAddr = order.shipping_address || {};

  return (
    <div className="flex flex-col gap-8">
      {/* Back + Title */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-bark hover:text-espresso transition-colors mb-4"
        >
          <ChevronLeft size={14} /> All Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-espresso">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="font-sans text-sm text-bark mt-1">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {/* Payment badge — read-only, no action offered */}
          <div className="flex items-center gap-3">
            <span
              className={`rounded border px-3 py-1 font-sans text-xs font-semibold ${
                PAYMENT_STYLES[order.payment_status] ?? "bg-sand text-bark border-border"
              }`}
            >
              Payment: {order.payment_status}
            </span>
            <span
              className={`rounded border px-3 py-1 font-sans text-xs font-semibold ${
                STATUS_STYLES[order.status] ?? "bg-sand text-bark border-border"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Status pipeline / stepper */}
      <div className="rounded-2xl bg-white p-7 shadow-card border border-border/40">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-bark mb-6">
          Order Pipeline
        </p>
        <div className="flex items-center gap-0">
          {PIPELINE.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-sans text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-espresso border-espresso text-white scale-110 shadow-md"
                        : isDone
                        ? "bg-gold border-gold text-white"
                        : "bg-white border-border/40 text-bark/40"
                    }`}
                  >
                    {isDone && !isCurrent ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`font-sans text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap ${
                      isDone ? "text-espresso" : "text-bark/40"
                    }`}
                  >
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
                {idx < PIPELINE.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-6 transition-colors ${
                      idx < currentStepIndex ? "bg-gold" : "bg-border/30"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Items + Status control */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order items */}
          <SectionCard title="Order Items" icon={Package}>
            <div className="divide-y divide-border/20">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-sans text-sm font-semibold text-espresso">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    {item.custom_options && (
                      <p className="font-sans text-[11px] text-bark">
                        {Object.entries(item.custom_options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="font-sans text-xs text-bark/70">
                      Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}
                    </p>
                  </div>
                  <p className="font-serif text-sm font-bold text-espresso whitespace-nowrap">
                    {formatPrice(item.quantity * item.price_at_purchase)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border/30 pt-4 flex flex-col gap-1.5">
              <div className="flex justify-between font-sans text-sm text-bark">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm text-bark">
                <span>Tax (8%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm text-bark">
                <span>Shipping ({order.delivery_method ?? "standard"})</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-serif text-base font-bold text-espresso border-t border-border/30 pt-2 mt-1">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Status update control */}
          <SectionCard title="Update Order Status" icon={Clock}>
            <div>
              <p className="font-sans text-sm text-bark">
                Current status:{" "}
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${
                    STATUS_STYLES[order.status] ?? "bg-sand text-bark border-border"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </p>

              {/* Payment lock notice */}
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
                <p className="font-sans text-xs text-amber-700 font-semibold">
                  🔒 Payment status is controlled exclusively by the PayHere webhook — it cannot be edited here.
                </p>
              </div>

              {/* Only allow admin status progression after payment confirmed */}
              {order.payment_status !== "paid" && order.status === "pending_payment" ? (
                <p className="font-sans text-xs text-bark italic mt-3">
                  Awaiting payment confirmation before order can be processed.
                </p>
              ) : (
                <OrderStatusControl orderId={order.id} currentStatus={order.status} />
              )}
            </div>

            {/* Audit trail */}
            {order.updated_at && order.updated_by_profile && (
              <div className="rounded-lg bg-sand/60 border border-border/30 px-4 py-3 mt-2">
                <p className="font-sans text-[11px] text-bark">
                  Last updated{" "}
                  {new Date(order.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  by <strong className="text-espresso">{order.updated_by_profile.name}</strong>
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right col — Customer + Shipping + Payment */}
        <div className="flex flex-col gap-6">
          {/* Customer info */}
          <SectionCard title="Customer" icon={User}>
            <div className="flex flex-col gap-1">
              <p className="font-sans text-sm font-semibold text-espresso">
                {order.profile?.name || shippingAddr.name || "—"}
              </p>
              {order.profile?.email && (
                <p className="font-sans text-xs text-bark">{order.profile.email}</p>
              )}
            </div>
          </SectionCard>

          {/* Shipping address */}
          <SectionCard title="Shipping Address" icon={MapPin}>
            {Object.keys(shippingAddr).length === 0 ? (
              <p className="font-sans text-sm text-bark italic">No address provided.</p>
            ) : (
              <address className="font-sans not-italic text-sm text-ink leading-relaxed">
                <p className="font-semibold text-espresso">{shippingAddr.name}</p>
                {shippingAddr.address && <p>{shippingAddr.address}</p>}
                {shippingAddr.city && (
                  <p>
                    {shippingAddr.city}
                    {shippingAddr.province ? `, ${shippingAddr.province}` : ""}
                  </p>
                )}
                {shippingAddr.postal_code && <p>{shippingAddr.postal_code}</p>}
                {shippingAddr.country && <p>{shippingAddr.country}</p>}
                {shippingAddr.phone && (
                  <p className="mt-2 text-bark">📞 {shippingAddr.phone}</p>
                )}
              </address>
            )}
          </SectionCard>

          {/* Payment details */}
          <SectionCard title="Payment" icon={CreditCard}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-sans text-sm">
                <span className="text-bark">Status</span>
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                    PAYMENT_STYLES[order.payment_status] ?? "bg-sand text-bark border-border"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-bark">Gateway</span>
                <span className="font-semibold text-espresso">PayHere</span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-bark">Currency</span>
                <span className="font-semibold text-espresso">LKR</span>
              </div>
              <div className="mt-1 rounded-lg bg-sand/60 border border-border/30 px-3 py-2">
                <p className="font-sans text-[11px] text-bark">
                  Payment status is immutable from this panel. It is only updated by the verified PayHere server-to-server callback.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
