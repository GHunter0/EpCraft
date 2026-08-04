import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Sliders,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import AdminOrderChart from "@/components/AdminOrderChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // -- Build date boundaries for "today" and "last 7 days" queries --
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const todayIso = todayStart.toISOString();
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  // -- Parallel Supabase queries --
  const [
    paidOrdersRes,
    todayOrdersRes,
    pendingOrdersRes,
    customReqsRes,
    outOfStockRes,
    recentOrdersRes,
  ] = await Promise.all([
    // 1. Total revenue: sum of paid orders
    supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid"),

    // 2. Orders placed today
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso),

    // 3. Pending orders (created but not yet processing/completed)
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_payment"),

    // 4. Pending custom order requests awaiting admin review
    supabase
      .from("custom_order_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),

    // 5. Out-of-stock or low-stock products (in_stock = false)
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("in_stock", false),

    // 6. Last 7 days orders for chart (fetch created_at to bucket by day)
    supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", sevenDaysAgoIso)
      .order("created_at", { ascending: true }),
  ]);

  // -- Derived KPIs --
  const totalRevenue = (paidOrdersRes.data || []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  );
  const ordersToday = todayOrdersRes.count ?? 0;
  const pendingOrdersCount = pendingOrdersRes.count ?? 0;
  const pendingCustomCount = customReqsRes.count ?? 0;
  const outOfStockCount = outOfStockRes.count ?? 0;

  // -- Build 7-day chart buckets --
  const dayLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dayLabels.push(
      d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
    );
  }

  // Map orders into day buckets
  const buckets = {};
  dayLabels.forEach((label) => {
    buckets[label] = 0;
  });

  (recentOrdersRes.data || []).forEach((order) => {
    const d = new Date(order.created_at);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
    if (label in buckets) {
      buckets[label]++;
    }
  });

  const chartData = dayLabels.map((day) => ({
    day: day.split(",")[0], // just "Mon", "Tue", etc.
    orders: buckets[day],
  }));

  // -- KPI cards config --
  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      subtext: "Paid orders only",
      icon: TrendingUp,
      accent: "border-l-green-500",
      iconClass: "text-green-600 bg-green-50",
      urgent: false,
    },
    {
      label: "Orders Today",
      value: ordersToday,
      subtext: `since midnight`,
      icon: ShoppingBag,
      accent: "border-l-blue-400",
      iconClass: "text-blue-600 bg-blue-50",
      urgent: false,
    },
    {
      label: "Pending Orders",
      value: pendingOrdersCount,
      subtext: "Awaiting payment / dispatch",
      icon: Clock,
      accent: pendingOrdersCount > 0 ? "border-l-amber-400" : "border-l-border",
      iconClass: "text-amber-600 bg-amber-50",
      urgent: pendingOrdersCount > 0,
    },
    {
      label: "Custom Quotes",
      value: pendingCustomCount,
      subtext: "Pending admin review",
      icon: Sliders,
      accent: pendingCustomCount > 0 ? "border-l-gold" : "border-l-border",
      iconClass: "text-espresso bg-gold/15",
      urgent: pendingCustomCount > 0,
    },
    {
      label: "Out of Stock",
      value: outOfStockCount,
      subtext: "Products unavailable",
      icon: AlertTriangle,
      accent: outOfStockCount > 0 ? "border-l-red-500" : "border-l-border",
      iconClass: outOfStockCount > 0 ? "text-red-600 bg-red-50" : "text-bark bg-sand",
      urgent: outOfStockCount > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-espresso">Dashboard</h1>
          <p className="font-sans text-sm text-bark mt-1">
            Live business overview —{" "}
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-sans text-xs text-bark font-semibold">
            Live Data
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card border border-border/30 border-l-4 ${kpi.accent} transition-shadow hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.iconClass}`}
                >
                  <Icon size={20} />
                </div>
                {kpi.urgent && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                  {kpi.label}
                </p>
                <p className="font-serif text-3xl font-bold text-espresso mt-1 leading-none">
                  {kpi.value}
                </p>
                <p className="font-sans text-[11px] text-bark/70 mt-1.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart row */}
      <AdminOrderChart data={chartData} />

      {/* Attention-required actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Custom Quote Requests */}
        <div className="rounded-2xl bg-white p-8 shadow-card border border-border/40 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h3 className="font-serif text-xl font-bold text-espresso flex items-center gap-2">
              <Sliders size={20} className="text-gold" /> Custom Quotes
            </h3>
            {pendingCustomCount > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-0.5 font-sans text-xs font-bold text-red-700 animate-pulse">
                {pendingCustomCount} pending
              </span>
            )}
          </div>

          {pendingCustomCount === 0 ? (
            <p className="font-sans text-sm text-bark py-4 text-center italic opacity-70">
              All workshop quotes are up to date. ✓
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-bark">
                <strong>{pendingCustomCount}</strong> custom request
                {pendingCustomCount !== 1 ? "s" : ""} need pricing quotes and lead times assigned.
              </p>
              <Link
                href="/admin/custom-orders"
                className="self-start flex items-center gap-2 bg-espresso hover:bg-gold text-white text-xs font-semibold px-6 py-3 rounded-pill transition-colors"
              >
                Review & Price Quotes <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Pending / Unpaid Orders */}
        <div className="rounded-2xl bg-white p-8 shadow-card border border-border/40 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h3 className="font-serif text-xl font-bold text-espresso flex items-center gap-2">
              <ShoppingBag size={20} className="text-espresso/60" /> Order Queue
            </h3>
            {pendingOrdersCount > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 font-sans text-xs font-bold text-amber-700">
                {pendingOrdersCount} awaiting
              </span>
            )}
          </div>

          {pendingOrdersCount === 0 ? (
            <p className="font-sans text-sm text-bark py-4 text-center italic opacity-70">
              Order queue is clear. No pending dispatches. ✓
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-bark">
                <strong>{pendingOrdersCount}</strong> order
                {pendingOrdersCount !== 1 ? "s" : ""} in <em>pending_payment</em> status — confirm payment before dispatch.
              </p>
              <Link
                href="/admin/orders"
                className="self-start flex items-center gap-2 border border-espresso text-espresso hover:bg-espresso hover:text-white text-xs font-semibold px-6 py-3 rounded-pill transition-colors"
              >
                View Orders <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Out-of-stock alert */}
        {outOfStockCount > 0 && (
          <div className="rounded-2xl bg-white p-8 shadow-card border border-red-200 flex flex-col gap-5 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-red-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle size={20} /> Stock Alert
              </h3>
              <span className="rounded-full bg-red-100 px-3 py-0.5 font-sans text-xs font-bold text-red-700">
                {outOfStockCount} {outOfStockCount === 1 ? "product" : "products"} out of stock
              </span>
            </div>
            <p className="font-sans text-sm text-bark">
              There {outOfStockCount === 1 ? "is" : "are"} <strong className="text-red-700">{outOfStockCount}</strong> product
              {outOfStockCount !== 1 ? "s" : ""} currently marked as out of stock. Update their availability in the product catalog to resume sales.
            </p>
            <Link
              href="/admin/products"
              className="self-start flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-6 py-3 rounded-pill transition-colors"
            >
              Manage Catalog <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
