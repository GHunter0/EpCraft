"use client";

import { useState, useEffect } from "react";
import {
  User,
  Search,
  Loader2,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

export default function AdminCustomersPage() {
  const supabase = createClient();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomersAndOrders();
  }, []);

  async function fetchCustomersAndOrders() {
    setLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, phone, address, created_at")
        .order("created_at", { ascending: false });

      if (profileErr) throw profileErr;

      // 2. Fetch orders to calculate counts and total spends
      const { data: orders, error: ordersErr } = await supabase
        .from("orders")
        .select("id, user_id, total, payment_status");

      if (ordersErr) throw ordersErr;

      // Map statistics per customer
      const mapped = (profiles || []).map((profile) => {
        const customerOrders = (orders || []).filter(
          (o) => o.user_id === profile.id
        );
        const paidOrders = customerOrders.filter(
          (o) => o.payment_status === "paid"
        );
        const totalSpend = paidOrders.reduce(
          (sum, o) => sum + Number(o.total || 0),
          0
        );

        return {
          ...profile,
          orderCount: customerOrders.length,
          totalSpend,
        };
      });

      setCustomers(mapped);
    } catch (err) {
      console.error("Failed to load customer profiles data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Load selected customer's full order details
  async function handleSelectCustomer(id) {
    setSelectedCustomerId(id);
    setOrdersLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, status, payment_status, total, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSelectedCustomerOrders(orders || []);
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Search filter
  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Detail / History View Mode */}
      {selectedCustomerId && selectedCustomer ? (
        <div className="flex flex-col gap-8">
          {/* Back Action */}
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-bark hover:text-espresso transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Back to Customers List
          </button>

          {/* Customer Info Card */}
          <div className="rounded-2xl bg-white shadow-card border border-border/40 p-8 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full bg-cream border border-border/40 flex items-center justify-center text-espresso shrink-0">
                <User size={28} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="font-serif text-3xl font-bold text-espresso">
                  {selectedCustomer.name}
                </h1>
                <p className="font-sans text-xs text-bark font-mono">
                  ID: {selectedCustomer.id}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-bark text-xs font-sans">
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {selectedCustomer.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Joined{" "}
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 border-l border-border/30 pl-6 shrink-0">
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-bark">
                  Total Orders
                </p>
                <p className="font-serif text-2xl font-bold text-espresso mt-0.5">
                  {selectedCustomer.orderCount}
                </p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-bark">
                  Total Spent
                </p>
                <p className="font-serif text-2xl font-bold text-green-600 mt-0.5">
                  {formatPrice(selectedCustomer.totalSpend)}
                </p>
              </div>
            </div>
          </div>

          {/* Orders History Grid */}
          <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-2">
              <ShoppingBag size={18} className="text-espresso" />
              <h2 className="font-serif text-lg font-bold text-espresso">
                Order History
              </h2>
            </div>

            {ordersLoading ? (
              <div className="py-12 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-gold" />
                <span className="font-sans text-sm text-bark">Loading orders...</span>
              </div>
            ) : selectedCustomerOrders.length === 0 ? (
              <div className="py-12 text-center font-sans text-sm text-bark italic">
                This customer has not placed any orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream/40 border-b border-border/40">
                    <tr>
                      {["Order ID", "Date", "Status", "Payment", "Total"].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="px-5 py-4 font-sans text-[10px] font-semibold uppercase tracking-widest text-bark"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {selectedCustomerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-cream/20">
                        <td className="px-5 py-4 font-sans text-xs font-mono text-ink">
                          {order.id}
                        </td>
                        <td className="px-5 py-4 font-sans text-xs text-bark">
                          {new Date(order.created_at).toLocaleDateString()}{" "}
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-pill px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "processing"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : order.status === "completed"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : order.status === "cancelled"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-pill px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider ${
                              order.payment_status === "paid"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-serif text-sm font-bold text-espresso">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="font-serif text-4xl font-bold text-espresso">Customers</h1>
            <p className="font-sans text-sm text-bark mt-1">
              {customers.length} registered user profiles.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, phone..."
              className="w-full rounded-xl border border-border/60 bg-white pl-10 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Customer Table */}
          <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-gold" />
                <span className="font-sans text-sm text-bark">Loading customers...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center font-sans text-sm text-bark italic">
                No customer profiles match your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border/40 bg-cream/60">
                    <tr>
                      {[
                        "Customer",
                        "Join Date",
                        "Order Count",
                        "Total Spend",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className="px-5 py-4 font-sans text-[11px] font-semibold uppercase tracking-widest text-bark"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filtered.map((c) => (
                      <tr key={c.id} className="group hover:bg-cream/20">
                        {/* Name & Contact */}
                        <td className="px-5 py-4">
                          <p className="font-sans text-sm font-semibold text-espresso">
                            {c.name}
                          </p>
                          <p className="font-sans text-[11px] text-bark font-mono">
                            {c.phone || "No phone"}
                          </p>
                        </td>

                        {/* Join date */}
                        <td className="px-5 py-4 font-sans text-xs text-ink">
                          {new Date(c.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Order count */}
                        <td className="px-5 py-4 font-serif text-sm text-espresso font-semibold">
                          {c.orderCount}
                        </td>

                        {/* Total spend */}
                        <td className="px-5 py-4 font-serif text-sm font-bold text-green-600">
                          {formatPrice(c.totalSpend)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleSelectCustomer(c.id)}
                            className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-espresso hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Orders History <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
