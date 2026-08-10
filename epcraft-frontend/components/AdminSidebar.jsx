"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Sliders,
  Package,
  FolderTree,
  User,
  Settings,
  Store,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/custom-orders", label: "Custom Orders", icon: Sliders },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: User },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ userEmail }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-espresso text-cream flex flex-col min-h-screen border-r border-border/20 shadow-card shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-2">
        <ShieldCheck className="text-gold h-6 w-6 shrink-0" />
        <div>
          <h2 className="font-serif text-lg font-bold tracking-tight">EpCraft Admin</h2>
          <span className="font-sans text-[10px] text-cream/60 uppercase tracking-widest font-semibold">
            Internal Studio Suite
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          // Exact match for dashboard, prefix match for others to keep highlight active during sub-actions
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold text-espresso font-semibold shadow-soft"
                  : "text-cream/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={isActive ? "text-espresso" : "text-cream/60"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-3">
        <div className="px-2">
          <p className="font-sans text-[10px] uppercase text-cream/50 tracking-wider">Logged in as</p>
          <p className="font-sans text-xs text-cream truncate mt-0.5">{userEmail || "admin@epcraft.com"}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-xs text-cream/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Store size={14} className="text-cream/50" />
            Back to Client Shop
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-xs text-red-300 hover:text-red-200 hover:bg-white/5 transition-colors text-left"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
