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

  // Local state for parsed addresses
  const [primaryAddr, setPrimaryAddr] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "Sri Lanka",
  });
  const [secondaryAddr, setSecondaryAddr] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "Sri Lanka",
  });

  // Current editing address type: 'primary' | 'secondary' | null
  const [editType, setEditType] = useState(null);

  // Form field states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Sri Lanka");

  const supabase = createClient();

  // Helper to parse address string (supports JSON format or fallback comma format)
  const parseAddress = (addrStr, defaultName = "", defaultPhone = "") => {
    const defaultVal = {
      name: defaultName,
      phone: defaultPhone,
      street: "",
      city: "",
      zip: "",
      country: "Sri Lanka",
    };
    if (!addrStr) return defaultVal;

    // Check if it is stored as JSON
    if (addrStr.trim().startsWith("{")) {
      try {
        return { ...defaultVal, ...JSON.parse(addrStr) };
      } catch (e) {
        console.error("Failed to parse JSON address, falling back", e);
      }
    }

    // Fallback: parse comma separated values
    const parts = addrStr.split(",").map((s) => s.trim());
    return {
      name: defaultName,
      phone: defaultPhone,
      street: parts[0] || "",
      city: parts[1] || "",
      zip: parts[2] || "",
      country: parts[3] || "Sri Lanka",
    };
  };

  const loadAddressData = async () => {
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
        // Parse primary address
        const parsedPrimary = parseAddress(profile.address, profile.name || "", profile.phone || "");
        setPrimaryAddr(parsedPrimary);

        // Parse secondary address
        const parsedSecondary = parseAddress(profile.secondary_address, "", "");
        setSecondaryAddr(parsedSecondary);
      }
    } catch (err) {
      console.error("Error loading address data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadAddressData();
    });
  }, []);

  const handleEditClick = (type) => {
    setEditType(type);
    const target = type === "primary" ? primaryAddr : secondaryAddr;
    setName(target.name);
    setPhone(target.phone);
    setStreet(target.street);
    setCity(target.city);
    setZip(target.zip);
    setCountry(target.country || "Sri Lanka");
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Save as JSON string to support full fields including name/phone per address
    const addressData = { name, phone, street, city, zip, country };
    const serializedAddress = JSON.stringify(addressData);

    try {
      let updatePayload = {};
      if (editType === "primary") {
        // For primary, we update both the legacy fields (for compatibility) and the structured address
        const legacyAddressString = [street, city, zip, country].filter(Boolean).join(", ");
        updatePayload = {
          name: name, // global name
          phone: phone, // global phone
          address: legacyAddressString, // plain text
        };
      } else {
        updatePayload = {
          secondary_address: serializedAddress,
        };
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage(`${editType === "primary" ? "Primary" : "Secondary"} address saved successfully!`);
        setMessageType("success");
        setEditType(null);
        await loadAddressData();
      }
    } catch (err) {
      setMessage("Failed to save address: " + err.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (type) => {
    if (!confirm(`Are you sure you want to remove your ${type} address?`)) return;
    
    try {
      let updatePayload = {};
      if (type === "primary") {
        updatePayload = { address: null };
      } else {
        updatePayload = { secondary_address: null };
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage(`${type === "primary" ? "Primary" : "Secondary"} address removed successfully.`);
        setMessageType("success");
        await loadAddressData();
      }
    } catch (err) {
      setMessage("Failed to delete address: " + err.message);
      setMessageType("error");
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

  const hasPrimary = Boolean(primaryAddr.street.trim());
  const hasSecondary = Boolean(secondaryAddr.street.trim());

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

        {/* Display Current Address Cards */}
        {editType === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Primary Address Card */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-espresso">Primary Destination</h2>
                {!hasPrimary && (
                  <button
                    onClick={() => handleEditClick("primary")}
                    className="flex items-center gap-1.5 btn-primary py-2 px-4 rounded-pill text-xs font-semibold"
                  >
                    <Plus size={12} /> Add Primary
                  </button>
                )}
              </div>

              {hasPrimary ? (
                <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-card flex flex-col gap-4 min-h-[220px] justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-pill bg-espresso text-white shrink-0">
                          <Home size={14} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-espresso">{primaryAddr.name || "Primary Recipient"}</h3>
                          <span className="inline-block rounded-pill bg-gold/15 px-2 py-0.5 font-sans text-[8px] uppercase font-bold text-espresso tracking-wider border border-gold/30">
                            Default Address
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick("primary")}
                          title="Edit"
                          className="p-2 hover:bg-cream rounded-full transition-colors text-espresso"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress("primary")}
                          title="Delete"
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-bark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border/20 my-3" />

                    <div className="flex flex-col gap-1 font-sans text-sm text-bark">
                      <p className="font-semibold text-ink">{primaryAddr.street}</p>
                      <p>{[primaryAddr.city, primaryAddr.zip, primaryAddr.country].filter(Boolean).join(", ")}</p>
                      {primaryAddr.phone && <p className="pt-1 text-xs text-bark/80">Phone: {primaryAddr.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 font-sans text-[11px] text-green-800 bg-green-50/50 p-2.5 rounded-xl border border-green-200/50">
                    <ShieldCheck size={14} className="text-green-700 shrink-0" />
                    <span>Active and verified for checkout autofill.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-white py-12 text-center shadow-soft min-h-[220px]">
                  <MapPin size={24} className="text-bark" />
                  <h3 className="font-serif text-base font-semibold text-espresso">No primary address</h3>
                  <button
                    onClick={() => handleEditClick("primary")}
                    className="btn-dark px-4 py-2 rounded-pill text-xs font-semibold"
                  >
                    Set Primary Address
                  </button>
                </div>
              )}
            </div>

            {/* Secondary Address Card */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-espresso">Secondary Destination</h2>
                {!hasSecondary && (
                  <button
                    onClick={() => handleEditClick("secondary")}
                    className="flex items-center gap-1.5 btn-primary py-2 px-4 rounded-pill text-xs font-semibold"
                  >
                    <Plus size={12} /> Add Secondary
                  </button>
                )}
              </div>

              {hasSecondary ? (
                <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-card flex flex-col gap-4 min-h-[220px] justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-pill bg-espresso/60 text-white shrink-0">
                          <Home size={14} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-espresso">{secondaryAddr.name || "Secondary Recipient"}</h3>
                          <span className="inline-block rounded-pill bg-bark/10 px-2 py-0.5 font-sans text-[8px] uppercase font-bold text-espresso tracking-wider border border-bark/20">
                            Backup Destination
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick("secondary")}
                          title="Edit"
                          className="p-2 hover:bg-cream rounded-full transition-colors text-espresso"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress("secondary")}
                          title="Delete"
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-bark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border/20 my-3" />

                    <div className="flex flex-col gap-1 font-sans text-sm text-bark">
                      <p className="font-semibold text-ink">{secondaryAddr.street}</p>
                      <p>{[secondaryAddr.city, secondaryAddr.zip, secondaryAddr.country].filter(Boolean).join(", ")}</p>
                      {secondaryAddr.phone && <p className="pt-1 text-xs text-bark/80">Phone: {secondaryAddr.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 font-sans text-[11px] text-green-800 bg-green-50/50 p-2.5 rounded-xl border border-green-200/50">
                    <ShieldCheck size={14} className="text-green-700 shrink-0" />
                    <span>Available as secondary selection at checkout.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-white py-12 text-center shadow-soft min-h-[220px]">
                  <MapPin size={24} className="text-bark" />
                  <h3 className="font-serif text-base font-semibold text-espresso">No secondary address</h3>
                  <button
                    onClick={() => handleEditClick("secondary")}
                    className="btn-dark px-4 py-2 rounded-pill text-xs font-semibold"
                  >
                    Set Secondary Address
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Address Form (Add/Edit) */}
        {editType !== null && (
          <div className="flex flex-col gap-6 rounded-2xl border border-border/40 bg-white p-8 shadow-card max-w-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="font-serif text-xl font-bold text-espresso">
                {editType === "primary" ? "Edit Primary Address" : "Edit Secondary Address"}
              </h2>
              <button
                onClick={() => setEditType(null)}
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
                  onClick={() => setEditType(null)}
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
