"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

type CartItem = WishlistProduct & {
  details: string;
  quantity: number;
};

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
};

const WISHLIST_STORAGE_KEY = "epcraft-wishlist-items";
const CART_STORAGE_KEY = "epcraft-cart";
const PROFILE_STORAGE_KEY = "epcraft-profile";

const sidebarItems = [
  { label: "Overview", href: "/account", icon: "grid" },
  { label: "Orders", href: "/account/orders", icon: "orders" },
  { label: "Wishlist", href: "/account/wishlist", icon: "heart" },
  { label: "Addresses", href: "", icon: "pin" },
  { label: "Payment Methods", href: "", icon: "card" },
  { label: "Settings", href: "", icon: "settings" },
];

function formatPrice(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Icon({
  type,
  className = "h-5 w-5",
  filled = false,
}: {
  type: string;
  className?: string;
  filled?: boolean;
}) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    stroke: "currentColor",
    strokeWidth: 1.8,
    fill: filled ? "currentColor" : "none",
  };

  if (type === "grid") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === "orders") {
    return (
      <svg {...common}>
        <path d="M5 3h14v18H5zM8 7h8M8 11h5M8 15h7" />
      </svg>
    );
  }

  if (type === "heart") {
    return (
      <svg {...common}>
        <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
      </svg>
    );
  }

  if (type === "pin") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18M7 15h4" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg {...common}>
        <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (type === "cart") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 12H5L6 8ZM9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (type === "bag") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 12H5L6 8ZM9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (type === "share") {
    return (
      <svg {...common}>
        <circle cx="18" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="m8 11 8-5M8 13l8 5" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2c.8 3.9 2.6 5.7 6.5 6.5-3.9.8-5.7 2.6-6.5 6.5-.8-3.9-2.6-5.7-6.5-6.5C9.4 7.7 11.2 5.9 12 2Z" />
      <path d="M19 13c.4 2 1.3 2.9 3.3 3.3-2 .4-2.9 1.3-3.3 3.3-.4-2-1.3-2.9-3.3-3.3 2-.4 2.9-1.3 3.3-3.3Z" />
    </svg>
  );
}


