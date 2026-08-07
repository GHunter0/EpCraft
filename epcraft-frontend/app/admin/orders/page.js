import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  processing:      "bg-blue-50 text-blue-700 border-blue-200",
  shipped:         "bg-purple-50 text-purple-700 border-purple-200",
  delivered:       "bg-green-50 text-green-700 border-green-200",
};

const PAYMENT_STYLES = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  paid:   "bg-green-50 text-green-700 border-green-200",
};

const ALL_STATUSES = ["pending_payment", "processing", "shipped", "delivered"];

export default async function AdminOrdersPage({ searchParams }) {
  const supabase = createClient();
  const filterStatus = searchParams?.status || "";

  let query = supabase
    .from("orders")
    .select(
      `id, status, payment_status, total, created_at, updated_at, shipping_address,
       profile:profiles!orders_user_id_fkey ( name )`
    )
    .order("created_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data: orders, error } = await query;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 font-sans text-sm">
        <h2 className="font-serif text-lg font-bold mb-1">Failed to load orders</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const allOrders = orders || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-espresso">Orders</h1>
          <p className="font-sans text-sm text-bark mt-1">
            {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}{" "}
            {filterStatus ? `with status '${filterStatus}'` : "total"}
          </p>
        </div>
      </div>

      {/* Status filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-bark uppercase tracking-widest mr-2">
          <Filter size={14} /> Filter:
        </span>
        <Link
          href="/admin/orders"
          className={`rounded-pill px-4 py-1.5 font-sans text-xs font-semibold border transition-colors ${
            !filterStatus
              ? "bg-espresso text-white border-espresso"
              : "bg-white text-bark border-border/40 hover:border-espresso hover:text-espresso"
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-pill px-4 py-1.5 font-sans text-xs font-semibold border transition-colors ${
              filterStatus === s
                ? "bg-espresso text-white border-espresso"
                : "bg-white text-bark border-border/40 hover:border-espresso hover:text-espresso"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        {allOrders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-sans text-base text-bark italic">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border/40 bg-cream/60">
                <tr>
                  {["Order ID", "Customer", "Total", "Payment", "Status", "Placed", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-sans text-[11px] font-semibold uppercase tracking-widest text-bark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {allOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-cream/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-sans text-sm font-semibold text-espresso">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-ink">
                      {order.profile?.name ||
                        order.shipping_address?.name ||
                        "—"}
                    </td>
                    <td className="px-6 py-4 font-serif text-sm font-bold text-espresso">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded border px-2.5 py-0.5 font-sans text-[11px] font-semibold ${
                          PAYMENT_STYLES[order.payment_status] ?? "bg-sand text-bark border-border/40"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded border px-2.5 py-0.5 font-sans text-[11px] font-semibold ${
                          STATUS_STYLES[order.status] ?? "bg-sand text-bark border-border/40"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-sans text-xs text-bark">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-espresso hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
