"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image: string;
};

type Recommendation = {
  id: string;
  slug: string;
  name: string;
  details: string;
  price: number;
  image: string;
};

const CART_STORAGE_KEY = "epcraft-cart";

const recommendations: Recommendation[] = [
  {
    id: "curated-dining-chairs",
    slug: "curated-dining-chairs",
    name: "Curated Dining Chairs",
    details: "Solid walnut dining chair",
    price: 1850,
    image: "/epcraft/product-detail/curated-dining-chairs.jpg",
  },
  {
    id: "organic-form-bowl",
    slug: "organic-form-bowl",
    name: "Organic Form Bowl",
    details: "Hand-turned hardwood bowl",
    price: 125,
    image: "/epcraft/product-detail/organic-form-bowl.jpg",
  },
  {
    id: "minimalist-brass-shelf",
    slug: "minimalist-brass-shelf",
    name: "Minimalist Brass Shelf",
    details: "Wood and brass wall shelf",
    price: 340,
    image: "/epcraft/cart/minimalist-brass-shelf.jpg",
  },
];

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
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
      className="h-6 w-6"
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
      className="h-6 w-6"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6 19c.8-3.6 2.8-5.4 6-5.4s5.2 1.8 6 5.4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m7 7 1 13h8l1-13" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function BagPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
      <path d="M12 11v5M9.5 13.5h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M12 3 19 6v5c0 4.7-2.6 8-7 10-4.4-2-7-5.3-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
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

export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] =useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] =useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
useEffect(() => {
  try {
    const saved =
      window.localStorage.getItem(CART_STORAGE_KEY);

    const storedItems: CartItem[] = saved
      ? JSON.parse(saved)
      : [];

    setCartItems(storedItems);
  } catch {
    setCartItems([]);
  } finally {
    setCartLoaded(true);
  }
}, []);

