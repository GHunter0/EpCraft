"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Plus, Edit2, Check, Trash2, Loader2, ShieldCheck, Home } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

export default function AddressesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  // Address form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [isEditing, setIsEditing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadAddressData() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profile) {
          setName(profile.name || currentUser.user_metadata?.full_name || "");
          setPhone(profile.phone || "");

          const rawAddress = profile.address || "";
          if (rawAddress.includes(",")) {
            const parts = rawAddress.split(",").map((s) => s.trim());
            setStreet(parts[0] || rawAddress);
            if (parts.length >= 2) setCity(parts[parts.length - 2]);
            if (parts.length >= 3) setZip(parts[parts.length - 1]);
          } else {
            setStreet(rawAddress);
          }
        }
      } catch (err) {
        console.error("Error loading address data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAddressData();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const fullAddress = [street, city, zip, country].filter(Boolean).join(", ");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          phone,
          address: fullAddress,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Primary shipping address saved successfully!");
        setMessageType("success");
        setIsEditing(false);
      }
    } catch (err) {
      setMessage("Failed to save address: " + err.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-cream font-sans text-bark">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-3">Loading address book...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-cream gap-4 font-sans text-bark">
        <p>Please log in to manage your addresses.</p>
        <Link href="/login?returnTo=/account/addresses" className="btn-dark px-6 py-2.5">
          Go to Login
        </Link>
      </div>
    );
  }

  const hasAddress = Boolean(street.trim());

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cream">
      <AccountSidebar active="Addresses" />

      <div className="flex flex-1 flex-col gap-8 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-espresso font-semibold">Address Book</h1>
          <p className="font-sans text-base text-bark">
            Manage your delivery destinations for white-glove artisan shipments.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg border p-4 font-sans text-sm ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Display Current Address Card */}
        {!isEditing && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-espresso">Saved Delivery Address</h2>
              {!hasAddress && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 btn-primary py-2.5 px-5 rounded-pill text-xs font-semibold"
                >
                  <Plus size={14} /> Add Address
                </button>
              )}
            </div>

            {hasAddress ? (
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-white p-8 shadow-card flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-espresso text-white">
                      <Home size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-espresso">{name || "Primary Recipient"}</h3>
                      <span className="inline-block rounded-pill bg-gold/15 px-3 py-0.5 font-sans text-[10px] uppercase font-bold text-espresso tracking-wider border border-gold/30">
                        Default Shipping Destination
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 rounded-pill border border-border/50 bg-cream px-4 py-2 font-sans text-xs font-semibold text-espresso hover:bg-espresso hover:text-white transition-colors"
                  >
                    <Edit2 size={13} /> Edit Address
                  </button>
                </div>

                <div className="h-px w-full bg-border/20" />

                <div className="flex flex-col gap-2 font-sans text-sm text-bark">
                  <p className="font-semibold text-ink">{street}</p>
                  <p>{[city, zip, country].filter(Boolean).join(", ")}</p>
                  {phone && <p className="pt-1 text-xs text-bark/80">Phone: {phone}</p>}
                </div>

                <div className="flex items-center gap-2 pt-2 font-sans text-xs text-green-800 bg-green-50/60 p-3 rounded-xl border border-green-200/60">
                  <ShieldCheck size={16} className="text-green-700 shrink-0" />
                  <span>Verified for Express Artisan Delivery & PayHere Checkout auto-fill.</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-white py-16 text-center shadow-soft">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-bark">
                  <MapPin size={30} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-espresso">No saved address yet</h3>
                <p className="max-w-sm font-sans text-sm text-bark">
                  Save your primary shipping destination for faster 1-click checkout during artisan orders.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-dark px-6 py-3 rounded-pill text-sm font-semibold"
                >
                  Set Delivery Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Address Form (Add/Edit) */}
        {isEditing && (
          <div className="flex flex-col gap-6 rounded-2xl border border-border/40 bg-white p-8 shadow-card max-w-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="font-serif text-xl font-bold text-espresso">
                {hasAddress ? "Edit Delivery Address" : "Add Primary Delivery Address"}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="font-sans text-xs font-semibold text-bark hover:text-espresso"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                  Recipient Full Name *
                </span>
                <input
                  type="text"
                  required
                  placeholder="Julian Vane"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                  Street Address & Building / Suite *
                </span>
                <input
                  type="text"
                  required
                  placeholder="No. 128 Artisan Way, Studio 4"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    City / Town *
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Colombo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    Postal / Zip Code
                  </span>
                  <input
                    type="text"
                    placeholder="00100"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    Country
                  </span>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    Delivery Phone Number *
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </label>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary rounded-pill py-3.5 px-8 font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? "Saving Address..." : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-outline-dark border-0 px-6 py-3.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
