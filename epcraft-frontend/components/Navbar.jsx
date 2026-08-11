"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X, User, Bot, ChevronDown, Package, LogIn, ShieldAlert } from "lucide-react";
import { useShop } from "@/lib/ShopContext";
import { createClient } from "@/lib/supabase/client";
import { getCategories } from "@/lib/data/categories";
import { getProductImageUrl } from "@/lib/products";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/customize", label: "Custom Orders" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/story", label: "Our Story" },
  { href: "/ai-stylist", label: "AI Stylist" },
];

export default function Navbar({ onOpenChat }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Hover and Categories dropdown states
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnterShop = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsShopHovered(true);
  };

  const handleMouseLeaveShop = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsShopHovered(false);
    }, 250);
  };

  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist } = useShop();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("name, is_admin")
          .eq("id", currentUser.id)
          .single();

        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    }

    loadUser();

    // Fetch navigation categories on mount
    async function fetchNavCategories() {
      const data = await getCategories();
      setNavCategories(data || []);
    }
    fetchNavCategories();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("name, is_admin")
            .eq("id", currentUser.id)
            .single();

          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest User";
  const displayEmail = user?.email || "";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-espresso md:text-3xl"
          >
            EpCraft
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              
              if (link.label === "Shop") {
                return (
                  <div
                    key={link.href}
                    className=""
                    onMouseEnter={handleMouseEnterShop}
                    onMouseLeave={handleMouseLeaveShop}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 font-sans text-base transition-colors hover:text-espresso pb-4 -mb-4 ${
                        isActive || pathname.startsWith("/shop")
                          ? "border-b-2 border-walnut font-medium text-espresso"
                          : "text-bark"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`opacity-70 transition-transform duration-200 ${isShopHovered ? "rotate-180" : ""}`} />
                    </Link>

                    {/* Full-width transparent category popdown matching header background */}
                    {isShopHovered && (
                      <div
                        onMouseEnter={handleMouseEnterShop}
                        onMouseLeave={handleMouseLeaveShop}
                        className="absolute left-0 top-[72px] w-full border-b border-border/60 bg-cream/75 backdrop-blur-lg py-10 animate-in fade-in slide-in-from-top-1 duration-200 z-40 hidden md:block"
                      >
                        <div className="container-page flex flex-row items-center justify-center gap-12">
                          {navCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/shop?category=${encodeURIComponent(cat.name)}`}
                              onClick={() => setIsShopHovered(false)}
                              className="flex flex-col items-center gap-4 group shrink-0 w-44 text-center"
                            >
                              <div className="h-40 w-40 overflow-hidden rounded-pill bg-sand shadow-card flex items-center justify-center font-serif text-lg text-bark relative transition-transform duration-300 group-hover:scale-105">
                                <img
                                  src={getProductImageUrl(cat.image_url || cat.image)}
                                  alt={cat.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <h3 className="font-sans text-base font-semibold text-espresso group-hover:text-gold transition-colors">
                                {cat.name}
                              </h3>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-base transition-colors hover:text-espresso ${
                    isActive
                      ? "border-b-2 border-walnut font-medium pb-1 text-espresso"
                      : "text-bark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            {/* AI Assistant trigger */}
            <button
              onClick={onOpenChat}
              aria-label="Open AI Assistant"
              className="flex items-center gap-1.5 rounded-pill bg-gold/15 px-3 py-1.5 font-sans text-xs font-semibold text-espresso hover:bg-gold hover:text-white transition-colors"
            >
              <Bot size={16} />
              AI Assistant
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalog"
              className="text-bark hover:text-espresso transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative text-bark hover:text-espresso transition-colors"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-bark hover:text-espresso transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-espresso text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="User Account"
                className="flex items-center gap-1 text-bark hover:text-espresso transition-colors p-1 rounded-full hover:bg-sand/40"
              >
                <User size={20} />
                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <div
                  onMouseLeave={() => setProfileOpen(false)}
                  className="absolute right-0 mt-3 w-56 rounded-xl border border-border/60 bg-white p-2 shadow-card animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                >
                  {user ? (
                    <>
                      <div className="border-b border-border/40 px-3 py-2">
                        <p className="font-serif text-sm font-bold text-espresso">{displayName}</p>
                        <p className="font-sans text-xs text-bark truncate">{displayEmail}</p>
                      </div>
                      <div className="py-1">
                        {profile?.is_admin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-semibold text-espresso hover:bg-cream"
                          >
                            <ShieldAlert size={16} className="text-gold" /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/account"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm text-ink hover:bg-cream"
                        >
                          <User size={16} className="text-espresso" /> My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm text-ink hover:bg-cream"
                        >
                          <Package size={16} className="text-espresso" /> Orders & Tracking
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm text-ink hover:bg-cream"
                        >
                          <Heart size={16} className="text-espresso" /> Saved Wishlist
                        </Link>
                        <hr className="my-1 border-border/40" />
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm text-red-600 hover:bg-cream"
                        >
                          <LogIn size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 flex flex-col gap-2">
                      <p className="font-sans text-xs text-bark text-center pb-1">Sign in to your account</p>
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="btn-dark w-full text-center py-2 text-xs"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setProfileOpen(false)}
                        className="w-full text-center py-2 text-xs font-sans text-espresso font-semibold hover:underline"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className="text-espresso md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border/60 bg-cream px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-lg ${
                    pathname === link.href ? "font-bold text-espresso" : "text-bark"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border/60" />
              <div className="flex flex-col gap-3 pt-1">
                {user ? (
                  <>
                    <p className="font-serif text-sm font-bold text-espresso px-1">{displayName}</p>
                    {profile?.is_admin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 font-sans text-base font-semibold text-espresso"
                        onClick={() => setOpen(false)}
                      >
                        <ShieldAlert size={18} className="text-gold" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-2 font-sans text-base text-bark"
                      onClick={() => setOpen(false)}
                    >
                      <User size={18} /> My Account & Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 font-sans text-base text-bark"
                      onClick={() => setOpen(false)}
                    >
                      <Package size={18} /> Orders & Tracking
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 font-sans text-base text-bark"
                      onClick={() => setOpen(false)}
                    >
                      <Heart size={18} /> Wishlist ({wishlist.length})
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-2 font-sans text-base text-red-600 font-medium pt-1"
                    >
                      <LogIn size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="btn-dark flex-1 text-center py-2.5 text-sm"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-pill border border-bark/20 bg-white flex-1 text-center py-2.5 text-sm font-semibold text-ink"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Quick Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-espresso/40 p-4 pt-20 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-card">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-4 text-bark hover:text-espresso"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-xl font-bold text-espresso">Search EpCraft</h3>
            <p className="mt-1 font-sans text-sm text-bark">Find handcrafted furniture, decor & custom pieces</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                }
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                placeholder="Search Walnut Table, Oak Board, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-field flex-1"
              />
              <button type="submit" className="btn-dark">
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
