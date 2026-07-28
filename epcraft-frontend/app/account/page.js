"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";

const stats = [
  { label: "Total Orders", value: "12" },
  { label: "Wishlist Items", value: "08" },
  { label: "Points", value: "450" },
];

const recentOrders = [
  {
    name: "Hand-Carved Walnut Platter",
    id: "EW-98231",
    date: "June 12, 2026",
    status: "In Production",
    statusColor: "bg-[#c2e9c6] text-[#486a4e]",
  },
  {
    name: "Geometric Oak Coasters (Set of 4)",
    id: "EW-98210",
    date: "July 08, 2026",
    status: "Delivered",
    statusColor: "bg-sand text-bark",
  },
];

export default function AccountOverviewPage() {
  return (
    <div className="flex flex-col md:flex-row">
      <AccountSidebar active="Overview" />

      <div className="flex flex-1 flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
              Welcome back, Julian
            </h1>
            <p className="font-sans text-base text-bark">
              Here is a summary of your recent artisanal journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-sans text-sm font-semibold tracking-wide text-espresso">
                Julian Thorne
              </p>
              <p className="font-sans text-base text-bark">Member since 2023</p>
            </div>
            <div className="h-14 w-14 rounded-pill border-2 border-gold bg-sand" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-between gap-6 rounded-xl border-l-4 border-gold bg-white p-6 shadow-card"
            >
              <span className="font-sans text-base uppercase tracking-widest text-bark">
                {stat.label}
              </span>
              <span className="font-serif text-3xl font-semibold text-espresso">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent orders */}
          <div className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gold/40 pb-4">
              <h2 className="font-serif text-2xl text-espresso">Recent Orders</h2>
              <Link href="/orders" className="font-sans text-sm font-semibold text-gold">
                View All
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-border/20">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 py-6 first:pt-0 last:pb-0">
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-sand" />
                  <div className="flex-1">
                    <p className="font-sans text-base font-bold text-espresso">{order.name}</p>
                    <p className="font-sans text-base text-bark">
                      Order #{order.id} • {order.date}
                    </p>
                  </div>
                  <span className={`rounded-pill px-4 py-2 font-sans text-base font-semibold ${order.statusColor}`}>
                    {order.status}
                  </span>
                  <ChevronRight size={16} className="text-bark" />
                </div>
              ))}
            </div>
          </div>

          {/* Profile info */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/20 bg-white p-8 shadow-card">
            <div>
              <h2 className="font-serif text-2xl text-espresso">Profile Information</h2>
              <div className="mt-4 h-px w-36 bg-gold/50" />
            </div>
            <form className="flex flex-col gap-5">
              <Field label="Full Name" defaultValue="Julian Thorne" />
              <Field label="Email Address" defaultValue="julian.thorne@craftmail.com" />
              <Field label="Phone Number" defaultValue="+94 (071) 156-0363" />
              <button type="submit" className="btn-primary w-full">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-sm uppercase tracking-widest text-bark">{label}</span>
      <input
        defaultValue={defaultValue}
        className="rounded-xl border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink"
      />
    </label>
  );
}
