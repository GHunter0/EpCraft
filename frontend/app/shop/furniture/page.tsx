"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Product = {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  category: string;
  woodType: string;
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    slug: "modern-heirloom-dining-table",
    name: "Modern Heirloom Dining Table",
    subtitle: "Premium American Walnut",
    price: 3250,
    priceLabel: "Rs. 3,250.00",
    category: "Furniture",
    woodType: "Walnut",
    image: "/epcraft/furniture/modern-heirloom-dining-table.jpg",
  },
  {
    id: 2,
    slug: "minimalist-oak-floating-shelf",
    name: "Minimalist Oak Floating Shelf",
    subtitle: "Natural Matte Finish",
    price: 4200,
    priceLabel: "Rs. 4,200.00",
    category: "Furniture",
    woodType: "Oak",
    image: "/epcraft/furniture/minimalist-oak-floating-shelf.jpg",
  },
  {
    id: 3,
    slug: "sculptural-teak-serving-bowl",
    name: "Sculptural Teak Serving Bowl",
    subtitle: "Artisanal Hand-Turned",
    price: 1850,
    priceLabel: "Rs. 1,850.00",
    category: "Kitchenware",
    woodType: "Teak",
    image: "/epcraft/furniture/sculptural-teak-serving-bowl.jpg",
  },
  {
    id: 4,
    slug: "nordic-mango-nightstand",
    name: "Nordic Mango Nightstand",
    subtitle: "Honey Gold Finish",
    price: 6800,
    priceLabel: "Rs. 6,800.00",
    category: "Furniture",
    woodType: "Mango",
    image: "/epcraft/furniture/nordic-mango-nightstand.jpg",
  },
  {
    id: 5,
    slug: "artisan-serving-platter",
    name: "Artisan Serving Platter",
    subtitle: "Live Edge White Oak",
    price: 1200,
    priceLabel: "Rs. 1,200.00",
    category: "Kitchenware",
    woodType: "Oak",
    image: "/epcraft/furniture/artisan-serving-platter.jpg",
  },
  {
    id: 6,
    slug: "executive-desk-set",
    name: "Executive Desk Set",
    subtitle: "Black Walnut Collection",
    price: 2950,
    priceLabel: "Rs. 2,950.00",
    category: "Custom Gifts",
    woodType: "Walnut",
    image: "/epcraft/furniture/executive-desk-set.jpg",
  },
];

const categoryOptions = ["Furniture", "Decor", "Kitchenware", "Custom Gifts"];
const woodOptions = ["Oak", "Walnut", "Teak", "Mango"];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M3 4h2l2.2 10a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.4L21 7H6" />
      <circle cx="9.5" cy="20" r="1" />
      <circle cx="17.5" cy="20" r="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6 19c.8-3.6 2.8-5.4 6-5.4s5.2 1.8 6 5.4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M20.8 4.8a5.3 5.3 0 0 0-7.5 0L12 6.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2c.8 3.9 2.6 5.7 6.5 6.5-3.9.8-5.7 2.6-6.5 6.5-.8-3.9-2.6-5.7-6.5-6.5C9.4 7.7 11.2 5.9 12 2Z" />
      <path d="M19 13c.4 2 1.3 2.9 3.3 3.3-2 .4-2.9 1.3-3.3 3.3-.4-2-1.3-2.9-3.3-3.3 2-.4 2.9-1.3 3.3-3.3Z" />
    </svg>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#5f554d]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#6a3a1c]"
      />
      <span>{label}</span>
    </label>
  );
}

