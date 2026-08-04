"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/40 bg-white px-4 py-3 shadow-card">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-bark mb-1">
          {label}
        </p>
        <p className="font-serif text-lg font-bold text-espresso">
          {payload[0].value} {payload[0].value === 1 ? "order" : "orders"}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminOrderChart({ data }) {
  const isEmpty = !data || data.every((d) => d.orders === 0);

  return (
    <div className="rounded-2xl bg-white p-8 shadow-card border border-border/40">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-espresso">
            Order Volume — Last 7 Days
          </h3>
          <p className="font-sans text-xs text-bark mt-1">
            Daily count of new orders placed on the platform
          </p>
        </div>
        {isEmpty && (
          <span className="rounded bg-sand px-3 py-1 font-sans text-xs text-bark">
            No orders yet
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2d7c6" strokeDasharray="4 4" />
          <XAxis
            dataKey="day"
            tick={{ fontFamily: "sans-serif", fontSize: 11, fill: "#51443d" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontFamily: "sans-serif", fontSize: 11, fill: "#51443d" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f3ea" }} />
          <Bar
            dataKey="orders"
            fill="#c9a063"
            radius={[6, 6, 0, 0]}
            activeBar={{ fill: "#502c12" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
