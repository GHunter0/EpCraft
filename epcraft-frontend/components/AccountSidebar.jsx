"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/payments", label: "Payment Methods", icon: CreditCard },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountSidebar({ active, userProfile }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(userProfile || null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser && !userProfile) {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        setProfile(dbProfile);
      }
    }

    loadUserData();
  }, [userProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Valued Member";
  const joinedYear = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();

  return (
    <aside className="flex w-full md:w-64 shrink-0 flex-col justify-between rounded-r-xl border-r border-border/20 bg-cream py-8 shadow-soft md:min-h-full">
      <div className="flex flex-col gap-8 px-4">
        <p className="font-serif italic text-base text-espresso">Artisan Wood Member</p>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-pill bg-espresso flex items-center justify-center font-serif text-lg font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-sans text-sm text-bark truncate max-w-[140px]">{displayName}</p>
            <p className="font-serif text-xs leading-tight text-espresso">
              Crafting since {joinedYear}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = active === label;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-sans text-sm font-semibold tracking-wide transition ${
                  isActive ? "bg-[#c2e9c6] text-[#486a4e]" : "text-bark hover:bg-white/60"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pt-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-sans text-base font-medium text-red-600 hover:bg-white/60 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