useEffect(() => {
  if (!cartLoaded) {
    return;
  }

  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(cartItems),
  );

  window.dispatchEvent(
    new Event("epcraft-cart-updated"),
  );
}, [cartItems, cartLoaded]);
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  const shipping = cartItems.length > 0 ? 120 : 0;
  const tax = subtotal * 0.08;
  const discount = subtotal * discountRate;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0,
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function changeQuantity(itemId: string, amount: number) {
    setCartItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + amount),
            }
          : item,
      ),
    );
  }

  function removeItem(itemId: string) {
    setCartItems((current) =>
      current.filter((item) => item.id !== itemId),
    );
  }

  function addRecommendation(product: Recommendation) {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          details: product.details,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  }

  function applyDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = discountCode.trim().toUpperCase();

    if (code === "EPCRAFT10") {
      setDiscountRate(0.1);
      setDiscountMessage("EPCRAFT10 applied: 10% discount.");
      return;
    }

    if (code === "WELCOME5") {
      setDiscountRate(0.05);
      setDiscountMessage("WELCOME5 applied: 5% discount.");
      return;
    }

    setDiscountRate(0);
    setDiscountMessage(
      code
        ? "This discount code is not valid."
        : "Enter a discount code.",
    );
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
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
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
                    `/search?q=${encodeURIComponent(
                      searchText.trim(),
                    )}`,
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
              className="relative rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Cart"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5a2e14] px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
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

      <section className="px-6 pb-24 pt-14 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <h1 className="font-[Georgia,serif] text-[42px] font-semibold leading-tight md:text-[54px]">
            Your Selection
          </h1>

          <div className="mt-12 grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div>
              {!cartLoaded ? (
                <div className="rounded-3xl border border-[#eadfce] bg-white px-8 py-20 text-center">
                    <p className="text-[#71645b]">
                        Loading your selection...
                    </p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="rounded-3xl border border-[#eadfce] bg-white px-8 py-20 text-center">
                  <h2 className="font-[Georgia,serif] text-[30px]">
                    Your cart is empty
                  </h2>
                  <p className="mt-4 text-[#71645b]">
                    Explore our handcrafted collection and add a piece
                    you love.
                  </p>
                  <Link
                    href="/shop/furniture"
                    className="mt-8 inline-block rounded-full bg-[#5a2e14] px-8 py-3.5 text-white"
                  >
                    Explore the Shop
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#e5d8ca]">
                  {cartItems.map((item) => (
                    <article
                      key={item.id}
                      className="grid gap-6 py-8 first:pt-0 md:grid-cols-[190px_minmax(0,1fr)_auto]"
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative aspect-square overflow-hidden rounded-xl bg-[#e8ddcf]"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="190px"
                          className="object-cover"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <Link href={`/products/${item.slug}`}>
                              <h2 className="font-[Georgia,serif] text-[24px] leading-tight hover:underline">
                                {item.name}
                              </h2>
                            </Link>
                            <p className="mt-2 text-[15px] text-[#675c54]">
                              {item.details}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-2 text-[#6b4a36] transition hover:bg-[#f0e5d8] hover:text-[#b43c32]"
                            aria-label={`Remove ${item.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <div className="mt-auto pt-7">
                          <div className="inline-flex h-11 items-center rounded-full border border-[#e1d3c5] bg-white px-2 shadow-sm">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item.id, -1)
                              }
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f5eee6]"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              −
                            </button>
                            <span className="min-w-9 text-center text-[15px]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item.id, 1)
                              }
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f5eee6]"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-end md:min-w-[155px]">
                        <p className="font-[Georgia,serif] text-[24px] font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <section className="mt-20">
                <div className="flex items-center justify-between gap-5">
                  <h2 className="font-[Georgia,serif] text-[32px]">
                    <span className="mr-2 text-[#b88227]">✦</span>
                    Complete the Look
                  </h2>

                  <div className="hidden gap-2 sm:flex">
                    <button
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-full border border-[#ddcbb9] bg-white text-xl"
                      aria-label="Previous recommendations"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-full border border-[#ddcbb9] bg-white text-xl"
                      aria-label="Next recommendations"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((product) => (
                    <article key={product.id}>
                      <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e8ddcf]">
                        <Link
                          href={`/products/${product.slug}`}
                          className="absolute inset-0"
                          aria-label={`View ${product.name}`}
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.025]"
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            addRecommendation(product)
                          }
                          className="absolute bottom-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-[#5a321b] shadow-lg transition hover:scale-105"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <BagPlusIcon />
                        </button>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <h3 className="mt-4 text-[13px] font-semibold uppercase tracking-[0.04em]">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-[15px]">
                          {formatPrice(product.price)}
                        </p>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-3xl bg-white p-7 shadow-[0_15px_40px_rgba(76,44,22,0.09)] xl:sticky xl:top-[110px]">
              <h2 className="font-[Georgia,serif] text-[31px]">
                Order Summary
              </h2>

              <div className="mt-5 border-t border-[#eadfd2] pt-6">
                <div className="space-y-4 text-[15px] text-[#5e534b]">
                  <div className="flex justify-between gap-5">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-5">
                    <span>Estimated Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between gap-5">
                    <span>Estimated Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between gap-5 text-[#39704d]">
                      <span>Discount</span>
                      <span>− {formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={applyDiscount} className="mt-8">
                  <label
                    htmlFor="discount-code"
                    className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64574f]"
                  >
                    Discount Code
                  </label>

                  <div className="mt-3 flex gap-2">
                    <input
                      id="discount-code"
                      value={discountCode}
                      onChange={(event) =>
                        setDiscountCode(event.target.value)
                      }
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-xl border border-[#e5d9cc] px-4 py-3 text-[14px] outline-none focus:border-[#6b4328]"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-[#6b4328] px-5 text-[14px] font-medium transition hover:bg-[#6b4328] hover:text-white"
                    >
                      Apply
                    </button>
                  </div>

                  {discountMessage && (
                    <p
                      className={`mt-3 text-[13px] ${
                        discountRate > 0
                          ? "text-[#39704d]"
                          : "text-[#9c4a3b]"
                      }`}
                    >
                      {discountMessage}
                    </p>
                  )}
                </form>

                <div className="mt-7 border-t border-[#eadfd2] pt-7">
                  <div className="flex items-end justify-between gap-5">
                    <span className="font-[Georgia,serif] text-[23px]">
                      Total
                    </span>
                    <div className="text-right">
                      <p className="font-[Georgia,serif] text-[30px] font-semibold">
                        {formatPrice(total)}
                      </p>
                      <p className="mt-1 text-[10px] text-[#75685f]">
                        Available for 12 mo. financing
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={cartItems.length === 0}
                    onClick={() => router.push("/checkout")}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#7a5407] px-6 py-4 text-[14px] font-medium tracking-[0.04em] text-[#f4d79b] shadow-lg transition hover:bg-[#654405] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Proceed to Checkout
                    <LockIcon />
                  </button>

                  <p className="mt-7 text-center text-[11px] uppercase tracking-[0.14em] text-[#675b53]">
                    Secure Payments Accepted
                  </p>

                  <div className="mt-4 flex justify-center gap-3">
                    {["VISA", "MC", "AMEX", "PAY"].map(
                      (payment) => (
                        <span
                          key={payment}
                          className="rounded bg-[#f1eee9] px-3 py-1 text-[10px] text-[#6f665f]"
                        >
                          {payment}
                        </span>
                      ),
                    )}
                  </div>

                  <div className="mt-6 flex gap-3 rounded-xl bg-[#f7efe2] p-4 text-[12px] leading-relaxed text-[#62574f]">
                    <span className="shrink-0 text-[#39704d]">
                      <ShieldIcon />
                    </span>
                    <p>
                      Every EpCraft purchase is protected by our
                      Lifetime Craftsmanship Guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer
        id="footer"
        className="border-t border-[#eadfce] bg-[#f7efe4] px-6 pb-8 pt-20 md:px-12 lg:px-16"
      >
        <div className="mx-auto grid max-w-[1840px] gap-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.75fr_0.8fr_1.3fr]">
          <div>
            <h2 className="font-[Georgia,serif] text-[48px] font-semibold tracking-[-0.04em]">
              EpCraft
            </h2>
            <p className="mt-6 max-w-[440px] text-[18px] leading-[1.55] text-[#675c54]">
              Crafting the future of wood with the precision of AI
              and the soul of the artisan.
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
                  await navigator.clipboard.writeText(
                    window.location.href,
                  );
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
            <h3 className="font-[Georgia,serif] text-[25px]">
              Explore
            </h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <Link href="/shop/furniture">New Arrivals</Link>
              <Link href="/shop/furniture">Best Sellers</Link>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="text-left"
              >
                The AI Design Lab
              </button>
              <Link href="/shop/furniture">Wholesale</Link>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">
              Concierge
            </h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <a href="#footer">Shipping &amp; Returns</a>
              <a href="#footer">Care Instructions</a>
              <a href="mailto:hello@epcraft.com">Contact Us</a>
              <a href="#footer">Terms of Service</a>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">
              Newsletter
            </h3>
            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-[#625850]">
              Join our inner circle for early access and
              craftsmanship stories.
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
                className="mt-4 w-full rounded-full bg-[#5a2e14] px-7 py-4 text-[18px] text-white transition hover:bg-[#47230e]"
              >
                Subscribe
              </button>

              {newsletterMessage && (
                <p className="mt-3 text-[14px] text-[#6d5c50]">
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-[1840px] flex-col gap-5 border-t border-[#eadfce] pt-7 text-[14px] text-[#665b53] md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 EpCraft Handcrafted Wood. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#footer">Privacy Policy</a>
            <a href="#footer">Terms of Use</a>
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
              Need help completing your room? Tell me your style and
              available space.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
            <input
              placeholder="Ask about your selection..."
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