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

type OrderData = {
  id: string;
  createdAt: string;
  items: CartItem[];
  customer: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  deliveryMethod: "standard" | "express";
  paymentMethod: "card" | "bank" | "cod";
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

const ORDER_STORAGE_KEY = "epcraft-last-order";
const CART_STORAGE_KEY = "epcraft-cart";

function formatPrice(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getDisplayOrderNumber(orderId: string) {
  const digits = orderId.replace(/\D/g, "");
  const shortNumber = digits.slice(-5).padStart(5, "0");

  return `#EPC-${shortNumber}`;
}

function getEstimatedDelivery(createdAt: string) {
  const orderDate = new Date(createdAt);

  if (Number.isNaN(orderDate.getTime())) {
    return "Delivery date will be confirmed soon";
  }

  const startDate = new Date(orderDate);
  const endDate = new Date(orderDate);

  startDate.setDate(
    startDate.getDate() + 42,
  );

  endDate.setDate(
    endDate.getDate() + 48,
  );

  const startMonth = startDate.toLocaleString("en-US", {
    month: "long",
  });

  const endMonth = endDate.toLocaleString("en-US", {
    month: "long",
  });

  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startMonth === endMonth
  ) {
    return `${startMonth} ${startDate.getDate()} – ${endDate.getDate()}`;
  }

  return `${startMonth} ${startDate.getDate()} – ${endMonth} ${endDate.getDate()}`;
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-9 w-9"
    >
      <path d="m5 12 4.2 4.2L19 6.5" />
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
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
    >
      <path d="M12 2c.8 3.9 2.6 5.7 6.5 6.5-3.9.8-5.7 2.6-6.5 6.5-.8-3.9-2.6-5.7-6.5-6.5C9.4 7.7 11.2 5.9 12 2Z" />
      <path d="M19 13c.4 2 1.3 2.9 3.3 3.3-2 .4-2.9 1.3-3.3 3.3-.4-2-1.3-2.9-3.3-3.3 2-.4 2.9-1.3 3.3-3.3Z" />
    </svg>
  );
}

