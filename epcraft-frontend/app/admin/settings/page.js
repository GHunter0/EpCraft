"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Settings, Landmark, Mail, Phone, MapPin, Truck } from "lucide-react";
import { getStoreSettings, updateStoreSettings } from "./actions";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Form fields
  const [standardShipping, setStandardShipping] = useState("");
  const [expressShipping, setExpressShipping] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const data = await getStoreSettings();
      setStandardShipping(data.standard_shipping.toString());
      setExpressShipping(data.express_shipping.toString());
      setTaxPercentage(data.tax_percentage.toString());
      setStoreName(data.store_name);
      setStoreEmail(data.store_email);
      setStorePhone(data.store_phone);
      setStoreAddress(data.store_address);
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setServerError("");
    setValidationErrors({});

    const fd = new FormData();
    fd.set("standard_shipping", standardShipping);
    fd.set("express_shipping", expressShipping);
    fd.set("tax_percentage", taxPercentage);
    fd.set("store_name", storeName);
    fd.set("store_email", storeEmail);
    fd.set("store_phone", storePhone);
    fd.set("store_address", storeAddress);

    try {
      const res = await updateStoreSettings(fd);
      if (res.validationErrors) {
        setValidationErrors(res.validationErrors);
      } else if (res.error) {
        setServerError(res.error);
      } else if (res.success) {
        setSuccessMessage("Store settings saved successfully!");
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="font-sans text-sm text-bark">Loading store configuration…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-4xl font-bold text-espresso">Settings</h1>
        <p className="font-sans text-sm text-bark mt-1">
          Adjust store-level variables including regional taxation, express shipping rates, and contact details.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-sans text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-sans text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Shipping & Tax Rates */}
        <div className="rounded-2xl bg-white shadow-card border border-border/40 p-6 flex flex-col gap-5">
          <h2 className="font-serif text-xl font-bold text-espresso flex items-center gap-2 border-b border-border/30 pb-3">
            <Truck size={20} className="text-gold" /> Rates & Taxation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Standard Shipping (LKR)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={standardShipping}
                onChange={(e) => setStandardShipping(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.standard_shipping && (
                <span className="text-xs text-red-600 font-sans mt-0.5">{validationErrors.standard_shipping}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Express Shipping (LKR)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expressShipping}
                onChange={(e) => setExpressShipping(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.express_shipping && (
                <span className="text-xs text-red-600 font-sans mt-0.5">{validationErrors.express_shipping}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Tax Percentage (%)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.tax_percentage && (
                <span className="text-xs text-red-600 font-sans mt-0.5">{validationErrors.tax_percentage}</span>
              )}
            </label>
          </div>
        </div>

        {/* Store Profile Info */}
        <div className="rounded-2xl bg-white shadow-card border border-border/40 p-6 flex flex-col gap-5">
          <h2 className="font-serif text-xl font-bold text-espresso flex items-center gap-2 border-b border-border/30 pb-3">
            <Landmark size={20} className="text-gold" /> Store Profile & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Store Name
              </span>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.store_name && (
                <span className="text-xs text-red-600 font-sans mt-0.5">{validationErrors.store_name}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Public Support Email
              </span>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.store_email && (
                <span className="text-xs text-red-600 font-sans mt-0.5">{validationErrors.store_email}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Public Support Phone
              </span>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Physical HQ Address
              </span>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-espresso hover:bg-gold text-white px-8 py-3.5 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
