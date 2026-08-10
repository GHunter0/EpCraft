"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Shield, Bell, Lock, Check, Loader2 } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-cream font-sans text-bark">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-3">Loading settings...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-cream gap-4 font-sans text-bark">
        <p>Please log in to manage account settings.</p>
        <Link href="/login?returnTo=/account/settings" className="btn-dark px-6 py-2.5">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cream">
      <AccountSidebar active="Settings" />

      <div className="flex flex-1 flex-col gap-8 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-espresso font-semibold">Account Settings</h1>
          <p className="font-sans text-base text-bark">
            Manage your account security and communication preferences.
          </p>
        </div>

        {saved && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-sans text-sm text-green-800 flex items-center gap-2 max-w-2xl">
            <Check size={16} /> Notification preferences updated successfully!
          </div>
        )}

        <div className="flex flex-col gap-8 max-w-2xl">
          {/* Account Security Card */}
          <div className="rounded-2xl border border-border/40 bg-white p-8 shadow-card flex flex-col gap-6">
            <h2 className="font-serif text-xl font-bold text-espresso flex items-center gap-2 border-b border-border/30 pb-4">
              <Shield size={20} className="text-gold" /> Account Security
            </h2>

            <div className="flex flex-col gap-4 font-sans text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">Email Address</p>
                  <p className="text-xs text-bark">{user.email}</p>
                </div>
                <span className="text-xs font-semibold uppercase text-gold bg-cream px-3 py-1 rounded border border-border/40">
                  Verified
                </span>
              </div>

              <div className="h-px w-full bg-border/20" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">Authentication Method</p>
                  <p className="text-xs text-bark">
                    {user.app_metadata?.provider === "google" ? "Google OAuth 2.0" : "Email & Password"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-espresso">Active</span>
              </div>
            </div>
          </div>

          {/* Notifications Form */}
          <form onSubmit={handleSavePreferences} className="rounded-2xl border border-border/40 bg-white p-8 shadow-card flex flex-col gap-6">
            <h2 className="font-serif text-xl font-bold text-espresso flex items-center gap-2 border-b border-border/30 pb-4">
              <Bell size={20} className="text-gold" /> Communication Preferences
            </h2>

            <div className="flex flex-col gap-4 font-sans text-sm">
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="font-semibold text-ink">Order & Shipping Updates</p>
                  <p className="text-xs text-bark">Receive email notifications when your custom order status updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-5 w-5 accent-espresso rounded border-border/60"
                />
              </label>

              <div className="h-px w-full bg-border/20" />

              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="font-semibold text-ink">SMS Dispatch Alerts</p>
                  <p className="text-xs text-bark">Receive direct SMS alerts when white-glove delivery is dispatched</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotifs}
                  onChange={(e) => setSmsNotifs(e.target.checked)}
                  className="h-5 w-5 accent-espresso rounded border-border/60"
                />
              </label>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary rounded-pill py-3 px-8 text-sm font-semibold">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