export default function OrderConfirmationPage() {
  const router = useRouter();

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [orderLoaded, setOrderLoaded] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  const [newsletterMessage, setNewsletterMessage] =
    useState("");

  useEffect(() => {
    try {
      const savedOrder =
        window.localStorage.getItem(ORDER_STORAGE_KEY);

      const parsedOrder: OrderData | null =
        savedOrder ? JSON.parse(savedOrder) : null;

      setOrder(parsedOrder);
    } catch {
      setOrder(null);
    } finally {
      setOrderLoaded(true);
    }
  }, []);

  useEffect(() => {
    function updateCartCount() {
      try {
        const savedCart =
          window.localStorage.getItem(CART_STORAGE_KEY);

        const items: CartItem[] =
          savedCart ? JSON.parse(savedCart) : [];

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

    window.addEventListener(
      "storage",
      updateCartCount,
    );

    window.addEventListener(
      "epcraft-cart-updated",
      updateCartCount,
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateCartCount,
      );

      window.removeEventListener(
        "epcraft-cart-updated",
        updateCartCount,
      );
    };
  }, []);

  const firstName = useMemo(() => {
    const name =
      order?.customer.fullName.trim();

    if (!name) {
      return "Customer";
    }

    return name.split(/\s+/)[0];
  }, [order]);

  const displayOrderNumber = order
    ? getDisplayOrderNumber(order.id)
    : "";

  const deliveryEstimate = order
    ? getEstimatedDelivery(order.createdAt)
    : "";

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(query)}`,
    );
  }

  function handleNewsletter(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData =
      new FormData(event.currentTarget);

    const email = String(
      formData.get("email") ?? "",
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

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );

      window.alert("Website link copied.");
    } catch {
      window.alert(
        "The website link could not be copied.",
      );
    }
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
                if (
                  searchOpen &&
                  searchText.trim()
                ) {
                  router.push(
                    `/search?q=${encodeURIComponent(
                      searchText.trim(),
                    )}`,
                  );
                  return;
                }

                setSearchOpen(
                  (value) => !value,
                );
              }}
              className="rounded-full p-2 transition hover:bg-[#f1e5d6]"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/cart")
              }
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

      <section className="px-6 pb-28 pt-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[760px] text-center">
          {!orderLoaded ? (
            <div className="rounded-3xl bg-white px-8 py-20 shadow-sm">
              <p className="text-[#71645b]">
                Loading your order...
              </p>
            </div>
          ) : !order ? (
            <div className="rounded-3xl border border-[#eadfce] bg-white px-8 py-20 shadow-sm">
              <h1 className="font-[Georgia,serif] text-[38px] font-semibold">
                No confirmed order found
              </h1>

              <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-7 text-[#71645b]">
                Complete the checkout process to view
                your order confirmation.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/shop/furniture")
                }
                className="mt-8 rounded-full bg-[#5a2e14] px-9 py-4 text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-[8px] border-[#f4ead7] bg-[#d1a258] text-white shadow-[0_8px_20px_rgba(122,82,28,0.15)]">
                <CheckIcon />
              </div>

              <h1 className="mx-auto mt-12 max-w-[700px] font-[Georgia,serif] text-[44px] font-semibold leading-[1.04] tracking-[-0.03em] md:text-[56px]">
                Thank you, {firstName}!
                <br />
                Your order is being
                <br />
                handcrafted.
              </h1>

              <p className="mt-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#756860]">
                Order {displayOrderNumber}
              </p>

              <p className="mt-3 text-[17px] text-[#685c54]">
                Estimated delivery:{" "}
                <span className="font-medium text-[#5a321b]">
                  {deliveryEstimate}
                </span>
              </p>

              <div className="mx-auto mt-9 h-px w-[360px] max-w-full bg-[#ead8bb]" />

              <section className="mx-auto mt-10 max-w-[580px] rounded-2xl bg-white p-7 text-left shadow-[0_16px_45px_rgba(81,47,25,0.08)] md:p-8">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.06em]">
                  Order Summary
                </h2>

                <div className="mt-7 space-y-5">
                  {order.items.map((item) => (
                    <article
                      key={item.id}
                      className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-4"
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative h-[70px] w-[70px] overflow-hidden rounded-lg bg-[#e8ddcf]"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="70px"
                          className="object-cover"
                        />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="block truncate text-[14px] font-semibold hover:underline"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-[11px] text-[#796d65]">
                          {item.details}
                        </p>

                        {item.quantity > 1 && (
                          <p className="mt-1 text-[11px] text-[#796d65]">
                            Qty: {item.quantity}
                          </p>
                        )}
                      </div>

                      <p className="text-right text-[14px] font-semibold">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0),
                        )}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between gap-5 border-t border-[#eadfd2] pt-7">
                  <span className="text-[13px] font-semibold">
                    Total Amount Paid
                  </span>

                  <span className="font-[Georgia,serif] text-[25px] font-semibold">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </section>

              <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/account/orders")
                  }
                  className="min-w-[220px] rounded-full bg-[#5a2e14] px-8 py-4 text-[14px] font-semibold text-white shadow-lg transition hover:bg-[#47230e]"
                >
                  Track Your Order
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/shop/furniture")
                  }
                  className="min-w-[190px] rounded-full px-8 py-4 text-[14px] font-semibold transition hover:bg-[#f1e5d6]"
                >
                  Continue Shopping
                </button>
              </div>

              <p className="mt-10 text-[15px] text-[#8b817a]">
                &quot;Your craftsman will begin work
                within 24 hours&quot;
              </p>
            </>
          )}
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
              Crafting the future of wood with the
              precision of AI and the soul of the
              artisan.
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
                onClick={handleShare}
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
              <Link href="/shop/furniture">
                New Arrivals
              </Link>

              <Link href="/shop/furniture">
                Best Sellers
              </Link>

              <button
                type="button"
                onClick={() =>
                  setChatOpen(true)
                }
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
            <h3 className="font-[Georgia,serif] text-[25px]">
              Concierge
            </h3>

            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
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
            <h3 className="font-[Georgia,serif] text-[25px]">
              Newsletter
            </h3>

            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-[#625850]">
              Join our inner circle for early access
              and craftsmanship stories.
            </p>

            <form
              onSubmit={handleNewsletter}
              className="mt-8"
            >
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
            © 2026 EpCraft Handcrafted Wood. All rights
            reserved.
          </p>

          <div className="flex gap-8">
            <a href="#footer">
              Privacy Policy
            </a>

            <a href="#footer">
              Terms of Use
            </a>
          </div>
        </div>
      </footer>

      {!chatOpen && (
        <button
          type="button"
          onClick={() =>
            setChatOpen(true)
          }
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
              onClick={() =>
                setChatOpen(false)
              }
              className="rounded-full px-3 py-1 text-2xl hover:bg-white/10"
              aria-label="Close AI Stylist"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-[14px] leading-relaxed text-[#51463f]">
              Your order is confirmed. Ask me for
              styling ideas while your pieces are
              being handcrafted.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
            <input
              placeholder="Ask about your order..."
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