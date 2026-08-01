"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

const stats = [
  { label: "Total Orders", value: "0" },
  { label: "Wishlist Items", value: "0" },
  { label: "Points", value: "0" },
];

export default function AccountOverviewPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [updating, setUpdating] = useState(false);
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

        const { data: dbProfile, error } = await supabase
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
        // Update local profile state
        setProfile((prev) => ({ ...prev, name, phone, address }));
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-cream font-sans text-bark">
        Loading profile...
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AccountSidebar active="Overview" userProfile={profile} />

      <div className="flex flex-1 flex-col gap-10 px-6 py-8 md:px-16 md:py-12 bg-cream">
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
            <div className="h-14 w-14 rounded-pill border-2 border-gold bg-espresso flex items-center justify-center font-serif text-lg font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
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

            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-sans text-base text-bark">You haven't placed any orders yet.</p>
              <Link href="/shop" className="mt-4 btn-dark px-6 py-2.5">
                Explore Shop
              </Link>
            </div>
          </div>

          {/* Profile info */}
          <div className="flex flex-col gap-6 rounded-xl border border-border/20 bg-white p-8 shadow-card">
            <div>
              <h2 className="font-serif text-2xl text-espresso">Profile Information</h2>
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
                <span className="font-sans text-sm uppercase tracking-widest text-bark">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink focus:border-espresso focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm uppercase tracking-widest text-bark">Email Address</span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="rounded-xl border border-ink/10 bg-sand/30 px-4 py-3 font-sans text-base text-bark/60 cursor-not-allowed"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm uppercase tracking-widest text-bark">Phone Number</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink focus:border-espresso focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm uppercase tracking-widest text-bark">Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="rounded-xl border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink focus:border-espresso focus:outline-none resize-none"
                />
              </label>

              <button type="submit" disabled={updating} className="btn-primary w-full disabled:opacity-50">
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
