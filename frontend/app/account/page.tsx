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

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
};

const ORDER_STORAGE_KEY = "epcraft-last-order";
const PROFILE_STORAGE_KEY = "epcraft-profile";

function formatOrderNumber(orderId: string) {
  const digits = orderId.replace(/\D/g, "");

  return `#EPC-${digits
    .slice(-5)
    .padStart(5, "0")}`;
}

function formatOrderDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
function OverviewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M5 3h14v18H5z" />
      <path d="M8 7h8M8 11h5M8 15h7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function AddressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18M7 15h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M10 4H5v16h5" />
      <path d="m14 8 4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

const sidebarItems = [
  { label: "Overview", icon: OverviewIcon },
  { label: "Orders", icon: OrdersIcon },
  { label: "Wishlist", icon: HeartIcon },
  { label: "Addresses", icon: AddressIcon },
  { label: "Payment Methods", icon: PaymentIcon },
  { label: "Settings", icon: SettingsIcon },
];
function OrdersCountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <path d="M5 9h14l-1 10H6L5 9Z" />
      <path d="M9 9a3 3 0 0 1 6 0" />
    </svg>
  );
}

function WishlistCountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
    >
      <path d="M4 7h10l6 6-7 7-9-9V7Z" />
      <circle cx="9" cy="11" r="1.5" />
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
export default function AccountOverviewPage() {
  const router = useRouter();

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [pageLoaded, setPageLoaded] =
    useState(false);

  const [fullName, setFullName] =
    useState("Julian Thorne");

  const [email, setEmail] =
    useState("julian.thorne@craftmail.com");

  const [phone, setPhone] =
    useState("+94 (071) 156-0363");

  const [profileMessage, setProfileMessage] =
    useState("");

  const [newsletterMessage, setNewsletterMessage] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(false);

  useEffect(() => {
    try {
      const savedOrder =
        window.localStorage.getItem(
          ORDER_STORAGE_KEY,
        );

      const savedProfile =
        window.localStorage.getItem(
          PROFILE_STORAGE_KEY,
        );

      if (savedOrder) {
        const parsedOrder: OrderData =
          JSON.parse(savedOrder);

        setOrder(parsedOrder);

        if (!savedProfile) {
          setFullName(
            parsedOrder.customer.fullName ||
              "Julian Thorne",
          );

          setPhone(
            parsedOrder.customer.phone ||
              "+94 (071) 156-0363",
          );
        }
      }

      if (savedProfile) {
        const profile: ProfileData =
          JSON.parse(savedProfile);

        setFullName(profile.fullName);
        setEmail(profile.email);
        setPhone(profile.phone);
      }
    } catch {
      setOrder(null);
    } finally {
      setPageLoaded(true);
    }
  }, []);

  const firstName = useMemo(() => {
    const name = fullName.trim();

    return name
      ? name.split(/\s+/)[0]
      : "Customer";
  }, [fullName]);
function handleProfileUpdate(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (
    !fullName.trim() ||
    !email.trim().includes("@") ||
    !phone.trim()
  ) {
    setProfileMessage(
      "Please enter valid profile information.",
    );
    return;
  }

  const profile: ProfileData = {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
  };

  window.localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile),
  );

  setProfileMessage(
    "Profile updated successfully.",
  );
}
function handleNewsletter(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const formData =
    new FormData(event.currentTarget);

  const newsletterEmail = String(
    formData.get("newsletterEmail") ?? "",
  ).trim();

  if (!newsletterEmail.includes("@")) {
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
    <div className="mx-auto flex min-h-screen max-w-[1800px]">
      <aside className="hidden w-[310px] shrink-0 flex-col border-r border-[#e6dbce] bg-[#f8f0e5] px-6 py-10 shadow-[8px_0_25px_rgba(78,47,27,0.03)] md:flex">
        <Link
          href="/"
          className="font-[Georgia,serif] text-[34px] font-semibold tracking-[-0.04em]"
        >
          EpCraft
        </Link>

        <p className="mt-1 text-[16px] text-[#625851]">
          Crafting since 2023
        </p>

        <nav className="mt-28 space-y-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Overview";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                    if (item.label === "Orders") {
                        router.push("/account/orders");
                        return;
                    }

                    if (item.label === "Wishlist") {
                        router.push("/account/wishlist");
                    return;
                    }

                    if (item.label !== "Overview") {
                        window.alert(
                            `${item.label} page will be connected later.`,
                        );
                    }
                }}
                className={`flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-[16px] font-semibold transition ${
                  active
                    ? "bg-[#ccefd1] text-[#486d53]"
                    : "text-[#544943] hover:bg-[#efe5d7]"
                }`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() =>
            window.alert(
              "Logout will be connected when authentication is added.",
            )
          }
          className="mt-auto flex items-center gap-4 px-4 py-4 text-[16px] text-red-500"
        >
          <LogoutIcon />
          Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <section className="px-6 pb-24 pt-12 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1260px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-[Georgia,serif] text-[44px] font-semibold leading-tight md:text-[52px]">
                Welcome back, {firstName}
              </h1>

              <p className="mt-3 text-[18px] text-[#625851]">
                Here is a summary of your recent artisanal journey.
              </p>
            </div>

            <div className="flex items-center gap-4 lg:text-right">
              <div>
                <p className="text-[16px] font-semibold">
                  {fullName}
                </p>

                <p className="mt-1 text-[15px] text-[#625851]">
                  Member since 2023
                </p>
              </div>

              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#d5ad76] font-[Georgia,serif] text-lg font-semibold text-white">
                {fullName
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
  <article className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_12px_30px_rgba(80,47,28,0.07)]">
    <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#d2a45f]" />

    <div className="text-[#a88d78]">
      <OrdersCountIcon />
    </div>

    <p className="mt-7 text-[15px] uppercase tracking-[0.14em] text-[#625851]">
      Total Orders
    </p>

    <p className="mt-3 font-[Georgia,serif] text-[30px] font-semibold">
      12
    </p>
  </article>

  <article className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_12px_30px_rgba(80,47,28,0.07)]">
    <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#d2a45f]" />

    <div className="text-[#a88d78]">
      <WishlistCountIcon />
    </div>

    <p className="mt-7 text-[15px] uppercase tracking-[0.14em] text-[#625851]">
      Wishlist Items
    </p>

    <p className="mt-3 font-[Georgia,serif] text-[30px] font-semibold">
      08
    </p>
  </article>

  <article className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_12px_30px_rgba(80,47,28,0.07)]">
    <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#d2a45f]" />

    <div className="text-[#a88d78]">
      <PointsIcon />
    </div>

    <p className="mt-7 text-[15px] uppercase tracking-[0.14em] text-[#625851]">
      Points
    </p>

    <p className="mt-3 font-[Georgia,serif] text-[30px] font-semibold">
      450
    </p>
  </article>