export default function FurniturePage() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Furniture"]);
  const [selectedWoods, setSelectedWoods] = useState<string[]>(["Walnut"]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [maximumPrice, setMaximumPrice] = useState(8500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("best");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<number[]>([3]);
  const [chatOpen, setChatOpen] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  function toggleValue(
    value: string,
    values: string[],
    setter: (nextValues: string[]) => void,
  ) {
    setFiltersActive(true);
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatches =
        !filtersActive ||
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const woodMatches =
        !filtersActive ||
        selectedWoods.length === 0 ||
        selectedWoods.includes(product.woodType);

      return categoryMatches && woodMatches && product.price <= maximumPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.id - b.id;
    });
  }, [selectedCategories, selectedWoods, filtersActive, maximumPrice, sortBy]);

  function toggleWishlist(productId: number) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
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
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fbf5ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1900px] items-center justify-between px-6 md:px-12 lg:px-16">
          <Link
            href="/"
            className="font-[Georgia,serif] text-[34px] font-semibold tracking-[-0.04em] text-[#5a2e14]"
          >
            EpCraft
          </Link>

          <nav className="hidden items-center gap-12 text-[18px] lg:flex">
            <Link
              href="/shop/furniture"
              className={`border-b-2 pb-2 transition hover:text-[#5a2e14] ${
                !chatOpen
                  ? "border-[#6b4328] font-medium text-[#5a2e14]"
                  : "border-transparent text-[#5d5047]"
              }`}
            >
              Shop
            </Link>

            <Link
              href="/#categories"
              className="border-b-2 border-transparent pb-2 text-[#5d5047] transition hover:text-[#5a2e14]"
            >
              Custom Orders
            </Link>

            <Link
              href="/#story"
              className="border-b-2 border-transparent pb-2 text-[#5d5047] transition hover:text-[#5a2e14]"
            >
              Our Story
            </Link>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className={`border-b-2 bg-transparent pb-2 transition hover:text-[#5a2e14] ${
                chatOpen
                  ? "border-[#6b4328] font-medium text-[#5a2e14]"
                  : "border-transparent text-[#5d5047]"
              }`}
            >
              AI Stylist
            </button>
          </nav>

          <div className="relative flex items-center gap-3 md:gap-5">
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-28 top-1/2 hidden w-64 -translate-y-1/2 md:block"
              >
                <input
                  autoFocus
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-full border border-[#dac7b2] bg-white px-5 py-2.5 text-sm outline-none focus:border-[#5a2e14]"
                />
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                if (searchOpen && searchText.trim()) {
                  router.push(
                    `/search?q=${encodeURIComponent(searchText.trim())}`,
                  );
                  return;
                }

                setSearchOpen((value) => !value);
              }}
              className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
                type="button"
                onClick={() => router.push("/cart")}
                className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
                aria-label="Cart"
            >
                <CartIcon />
            </button>

            <button
              type="button"
              onClick={() => router.push("/account")}
              className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Account"
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

      <section className="px-6 pb-24 pt-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex items-center gap-2 text-[12px] text-[#7a6b5f]">
            <Link href="/" className="hover:text-[#5a2e14]">Home</Link>
            <span>›</span>
            <span>Shop</span>
            <span>›</span>
            <span className="font-medium text-[#5a2e14]">Furniture</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] xl:gap-14">
            <aside>
              <details className="rounded-xl border border-[#e6d8c8] bg-white p-5 lg:hidden">
                <summary className="cursor-pointer font-[Georgia,serif] text-[18px]">
                  Filters
                </summary>
                <div className="mt-6">
                  <Filters
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    selectedWoods={selectedWoods}
                    setSelectedWoods={setSelectedWoods}
                    maximumPrice={maximumPrice}
                    setMaximumPrice={setMaximumPrice}
                    inStockOnly={inStockOnly}
                    setInStockOnly={setInStockOnly}
                    toggleValue={toggleValue}
                  />
                </div>
              </details>

              <div className="hidden lg:block">
                <Filters
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedWoods={selectedWoods}
                  setSelectedWoods={setSelectedWoods}
                  maximumPrice={maximumPrice}
                  setMaximumPrice={setMaximumPrice}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  toggleValue={toggleValue}
                />
              </div>
            </aside>

            <div>
              <div className="mb-7 flex flex-col gap-5 border-b border-[#6b4328] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-[Georgia,serif] text-[34px] font-semibold leading-tight">
                    124 Products Found
                  </h1>
                  <p className="mt-1 text-[14px] text-[#71645b]">
                    Expertly curated furniture for your modern home.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 min-w-[185px] rounded-full border border-[#dfd2c3] bg-white px-5 text-[14px] text-[#4f443c] outline-none"
                  >
                    <option value="best">Best Selling</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  <div className="flex overflow-hidden rounded-full border border-[#dfd2c3] bg-white">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`grid h-11 w-11 place-items-center ${
                        viewMode === "grid" ? "bg-[#6b4328] text-white" : "text-[#6b4328]"
                      }`}
                      aria-label="Grid view"
                    >
                      <GridIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`grid h-11 w-11 place-items-center ${
                        viewMode === "list" ? "bg-[#6b4328] text-white" : "text-[#6b4328]"
                      }`}
                      aria-label="List view"
                    >
                      <ListIcon />
                    </button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-[#eadfce] bg-white px-6 py-20 text-center">
                  <h2 className="font-[Georgia,serif] text-[27px]">No matching products</h2>
                  <p className="mt-3 text-[#71655c]">Change one of the filters to show products.</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid gap-5"
                  }
                >
                  {filteredProducts.map((product) => {
                    const saved = wishlist.includes(product.id);

                    return (
                      <article
                        key={product.id}
                        className={
                          viewMode === "grid"
                            ? "group overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(72,42,20,0.08)]"
                            : "group grid overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(72,42,20,0.08)] sm:grid-cols-[280px_1fr]"
                        }
                      >
                        <div
                          className={
                            viewMode === "grid"
                              ? "relative aspect-[4/5] overflow-hidden bg-[#e9ddce]"
                              : "relative min-h-[290px] overflow-hidden bg-[#e9ddce]"
                          }
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="absolute inset-0 z-10 block"
                            aria-label={`View ${product.name}`}
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              quality={95}
                              sizes={
                                viewMode === "grid"
                                  ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                  : "280px"
                              }
                              className="object-cover transition duration-500 group-hover:scale-[1.025]"
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.id)}
                            className={`absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow-md ${
                              saved ? "text-[#c3312f]" : "text-[#6a4a36] hover:text-[#c3312f]"
                            }`}
                            aria-label={`Save ${product.name}`}
                          >
                            <HeartIcon filled={saved} />
                          </button>
                        </div>

                        <div
                          className={
                            viewMode === "grid"
                              ? "px-5 py-6 text-center"
                              : "flex flex-col justify-center px-8 py-7"
                          }
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="block"
                          >
                            <h2 className="font-[Georgia,serif] text-[18px]">
                              {product.name}
                            </h2>
                            <p className="mt-2 text-[15px] text-[#5f554d]">
                              {product.subtitle}
                            </p>
                            <p className="mt-4 font-[Georgia,serif] text-[16px]">
                              {product.priceLabel}
                            </p>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-14 text-center">
                <button
                  type="button"
                  className="rounded-full border border-[#6b4328] px-12 py-3.5 text-[14px] font-medium text-[#6b4328] transition hover:bg-[#6b4328] hover:text-white"
                >
                  Load More Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-[#eadfce] px-6 pb-8 pt-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-[1840px] gap-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.75fr_0.8fr_1.3fr]">
          <div>
            <h2 className="font-[Georgia,serif] text-[48px] font-semibold tracking-[-0.04em]">EpCraft</h2>
            <p className="mt-6 max-w-[440px] text-[18px] leading-[1.55] text-[#675c54]">
              Crafting the future of wood with the precision of AI and the soul of the artisan.
            </p>
            <div className="mt-8 flex gap-5">
              <a
                href="mailto:hello@epcraft.com"
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8] hover:bg-[#f0e3d2]"
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
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8] hover:bg-[#f0e3d2]"
                aria-label="Share"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Explore</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <Link href="/shop/furniture" className="hover:text-[#5a2e14]">New Arrivals</Link>
              <Link href="/shop/furniture" className="hover:text-[#5a2e14]">Best Sellers</Link>
              <button type="button" onClick={() => setChatOpen(true)} className="text-left hover:text-[#5a2e14]">
                The AI Design Lab
              </button>
              <Link href="/shop/furniture" className="hover:text-[#5a2e14]">Wholesale</Link>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Concierge</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <a href="#footer" className="hover:text-[#5a2e14]">Shipping &amp; Returns</a>
              <a href="#footer" className="hover:text-[#5a2e14]">Care Instructions</a>
              <a href="mailto:hello@epcraft.com" className="hover:text-[#5a2e14]">Contact Us</a>
              <a href="#footer" className="hover:text-[#5a2e14]">Terms of Service</a>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Newsletter</h3>
            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-[#625850]">
              Join our inner circle for early access and craftsmanship stories.
            </p>
            <form onSubmit={handleNewsletter} className="mt-8">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-[#e7dbcc] bg-white px-7 py-4 text-[#51463e] outline-none"
              />
              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-[#5a2e14] px-7 py-4 text-[18px] text-white hover:bg-[#47230e]"
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

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-7 right-7 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#5a2e14] text-white shadow-xl"
          aria-label="Open AI Stylist"
        >
          <SparkleIcon />
        </button>
      )}

      {chatOpen && (
        <section className="fixed bottom-6 right-6 z-[70] flex h-[500px] w-[calc(100%-48px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-[#e3d4c3] bg-[#fbf5ec] shadow-2xl">
          <div className="flex items-center justify-between bg-[#5a2e14] px-5 py-4 text-white">
            <div>
              <p className="font-[Georgia,serif] text-[20px]">EpCraft AI Stylist</p>
              <p className="text-[11px] text-white/70">Handcrafted product assistant</p>
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
              Hi! Tell me what kind of wooden furniture you are looking for.
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
    </main>
  );
}

type FiltersProps = {
  selectedCategories: string[];
  setSelectedCategories: (values: string[]) => void;
  selectedWoods: string[];
  setSelectedWoods: (values: string[]) => void;
  maximumPrice: number;
  setMaximumPrice: (value: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  toggleValue: (
    value: string,
    values: string[],
    setter: (nextValues: string[]) => void,
  ) => void;
};

function Filters({
  selectedCategories,
  setSelectedCategories,
  selectedWoods,
  setSelectedWoods,
  maximumPrice,
  setMaximumPrice,
  inStockOnly,
  setInStockOnly,
  toggleValue,
}: FiltersProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="border-b border-[#6b4328] pb-2 font-[Georgia,serif] text-[17px]">Category</h2>
        <div className="mt-4 space-y-3">
          {categoryOptions.map((category) => (
            <CheckboxRow
              key={category}
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => toggleValue(category, selectedCategories, setSelectedCategories)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="border-b border-[#6b4328] pb-2 font-[Georgia,serif] text-[17px]">Price Range</h2>
        <input
          type="range"
          min="0"
          max="8500"
          step="100"
          value={maximumPrice}
          onChange={(event) => setMaximumPrice(Number(event.target.value))}
          className="mt-5 w-full accent-[#6b4328]"
        />
        <div className="mt-2 flex justify-between text-[13px] text-[#6f6258]">
          <span>Rs. 0</span>
          <span>Rs. {maximumPrice.toLocaleString()}+</span>
        </div>
      </div>

      <div>
        <h2 className="border-b border-[#6b4328] pb-2 font-[Georgia,serif] text-[17px]">Wood Type</h2>
        <div className="mt-4 space-y-3">
          {woodOptions.map((wood) => (
            <CheckboxRow
              key={wood}
              label={wood}
              checked={selectedWoods.includes(wood)}
              onChange={() => toggleValue(wood, selectedWoods, setSelectedWoods)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="border-b border-[#6b4328] pb-2 font-[Georgia,serif] text-[17px]">Finish</h2>
        <div className="mt-4 flex gap-2">
          <button type="button" className="h-9 w-9 rounded-full border-2 border-white bg-[#e7d6bd] shadow" aria-label="Natural finish" />
          <button type="button" className="h-9 w-9 rounded-full border-2 border-white bg-[#5a3928] shadow" aria-label="Dark finish" />
          <button type="button" className="h-9 w-9 rounded-full border-2 border-white bg-[#cb8a12] shadow" aria-label="Honey finish" />
          <button type="button" className="h-9 w-9 rounded-full border-2 border-white bg-[#646464] shadow" aria-label="Smoke finish" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-[Georgia,serif] text-[16px]">In Stock Only</span>
        <button
          type="button"
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`relative h-6 w-11 rounded-full transition ${
            inStockOnly ? "bg-[#6b4328]" : "bg-[#d8cdbf]"
          }`}
          aria-pressed={inStockOnly}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              inStockOnly ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}