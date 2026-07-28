"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  maker: string;
  price: string;
  image: string;
};
type NavItem = "Shop" | "Custom Orders" | "Our Story" | "AI Stylist";
const categories = [
  { name: "Furniture", image: "/epcraft/category-furniture.png" },
  { name: "Decor", image: "/epcraft/category-decor.png" },
  { name: "Kitchenware", image: "/epcraft/category-kitchenware.png" },
  { name: "Custom Gifts", image: "/epcraft/category-custom-gifts.png" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Walnut Dining Table",
    maker: "Elias",
    price: "Rs. 52,400",
    image: "/epcraft/walnut-dining-table.jpg",
  },
  {
    id: 2,
    name: "Oak Serving Board",
    maker: "Sarah",
    price: "Rs. 3,120",
    image: "/epcraft/oak-serving-board.jpg",
  },
  {
    id: 3,
    name: "Cedar Wall Art",
    maker: "Marco",
    price: "Rs. 9,850",
    image: "/epcraft/cedar-wall-art.jpg",
  },
  {
    id: 4,
    name: "Cherry Nightstand",
    maker: "Anna",
    price: "Rs. 11,200",
    image: "/epcraft/cherry-nightstand.jpg",
  },
  {
    id: 5,
    name: "Maple Bowl Set",
    maker: "Theo",
    price: "Rs. 2,320",
    image: "/epcraft/maple-bowl-set.jpg",
  },
  {
    id: 6,
    name: "Ash Floating Shelf",
    maker: "Sofia",
    price: "Rs. 4,450",
    image: "/epcraft/ash-floating-shelf.jpg",
  },
  {
    id: 7,
    name: "Ebony Valet Tray",
    maker: "Lucas",
    price: "Rs. 5,880",
    image: "/epcraft/ebony-valet-tray.jpg",
  },
  {
    id: 8,
    name: "Organic Desk Chair",
    maker: "Julian",
    price: "Rs. 7,180",
    image: "/epcraft/organic-desk-chair.jpg",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <path d="M3 4h2l2.2 10a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.4L21 7H6" />
      <circle cx="9.5" cy="20" r="1" />
      <circle cx="17.5" cy="20" r="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6 19c.8-3.6 2.8-5.4 6-5.4s5.2 1.8 6 5.4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20.8 4.8a5.3 5.3 0 0 0-7.5 0L12 6.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2c.8 3.9 2.6 5.7 6.5 6.5-3.9.8-5.7 2.6-6.5 6.5-.8-3.9-2.6-5.7-6.5-6.5C9.4 7.7 11.2 5.9 12 2Z" />
      <path d="M19 13c.4 2 1.3 2.9 3.3 3.3-2 .4-2.9 1.3-3.3 3.3-.4-2-1.3-2.9-3.3-3.3 2-.4 2.9-1.3 3.3-3.3Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="19" r="2.2" />
      <path d="m8 11 7.8-4.7M8 13l7.8 4.7" />
    </svg>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>("Shop");
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const savedProducts = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [wishlist],
  );

  function toggleWishlist(productId: number) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function scrollToProducts() {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
  function navClass(item: NavItem) {
    return `border-b-2 bg-transparent pb-2 transition hover:text-[#5a2e14] ${
      activeNav === item
        ? "border-[#6b4328] text-[#5a2e14]"
        : "border-transparent text-[#5d5047]"
    }`;
  }

  function goToSection(item: NavItem, sectionId: string) {
    setActiveNav(item);

    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email.includes("@")) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }

    setNewsletterMessage("Thank you. You are now subscribed.");
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#5a321b]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fbf5ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1900px] items-center justify-between px-6 md:px-12 lg:px-16">
          <a
            href="#top"
            className="font-[Georgia,serif] text-[34px] font-semibold tracking-[-0.04em] text-[#5a2e14]"
          >
            EpCraft
          </a>

          <nav className="hidden items-center gap-12 text-[18px] lg:flex">
            <Link
              href="/shop/furniture"
              className={navClass("Shop")}
            >
              Shop
            </Link>

            <button
              type="button"
              onClick={() => goToSection("Custom Orders", "categories")}
              className={navClass("Custom Orders")}
            >
              Custom Orders
            </button>

            <button
              type="button"
              onClick={() => goToSection("Our Story", "story")}
              className={navClass("Our Story")}
            >
              Our Story
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav("AI Stylist");
                setChatOpen(true);
              }}
              className={navClass("AI Stylist")}
            >
              AI Stylist
            </button>
          </nav>

          <div className="relative flex items-center gap-3 md:gap-5">
            {searchOpen && (
              <input
                autoFocus
                placeholder="Search products"
                className="absolute right-28 top-1/2 hidden w-56 -translate-y-1/2 rounded-full border border-[#dac7b2] bg-white px-4 py-2 text-sm outline-none focus:border-[#5a2e14] md:block"
              />
            )}

            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              className="relative rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Wishlist"
            >
              <CartIcon />
              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5a2e14] px-1 text-[10px] text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.alert("Account page will be connected later.")}
              className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Account"
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative h-[520px] overflow-hidden sm:h-[clamp(540px,61vw,760px)]"
      >
        <Image
          src="/epcraft/hero.png"
          alt="Woodworker creating handcrafted wooden furniture"
          fill
          priority
          sizes="100vw"
          className="scale-[1.025] object-cover object-center blur-[1.35px]"
        />

        {/* Dark overlays keep the image soft while text/buttons remain sharp */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center px-[4%]">
          <div className="max-w-[610px] -translate-y-[2%] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
            <h1 className="font-[Georgia,serif] text-[clamp(36px,3vw,58px)] font-normal leading-[1.08] tracking-[-0.02em]">
              Handcrafted Wood,
              <br />
              Made For You
            </h1>

            <p className="mt-6 max-w-[600px] text-[clamp(15px,1.1vw,18px)] leading-7 text-white/95">
              Artisanal furniture and decor crafted with soul and precision,
              bridging traditional techniques with modern intelligence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={scrollToProducts}
                className="rounded-full bg-[#d9a653] px-8 py-4 text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c99443]"
              >
                Shop Collection
              </button>

              <button
                type="button"
                onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full border-2 border-white bg-black/5 px-8 py-[14px] text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[1px] transition hover:bg-white hover:text-[#5a2e14]"
              >
                Meet Our Craftsmen
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="scroll-mt-24 px-6 py-20 md:px-12 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto mb-14 flex max-w-[620px] items-center gap-5">
            <div className="h-px flex-1 bg-[#d5aa5b]" />
            <h2 className="font-[Georgia,serif] text-[18px]">Shop by Category</h2>
            <div className="h-px flex-1 bg-[#d5aa5b]" />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:gap-x-16">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={
                  category.name === "Furniture"
                    ? "/shop/furniture"
                    : "#products"
                }
                className="group flex flex-col items-center"
              >
                <div className="relative aspect-square w-full max-w-[205px] overflow-hidden rounded-full shadow-[0_14px_30px_rgba(72,42,20,0.14)] transition duration-300 group-hover:-translate-y-1">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 42vw, 205px"
                    className="object-cover"
                  />
                </div>
                <span className="mt-5 font-[Georgia,serif] text-[17px]">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="scroll-mt-24 px-6 pb-24 pt-16 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <h2 className="font-[Georgia,serif] text-[25px]">Featured Products</h2>
              <p className="mt-2 text-[14px] text-[#71655c]">Tactile pieces for a modern home.</p>
            </div>

            <Link
              href="/shop/furniture"
              className="text-[14px] font-semibold text-[#bd8128] transition hover:text-[#8f5d17]"
            >
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {products.map((product) => {
              const saved = wishlist.includes(product.id);

              return (
                <article key={product.id} className="group text-center">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#e9ddce]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 47vw, (max-width: 1024px) 31vw, 23vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.035]"
                    />

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow ${
                        saved ? "text-[#8e3b2c]" : "text-[#6a4a36] hover:text-[#8e3b2c]"
                      }`}
                      aria-label={`Save ${product.name}`}
                    >
                      <HeartIcon filled={saved} />
                    </button>
                  </div>

                  <span className="mt-4 inline-block rounded-full bg-white px-4 py-1 text-[9px] uppercase tracking-[0.17em] text-[#6c6058]">
                    Handmade by {product.maker}
                  </span>

                  <h3 className="mt-3 font-[Georgia,serif] text-[17px]">{product.name}</h3>
                  <p className="mt-1 text-[14px] font-semibold text-[#b7771d]">{product.price}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section id="story" className="scroll-mt-24 bg-[#f8f0e5] px-6 py-24 text-center">
        <div className="mx-auto max-w-[850px]">
          <div className="text-[20px] tracking-[0.17em] text-[#c6923e]">★★★★★</div>

          <blockquote className="mt-8 font-[Georgia,serif] text-[23px] italic leading-[1.55] text-[#6c3b24] sm:text-[28px]">
            “The Walnut Dining Table is not just furniture; it’s the heart of our
            home. You can feel the artisan’s touch in every grain. The AI Stylist
            helped us pick the perfect dimensions for our space.”
          </blockquote>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#d8c5b2]">
              <Image
                src="/epcraft/eleanor-rigby.png"
                alt="Eleanor Rigby"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="text-left text-[13px] text-[#62574f]">
              <p className="font-medium text-[#43382f]">Eleanor Rigby</p>
              <p>London, UK</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="border-t border-[#eadfce] px-6 pb-8 pt-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-[1840px] gap-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.75fr_0.8fr_1.3fr]">
          <div>
            <h2 className="font-[Georgia,serif] text-[48px] font-semibold tracking-[-0.04em] text-[#5a2e14]">
              EpCraft
            </h2>
            <p className="mt-6 max-w-[440px] text-[18px] leading-[1.55] text-[#675c54]">
              Crafting the future of wood with the precision of AI and the soul
              of the artisan.
            </p>

            <div className="mt-8 flex gap-5">
              <a
                href="mailto:hello@epcraft.com"
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8] transition hover:bg-[#f0e3d2]"
                aria-label="Email"
              >
                <MailIcon />
              </a>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  window.alert("Website link copied.");
                }}
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8] transition hover:bg-[#f0e3d2]"
                aria-label="Share"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px] text-[#5a2e14]">Explore</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <a href="#products" className="hover:text-[#5a2e14]">New Arrivals</a>
              <a href="#products" className="hover:text-[#5a2e14]">Best Sellers</a>
              <button type="button" onClick={() => setChatOpen(true)} className="text-left hover:text-[#5a2e14]">
                The AI Design Lab
              </button>
              <a href="#products" className="hover:text-[#5a2e14]">Wholesale</a>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px] text-[#5a2e14]">Concierge</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <a href="#footer" className="hover:text-[#5a2e14]">Shipping &amp; Returns</a>
              <a href="#footer" className="hover:text-[#5a2e14]">Care Instructions</a>
              <a href="mailto:hello@epcraft.com" className="hover:text-[#5a2e14]">Contact Us</a>
              <a href="#footer" className="hover:text-[#5a2e14]">Terms of Service</a>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px] text-[#5a2e14]">Newsletter</h3>
            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-[#625850]">
              Join our inner circle for early access and craftsmanship stories.
            </p>

            <form onSubmit={handleNewsletter} className="mt-8">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-[#e7dbcc] bg-white px-7 py-4 text-[#51463e] outline-none focus:border-[#5a2e14]"
              />
              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-[#5a2e14] px-7 py-4 text-[18px] text-white transition hover:bg-[#47230e]"
              >
                Subscribe
              </button>
              {newsletterMessage && (
                <p className="mt-3 text-[14px] text-[#6d5c50]">{newsletterMessage}</p>
              )}
            </form>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-[1840px] flex-col gap-5 border-t border-[#eadfce] pt-7 text-[14px] text-[#665b53] md:flex-row md:items-center md:justify-between">
          <p>© 2026 EpCraft Handcrafted Wood. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#footer" className="hover:text-[#5a2e14]">Privacy Policy</a>
            <a href="#footer" className="hover:text-[#5a2e14]">Terms of Use</a>
          </div>
        </div>
      </footer>

      {/* AI BUTTON */}
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-7 right-7 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#5a2e14] text-white shadow-xl transition hover:scale-105"
          aria-label="Open AI Stylist"
        >
          <SparkleIcon />
        </button>
      )}

      {/* CHAT */}
      {chatOpen && (
        <section className="fixed bottom-6 right-6 z-[70] flex h-[500px] w-[calc(100%-48px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-[#e3d4c3] bg-[#fbf5ec] shadow-2xl">
          <div className="flex items-center justify-between bg-[#5a2e14] px-5 py-4 text-white">
            <div>
              <p className="font-[Georgia,serif] text-[20px]">EpCraft AI Stylist</p>
              <p className="text-[11px] text-white/70">Handcrafted product assistant</p>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} className="rounded-full px-3 py-1 text-2xl hover:bg-white/10">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-[14px] leading-relaxed text-[#51463f]">
              Hi! Tell me what kind of wooden product you are looking for.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
            <input
              placeholder="Ask about a product..."
              className="min-w-0 flex-1 rounded-full bg-[#f4ece2] px-4 py-3 text-[14px] outline-none"
            />
            <button type="button" className="rounded-full bg-[#5a2e14] px-5 py-3 text-[14px] text-white">
              Send
            </button>
          </div>
        </section>
      )}

      {/* WISHLIST */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/40">
          <button
            type="button"
            onClick={() => setWishlistOpen(false)}
            className="absolute inset-0"
            aria-label="Close wishlist"
          />

          <aside className="relative h-full w-full max-w-[430px] bg-[#fbf5ec] p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-[Georgia,serif] text-[30px] text-[#5a2e14]">Your Wishlist</h2>
              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                className="rounded-full px-3 py-1 text-2xl hover:bg-[#efe3d4]"
              >
                ×
              </button>
            </div>

            {savedProducts.length === 0 ? (
              <p className="mt-10 text-[#6a5c52]">
                Your wishlist is empty. Press a heart button to save a product.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                {savedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-2xl bg-white p-3">
                    <div className="relative h-20 w-16 overflow-hidden rounded-lg">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-[Georgia,serif] text-[17px]">{product.name}</p>
                      <p className="text-[14px] text-[#b5751d]">{product.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 text-[#8b3f2b]"
                    >
                      <HeartIcon filled />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}