</div>
<div className="mt-12 grid items-start gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
  <section className="rounded-2xl bg-white p-7 shadow-[0_12px_30px_rgba(80,47,28,0.07)] md:p-8">
    <div className="flex items-center justify-between gap-5 border-b border-[#ead7b7] pb-4">
      <h2 className="font-[Georgia,serif] text-[28px]">
        Recent Orders
      </h2>

      <button
        type="button"
        onClick={() =>
          router.push("/account/orders")
        }
        className="text-[14px] font-medium text-[#c18c3d] hover:underline"
      >
        View All
      </button>
    </div>

    {!pageLoaded ? (
      <p className="py-12 text-center text-[#71645b]">
        Loading recent orders...
      </p>
    ) : (
      <div className="divide-y divide-[#eee3d6]">
        {order && order.items.length > 0 && (
          <article className="flex items-center gap-5 py-6">
            <Link
              href={`/products/${order.items[0].slug}`}
              className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-[#e8ddcf]"
            >
              <Image
                src={order.items[0].image}
                alt={order.items[0].name}
                fill
                unoptimized
                sizes="84px"
                className="object-cover"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${order.items[0].slug}`}
                className="font-semibold leading-5 hover:underline"
              >
                {order.items[0].name}
              </Link>

              <p className="mt-2 text-[14px] text-[#625851]">
                Order {formatOrderNumber(order.id)} •{" "}
                {formatOrderDate(order.createdAt)}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#ccefd1] px-4 py-2 text-[12px] text-[#52745b]">
              In Production
            </span>

            <button
              type="button"
              onClick={() =>
                router.push("/account/orders")
              }
              className="text-xl"
              aria-label="View order"
            >
              ›
            </button>
          </article>
        )}

        <article className="flex items-center gap-5 py-6">
          <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-[#e8ddcf]">
            <Image
              src="/epcraft/product-detail/organic-form-bowl.jpg"
              alt="Geometric Oak Coasters"
              fill
              unoptimized
              sizes="84px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-5">
              Geometric Oak Coasters
              <br />
              (Set of 4)
            </p>

            <p className="mt-2 text-[14px] text-[#625851]">
              Order #EPC-98210 • July 08, 2026
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#ebe7df] px-4 py-2 text-[12px] text-[#625851]">
            Delivered
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/account/orders")
            }
            className="text-xl"
            aria-label="View order"
          >
            ›
          </button>
        </article>
      </div>
    )}
  </section>

  <section className="rounded-2xl bg-white p-7 shadow-[0_12px_30px_rgba(80,47,28,0.07)] md:p-8">
    <h2 className="font-[Georgia,serif] text-[28px]">
      Profile Information
    </h2>

    <div className="mt-5 h-px w-36 bg-[#d8b579]" />

    <form
      onSubmit={handleProfileUpdate}
      className="mt-7 space-y-6"
    >
      <label className="block">
        <span className="text-[13px] uppercase tracking-[0.1em] text-[#625851]">
          Full Name
        </span>

        <input
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          className="mt-3 w-full rounded-xl border border-[#ddd3c8] bg-white px-4 py-4 outline-none focus:border-[#cba15e]"
        />
      </label>

      <label className="block">
        <span className="text-[13px] uppercase tracking-[0.1em] text-[#625851]">
          Email Address
        </span>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="mt-3 w-full rounded-xl border border-[#ddd3c8] bg-white px-4 py-4 outline-none focus:border-[#cba15e]"
        />
      </label>

      <label className="block">
        <span className="text-[13px] uppercase tracking-[0.1em] text-[#625851]">
          Phone Number
        </span>

        <input
          type="tel"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
          }
          className="mt-3 w-full rounded-xl border border-[#ddd3c8] bg-white px-4 py-4 outline-none focus:border-[#cba15e]"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-full bg-[#d0a25d] px-6 py-4 text-[16px] text-white shadow-md transition hover:bg-[#bd8c43]"
      >
        Update Profile
      </button>

      {profileMessage && (
        <p
          className={`text-center text-[13px] ${
            profileMessage.includes("successfully")
              ? "text-[#39704d]"
              : "text-[#9c4a3b]"
          }`}
        >
          {profileMessage}
        </p>
      )}
    </form>
  </section>
</div>
                </div>
      </section>

      <footer
        id="footer"
        className="border-t border-[#eadfce] bg-[#f7efe4] px-6 pb-8 pt-16 md:px-10 xl:px-16"
      >
        <div className="mx-auto grid max-w-[1260px] gap-12 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.9fr_1.3fr]">
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
                ✉
              </a>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      window.location.href,
                    );

                    window.alert(
                      "Website link copied.",
                    );
                  } catch {
                    window.alert(
                      "Website link could not be copied.",
                    );
                  }
                }}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcdb8] transition hover:bg-[#f0e3d2]"
                aria-label="Share website"
              >
                ↗
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
              Join our inner circle for early access and
              craftsmanship stories.
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

        <div className="mx-auto mt-16 flex max-w-[1260px] flex-col gap-4 border-t border-[#eadfce] pt-6 text-[12px] text-[#665b53] md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 EpCraft Handcrafted Wood. All rights reserved.
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
          Welcome back, {firstName}. Ask me about your
          orders, wishlist, or handcrafted furniture.
        </div>
      </div>

      <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
        <input
          placeholder="Ask your AI stylist..."
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