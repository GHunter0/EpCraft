import Link from "next/link";
import {
  LayoutGrid,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/payments", label: "Payment Methods", icon: CreditCard },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountSidebar({ active }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between rounded-r-xl border-r border-border/20 bg-cream py-8 shadow-soft md:h-full">
      <div className="flex flex-col gap-8 px-4">
        <p className="font-serif italic text-base text-espresso">Artisan Wood</p>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-pill bg-border" />
          <div>
            <p className="font-sans text-base text-bark">Welcome back</p>
            <p className="font-serif text-base leading-tight text-espresso">
              Crafting since
              <br />
              2023
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

      <div className="px-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-sans text-base font-medium text-red-600 hover:bg-white/60">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