export default function WishlistPage() {
  const router = useRouter();

  const [wishlistProducts, setWishlistProducts] =
    useState<WishlistProduct[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [profileName, setProfileName] = useState("User");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const savedWishlist = window.localStorage.getItem(
        WISHLIST_STORAGE_KEY,
      );
      const savedProfile = window.localStorage.getItem(
        PROFILE_STORAGE_KEY,
      );

      const parsedWishlist: WishlistProduct[] =
        savedWishlist ? JSON.parse(savedWishlist) : [];

      const nextWishlist = Array.isArray(parsedWishlist)
        ? parsedWishlist
        : [];

      setWishlistProducts(nextWishlist);

      if (!savedWishlist) {
        window.localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          "[]",
        );
      }

      if (savedProfile) {
        const profile: ProfileData = JSON.parse(savedProfile);

        if (profile.fullName.trim()) {
          setProfileName(profile.fullName.trim());
        }
      }
    } catch {
      setWishlistProducts([]);

      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        "[]",
      );
    } finally {
      setPageLoaded(true);
    }
  }, []);

  useEffect(() => {
    function updateCartCount() {
      try {
        const savedCart = window.localStorage.getItem(
          CART_STORAGE_KEY,
        );
        const items: CartItem[] = savedCart
          ? JSON.parse(savedCart)
          : [];

        setCartCount(
          items.reduce(
            (total, item) =>
              total + Number(item.quantity || 0),
            0,
          ),
        );
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener(
      "epcraft-cart-updated",
      updateCartCount,
    );

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener(
        "epcraft-cart-updated",
        updateCartCount,
      );
    };
  }, []);

  const wishlistCount = useMemo(
    () => wishlistProducts.length,
    [wishlistProducts],
  );

  const profileInitials = useMemo(() => {
    const initials = profileName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return initials || "U";
  }, [profileName]);

  function saveWishlist(nextWishlist: WishlistProduct[]) {
    setWishlistProducts(nextWishlist);

    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(nextWishlist),
    );

    window.dispatchEvent(
      new Event("epcraft-wishlist-updated"),
    );
  }

  function removeFromWishlist(productId: string) {
    saveWishlist(
      wishlistProducts.filter(
        (product) => product.id !== productId,
      ),
    );

    setMessage("Item removed from your wishlist.");
  }

  function addToCart(product: WishlistProduct) {
    let currentCart: CartItem[] = [];

    try {
      const savedCart = window.localStorage.getItem(
        CART_STORAGE_KEY,
      );

      currentCart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
      currentCart = [];
    }

    const existingItem = currentCart.find(
      (item) => item.id === product.id,
    );

    const nextCart: CartItem[] = existingItem
      ? currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + 1,
                price: product.price,
                image: product.image,
              }
            : item,
        )
      : [
          ...currentCart,
          {
            ...product,
            details: product.description,
            quantity: 1,
          },
        ];

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(nextCart),
    );

    window.dispatchEvent(
      new Event("epcraft-cart-updated"),
    );

    setMessage(`${product.name} added to cart.`);
  }

  async function shareWishlist() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );

      setMessage("Wishlist link copied.");
    } catch {
      setMessage("Wishlist link could not be copied.");
    }
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function handleNewsletter(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const email = String(
      new FormData(event.currentTarget).get(
        "newsletterEmail",
      ) ?? "",
    ).trim();

    if (!email.includes("@")) {
      setNewsletterMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    setNewsletterMessage(
      "Thank you. You are now subscribed.",
    );
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#5a321b]">
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fbf5ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1900px] items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className="font-[Georgia,serif] text-[30px] font-semibold tracking-[-0.04em]"
          >
            EpCraft
          </Link>

          <nav className="hidden items-center gap-8 text-[16px] text-[#5d5047] lg:flex">
            <Link
              href="/shop/furniture"
              className="transition hover:text-[#5a2e14]"
            >
              Shop
            </Link>
            <Link
              href="/shop/furniture"
              className="transition hover:text-[#5a2e14]"
            >
              Collections
            </Link>
            <Link
              href="/#story"
              className="transition hover:text-[#5a2e14]"
            >
              About
            </Link>
            <Link
              href="/#story"
              className="transition hover:text-[#5a2e14]"
            >
              Journal
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden md:block"
            >
              <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#f8f1e7] px-4 py-2">
                <Icon type="search" />
                <input
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="Search crafts..."
                  className="w-40 bg-transparent text-[13px] outline-none"
                />
              </div>
            </form>

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="relative rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Cart"
            >
              <Icon type="cart" />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5a2e14] px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/account")}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#d2a45f] font-[Georgia,serif] text-[12px] font-semibold text-white"
              aria-label="Account"
            >
              {profileInitials}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1900px]">
        <aside className="hidden min-h-[1100px] w-[250px] shrink-0 flex-col border-r border-[#eadfce] bg-[#f8f0e5] px-5 py-10 md:flex">
          <nav className="space-y-3">
            {sidebarItems.map((item) => {
              const active = item.label === "Wishlist";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                      return;
                    }

                    window.alert(
                      `${item.label} page will be connected later.`,
                    );
                  }}
                  className={`flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-[15px] font-semibold transition ${
                    active
                      ? "bg-[#ccefd1] text-[#486d53]"
                      : "text-[#544943] hover:bg-[#efe5d7]"
                  }`}
                >
                  <Icon type={item.icon} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() =>
              window.alert(
                "Logout will be connected with authentication later.",
              )
            }
            className="mt-auto flex items-center gap-4 px-4 py-4 text-[15px] text-red-500"
          >
            <Icon type="logout" />
            Logout
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <section className="px-6 py-12 md:px-12">
            <div className="mx-auto max-w-[1200px]">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="font-[Georgia,serif] text-[30px]">
                    My Wishlist
                  </h1>

                  <p className="mt-3 text-[#625851]">
                    {wishlistCount} items carefully curated
                    for your space
                  </p>
                </div>

                <button
                  type="button"
                  onClick={shareWishlist}
                  className="flex w-fit items-center gap-2 border-b border-[#d2a45f] pb-2 text-[#c18c3d]"
                >
                  <Icon type="share" className="h-4 w-4" />
                  Share List
                </button>
              </div>

              {message && (
                <p className="mt-6 rounded-xl bg-white px-5 py-3 text-[14px] text-[#52745b] shadow-sm">
                  {message}
                </p>
              )}

              {!pageLoaded ? (
                <div className="mt-10 rounded-2xl bg-white px-8 py-20 text-center">
                  Loading your wishlist...
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl bg-white px-8 py-20 text-center">
                  <h2 className="font-[Georgia,serif] text-[28px]">
                    Your wishlist is empty
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/shop/furniture")
                    }
                    className="mt-7 rounded-full bg-[#5a2e14] px-8 py-3.5 text-white"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlistProducts.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(80,47,28,0.06)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ddcf]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition duration-500 hover:scale-[1.025]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFromWishlist(product.id)
                          }
                          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-red-600 shadow-md transition hover:scale-105"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <Icon
                            type="heart"
                            className="h-6 w-6"
                            filled
                          />
                        </button>
                      </div>

                      <div className="p-6">
                        <h2 className="font-[Georgia,serif] text-[20px]">
                          {product.name}
                        </h2>

                        <p className="mt-2 min-h-12 text-[15px] leading-6 text-[#81756d]">
                          {product.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="font-semibold">
                            {formatPrice(product.price)}
                          </p>

                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-2 rounded-full bg-[#d0a25d] px-5 py-3 text-[14px] text-white transition hover:bg-[#bd8c43]"
                          >
                            <Icon
                              type="bag"
                              className="h-4 w-4"
                            />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <section className="mt-16 rounded-3xl border border-[#e8d8c5] bg-[#f8f0e5] px-7 py-12 text-center md:px-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b07d33]">
                  Made Just for You
                </p>

                <h2 className="mx-auto mt-5 max-w-[660px] font-[Georgia,serif] text-[32px] font-semibold leading-tight md:text-[40px]">
                  Cannot find the exact piece you imagined?
                </h2>

                <p className="mx-auto mt-5 max-w-[720px] text-[16px] leading-7 text-[#71645b]">
                  Work with our craftspeople to create a
                  one-of-a-kind piece designed for your space,
                  material preference, and story.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      "Custom commission request form will be connected later.",
                    )
                  }
                  className="mt-8 rounded-full bg-[#5a2e14] px-8 py-4 text-[14px] font-semibold text-white transition hover:bg-[#47230e]"
                >
                  Request a Commission
                </button>
              </section>
            </div>
          </section>

          <footer
            id="footer"
            className="border-t border-[#eadfce] bg-[#f7efe4] px-6 pb-8 pt-16 md:px-12"
          >
            <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.9fr_1.3fr]">
              <div>
                <h2 className="font-[Georgia,serif] text-[38px] font-semibold">
                  EpCraft
                </h2>

                <p className="mt-5 max-w-[380px] text-[16px] leading-[1.55] text-[#675c54]">
                  Crafting the future of wood with the precision
                  of AI and the soul of the artisan.
                </p>

                <div className="mt-7 flex gap-4">
                  <a
                    href="mailto:hello@epcraft.com"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcdb8] transition hover:bg-[#f0e3d2]"
                    aria-label="Email EpCraft"
                  >
                    <Icon type="mail" />
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        window.alert("Website link copied.");
                      } catch {
                        window.alert(
                          "Website link could not be copied.",
                        );
                      }
                    }}
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcdb8] transition hover:bg-[#f0e3d2]"
                    aria-label="Share website"
                  >
                    <Icon type="share" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-[Georgia,serif] text-[21px]">
                  Explore
                </h3>
                <div className="mt-6 flex flex-col gap-3 text-[14px] text-[#625850]">
                  <Link href="/shop/furniture">
                    New Arrivals
                  </Link>
                  <Link href="/shop/furniture">
                    Best Sellers
                  </Link>
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="text-left"
                  >
                    The AI Design Lab
                  </button>
                  <Link href="/shop/furniture">
                    Wholesale
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-[Georgia,serif] text-[21px]">
                  Concierge
                </h3>
                <div className="mt-6 flex flex-col gap-3 text-[14px] text-[#625850]">
                  <a href="#footer">
                    Shipping &amp; Returns
                  </a>
                  <a href="#footer">
                    Care Instructions
                  </a>
                  <a href="mailto:hello@epcraft.com">
                    Contact Us
                  </a>
                  <a href="#footer">
                    Terms of Service
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-[Georgia,serif] text-[21px]">
                  Newsletter
                </h3>

                <p className="mt-6 text-[15px] leading-[1.55] text-[#625850]">
                  Join our inner circle for early access
                  and craftsmanship stories.
                </p>

                <form
                  onSubmit={handleNewsletter}
                  className="mt-6"
                >
                  <input
                    type="email"
                    name="newsletterEmail"
                    placeholder="Email Address"
                    className="w-full rounded-full border border-[#e7dbcc] bg-white px-6 py-3.5 outline-none focus:border-[#6b4328]"
                  />

                  <button
                    type="submit"
                    className="mt-3 w-full rounded-full bg-[#5a2e14] px-6 py-3.5 text-white transition hover:bg-[#47230e]"
                  >
                    Subscribe
                  </button>

                  {newsletterMessage && (
                    <p className="mt-3 text-[13px] text-[#6d5c50]">
                      {newsletterMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>

            <div className="mx-auto mt-16 flex max-w-[1200px] flex-col gap-4 border-t border-[#eadfce] pt-6 text-[12px] text-[#665b53] md:flex-row md:items-center md:justify-between">
              <p>
                © 2026 EpCraft Handcrafted Wood. All rights
                reserved.
              </p>

              <div className="flex gap-7">
                <a href="#footer">
                  Privacy Policy
                </a>
                <a href="#footer">
                  Terms of Use
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-7 right-7 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#5a2e14] text-white shadow-xl"
          aria-label="Open AI Stylist"
        >
          <Icon type="sparkle" className="h-7 w-7" />
        </button>
      )}

      {chatOpen && (
        <section className="fixed bottom-6 right-6 z-[70] flex h-[500px] w-[calc(100%-48px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-[#e3d4c3] bg-[#fbf5ec] shadow-2xl">
          <div className="flex items-center justify-between bg-[#5a2e14] px-5 py-4 text-white">
            <div>
              <p className="font-[Georgia,serif] text-[20px]">
                EpCraft AI Stylist
              </p>
              <p className="text-[11px] text-white/70">
                Handcrafted product assistant
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-full px-3 py-1 text-2xl hover:bg-white/10"
              aria-label="Close AI Stylist"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-[14px] leading-relaxed text-[#51463f]">
              Ask me how to style your saved pieces together
              or choose the right materials.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
            <input
              placeholder="Ask about your wishlist..."
              className="min-w-0 flex-1 rounded-full bg-[#f4ece2] px-4 py-3 text-[14px] outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-[#5a2e14] px-5 py-3 text-[14px] text-white"
            >
              Send
            </button>
          </div>
        </section>
      )}
    </main>
  );
}