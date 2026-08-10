"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Check, X, Loader2, Clock, ShieldCheck, Tag } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

export default function AccountOverviewPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic stats
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Lists
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [updating, setUpdating] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Fetch profile
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (dbProfile) {
          setProfile(dbProfile);
          setName(dbProfile.name || currentUser.user_metadata?.full_name || "");
          setPhone(dbProfile.phone || currentUser.user_metadata?.phone || "");
          setAddress(dbProfile.address || "");
        }

        // Fetch counts & details parallelly
        const [ordersRes, wishlistRes, ordersDataRes, customReqsRes] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("wishlist_items").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("orders").select("total, created_at, status, payment_status").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
          supabase.from("custom_order_requests").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false })
        ]);

        setOrdersCount(ordersRes.count || 0);
        setWishlistCount(wishlistRes.count || 0);

        const allOrders = ordersDataRes.data || [];
        setOrders(allOrders.slice(0, 3)); // show top 3 recent orders

        const paidTotal = allOrders
          .filter(o => o.payment_status === "paid")
          .reduce((sum, o) => sum + Number(o.total), 0);
        setLoyaltyPoints(Math.floor(paidTotal * 0.05)); // 5% rewards back

        setCustomRequests(customReqsRes.data || []);
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          phone,
          address,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setProfile((prev) => ({ ...prev, name, phone, address }));
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setMessage(null);
    setDecliningId(requestId);
    try {
      const { error } = await supabase
        .from("custom_order_requests")
        .update({ status: "declined" })
        .eq("id", requestId)
        .eq("status", "quoted"); // safety check

      if (error) throw error;

      setCustomRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "declined" } : req))
      );
      setMessage("You have declined the custom quote.");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Failed to decline custom request: " + err.message);
      setMessageType("error");
    } finally {
      setDecliningId(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setMessage(null);
    setAcceptingId(requestId);

    try {
      const response = await fetch("/api/custom-orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to accept custom request.");
      }

      // Redirect user to PayHere sandbox payment page
      const payhereParams = resData.payhereParams;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(payhereParams).forEach(([key, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = typeof val === "object" ? JSON.stringify(val) : val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "An error occurred while accepting request.");
      setMessageType("error");
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-cream font-sans text-bark">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-3">Loading profile data...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-cream gap-4 font-sans text-bark">
        <p>Please log in to view your profile.</p>
        <Link href="/login" className="btn-dark px-6 py-2.5">
          Go to Login
        </Link>
      </div>
    );
  }

  const displayName = name || user.email.split("@")[0];
  const joinedYear = user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();

  const stats = [
    { label: "Total Orders", value: ordersCount },
    { label: "Wishlist Items", value: wishlistCount },
    { label: "Loyalty Points", value: loyaltyPoints },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cream">
      <AccountSidebar active="Overview" userProfile={profile} />

      <div className="flex flex-1 flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="font-sans text-base text-bark">
              Here is a summary of your recent artisanal journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-sans text-sm font-semibold tracking-wide text-espresso">
                {displayName}
              </p>
              <p className="font-sans text-base text-bark">Member since {joinedYear}</p>
            </div>
            <div className="h-14 w-14 rounded-pill border-2 border-gold bg-espresso flex items-center justify-center font-serif text-lg font-bold text-white shadow-soft">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-between gap-4 rounded-xl border-l-4 border-gold bg-white p-6 shadow-card"
            >
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                {stat.label}
              </span>
              <span className="font-serif text-3xl font-semibold text-espresso">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Recent orders */}
            <div className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-card">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="font-serif text-2xl font-bold text-espresso">Recent Orders</h2>
                <Link href="/orders" className="font-sans text-sm font-semibold text-gold hover:underline">
                  View All
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="font-sans text-base text-bark">You haven&apos;t placed any orders yet.</p>
                  <Link href="/shop" className="mt-4 btn-dark px-6 py-2.5">
                    Explore Shop
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4 divide-y divide-border/20">
                  {orders.map((o, idx) => (
                    <div key={o.id || idx} className="flex justify-between items-center pt-4 first:pt-0">
                      <div>
                        <p className="font-serif text-base font-bold text-espresso">
                          Order #{(o?.id || "").slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-sans text-xs text-bark">
                          Placed on {new Date(o.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-sm font-semibold text-ink">
                          {formatPrice(o.total)}
                        </p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cream border border-border/40 text-espresso">
                          {o.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Requests */}
            <div className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-card">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="font-serif text-2xl font-bold text-espresso">My Custom Requests</h2>
                <span className="font-sans text-xs font-semibold text-gold">Quote Status Dashboard</span>
              </div>

              {customRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="font-sans text-base text-bark">No custom workshop requests submitted yet.</p>
                  <Link href="/customize" className="mt-4 btn-dark px-6 py-2.5">
                    Open Customizer
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6 divide-y divide-border/20">
                  {customRequests.map((req) => (
                    <div key={req.id} className="flex flex-col gap-4 pt-6 first:pt-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-serif text-lg font-bold text-espresso">
                            Custom {req.finish || "Bespoke"} Board
                          </p>
                          <p className="font-sans text-xs text-bark mt-1">
                            Specs: {req.dimension} • Font: {req.font}
                          </p>
                          {req.engraving_text && (
                            <p className="font-sans text-xs text-gold font-semibold mt-1">
                              Engraving: &quot;{req.engraving_text}&quot;
                            </p>
                          )}
                        </div>

                        {/* Status Tag */}
                        <div>
                          {req.status === "pending_review" && (
                            <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1 font-sans text-xs font-semibold text-gray-600 border border-gray-200">
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                          {req.status === "quoted" && (
                            <span className="inline-flex items-center gap-1.5 rounded bg-gold/15 px-3 py-1 font-sans text-xs font-semibold text-espresso border border-gold/30">
                              <Tag size={12} className="text-gold" /> Quote Prepared
                            </span>
                          )}
                          {req.status === "accepted" && (
                            <span className="inline-flex items-center gap-1.5 rounded bg-green-50 px-3 py-1 font-sans text-xs font-semibold text-green-700 border border-green-200">
                              <Check size={12} /> Accepted & Paid
                            </span>
                          )}
                          {req.status === "declined" && (
                            <span className="inline-flex items-center gap-1.5 rounded bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-700 border border-red-200">
                              <X size={12} /> Quote Declined
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quote Info & Customer Decision */}
                      {req.status === "quoted" && (
                        <div className="flex flex-col gap-4 bg-cream/60 p-4 rounded-xl border border-border/40">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                              <p className="font-sans text-sm text-bark">
                                Quoted Price: <strong className="text-espresso">{formatPrice(Number(req.quoted_price))}</strong>
                              </p>
                              <p className="font-sans text-xs text-bark mt-1">
                                Est. Lead Time: <span className="text-espresso font-semibold">{req.quoted_lead_time || "4-6 weeks"}</span>
                              </p>
                              {req.admin_note && (
                                <p className="font-sans text-xs italic text-bark/80 mt-2 bg-white/60 p-2 rounded border border-border/20">
                                  Note: {req.admin_note}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeclineRequest(req.id)}
                                disabled={decliningId === req.id || acceptingId === req.id}
                                className="flex items-center gap-1 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-700 px-4 py-2 rounded-pill font-sans text-xs font-semibold shadow-soft transition-colors disabled:opacity-50"
                              >
                                {decliningId === req.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <X size={14} />
                                )}
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptRequest(req.id)}
                                disabled={acceptingId === req.id || decliningId === req.id}
                                className="flex items-center gap-1 bg-espresso hover:bg-gold text-white px-5 py-2 rounded-pill font-sans text-xs font-semibold shadow-soft transition-colors disabled:opacity-50"
                              >
                                {acceptingId === req.id ? (
                                  <Loader2 size={14} className="animate-spin text-white" />
                                ) : (
                                  <Check size={14} />
                                )}
                                Accept & Pay
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/20 bg-white p-8 shadow-card h-fit">
            <div>
              <h2 className="font-serif text-2xl font-bold text-espresso">Profile Information</h2>
              <div className="mt-4 h-px w-36 bg-gold/50" />
            </div>

            {message && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">Email Address</span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="rounded-xl border border-ink/10 bg-sand/30 px-4 py-3.5 font-sans text-sm text-bark/60 cursor-not-allowed"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">Phone Number</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </label>

              <button type="submit" disabled={updating} className="btn-primary w-full disabled:opacity-50 py-3.5 rounded-pill font-semibold text-sm">
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
