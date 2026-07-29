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

const previousOrders = [
  {
    orderNumber: "#EPC-79224",
    date: "Sept 18, 2024",
    itemCount: "3 Items",
    image:
      "/epcraft/product-detail/organic-form-bowl.jpg",
  },
  {
    orderNumber: "#EPC-75011",
    date: "Aug 05, 2024",
    itemCount: "1 Item",
    image:
      "/epcraft/cart/minimalist-brass-shelf.jpg",
  },
];

function formatOrderNumber(orderId: string) {
  const digits = orderId.replace(/\D/g, "");

  const number = digits
    .slice(-5)
    .padStart(5, "0");

  return `#EPC-${number}`;
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
  {
    label: "Overview",
    icon: OverviewIcon,
  },
  {
    label: "Orders",
    icon: OrdersIcon,
  },
  {
    label: "Wishlist",
    icon: HeartIcon,
  },
  {
    label: "Addresses",
    icon: AddressIcon,
  },
  {
    label: "Payment Methods",
    icon: PaymentIcon,
  },
  {
    label: "Settings",
    icon: SettingsIcon,
  },
];
function TrackingIcon({
  type,
}: {
  type:
    | "placed"
    | "production"
    | "quality"
    | "shipped"
    | "delivered";
}) {
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
      {type === "placed" && (
        <path d="m6 12 4 4 8-9" />
      )}

      {type === "production" && (
        <>
          <path d="m5 19 3-1 10-10-2-2L6 16l-1 3Z" />
          <path d="m14 7 3 3" />
        </>
      )}

      {type === "quality" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.3 2.3 4.7-5" />
        </>
      )}

      {type === "shipped" && (
        <>
          <path d="M3 6h11v10H3z" />
          <path d="M14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </>
      )}

      {type === "delivered" && (
        <>
          <path d="M4 7h16v13H4z" />
          <path d="M3 4h18v3H3z" />
          <path d="M9 11h6" />
        </>
      )}
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
export default function OrderHistoryPage() {
  const router = useRouter();

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [orderLoaded, setOrderLoaded] =
    useState(false);

  const [chatOpen, setChatOpen] =
    useState(false);

  const [newsletterMessage, setNewsletterMessage] =
    useState("");

  useEffect(() => {
    try {
      const savedOrder =
        window.localStorage.getItem(
          ORDER_STORAGE_KEY,
        );

      const parsedOrder: OrderData | null =
        savedOrder
          ? JSON.parse(savedOrder)
          : null;

      setOrder(parsedOrder);
    } catch {
      setOrder(null);
    } finally {
      setOrderLoaded(true);
    }
  }, []);

  const customerName = useMemo(() => {
    const fullName =
      order?.customer.fullName.trim();

    if (!fullName) {
      return "Welcome back";
    }

    const firstName =
      fullName.split(/\s+/)[0];

    return `Welcome back, ${firstName}`;
  }, [order]);
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
return (
  <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#5a321b]">
    <div className="mx-auto flex min-h-screen max-w-[1800px]">
      <aside className="hidden w-[310px] shrink-0 flex-col border-r border-[#e6dbce] bg-[#f8f0e5] px-6 py-10 shadow-[8px_0_25px_rgba(78,47,27,0.03)] md:flex">
        <Link
          href="/"
          className="font-[Georgia,serif] text-[22px] italic text-[#6a3b22]"
        >
          Artisan Wood
        </Link>

        <div className="mt-16 flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#d8b990] font-[Georgia,serif] text-lg font-semibold text-white">
            EW
          </div>

          <div>
            <p className="text-[16px] text-[#544943]">
              {customerName}
            </p>

            <p className="mt-2 font-[Georgia,serif] text-[17px]">
              Crafting since
            </p>

            <p className="mt-1 font-[Georgia,serif] text-[17px]">
              2023
            </p>
          </div>
        </div>

        <nav className="mt-14 space-y-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Orders";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.label === "Overview") {
                    router.push("/account");
                    return;
                  }

                  if (item.label === "Wishlist") {
                    router.push("/account/wishlist");
                    return;
                  }

                  if (item.label !== "Orders") {
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
          <h1 className="font-[Georgia,serif] text-[27px]">
            Order History
          </h1>

          <p className="mt-3 text-[18px] text-[#625851]">
            Trace the journey of your handcrafted pieces from
            the forest to your home.
          </p>

          {!orderLoaded ? (
  <div className="mt-12 rounded-2xl bg-white px-8 py-20 text-center shadow-sm">
    Loading your orders...
  </div>
) : !order ? (
  <div className="mt-12 rounded-2xl bg-white px-8 py-20 text-center shadow-sm">
    <h2 className="font-[Georgia,serif] text-[30px]">
      No orders yet
    </h2>

    <p className="mt-4 text-[#71645b]">
      Your confirmed orders will appear here.
    </p>

    <button
      type="button"
      onClick={() =>
        router.push("/shop/furniture")
      }
      className="mt-7 rounded-full bg-[#5a2e14] px-8 py-3.5 text-white"
    >
      Start Shopping
    </button>
  </div>
) : (
  <>
    <section className="mt-12 overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(80,47,28,0.07)]">
      <div className="p-7 md:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-[Georgia,serif] text-[21px]">
              Order {formatOrderNumber(order.id)}
            </h2>

            <p className="mt-2 text-[17px] text-[#5f554e]">
              Placed {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#ccefd1] px-6 py-2 text-[15px] text-[#52745b]">
            In Production
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {order.items.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="relative h-[90px] w-[90px] overflow-hidden rounded-xl bg-[#e8ddcf]"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                sizes="90px"
                className="object-cover"
              />
            </Link>
          ))}
        </div>

        <div className="mt-14 overflow-x-auto pb-3">
          <div className="grid min-w-[720px] grid-cols-5 items-start gap-2">
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#d2a45f] text-white">
                <TrackingIcon type="placed" />
              </span>

              <p className="mt-4 text-[13px] text-[#3f3833]">
                Order Placed
              </p>
            </div>

            <div className="relative text-center">
              <span className="absolute left-[-50%] right-[50%] top-6 h-px bg-[#d2a45f]" />

              <span className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-[#d8ecd7] bg-white text-[#d2a45f] shadow-sm">
                <TrackingIcon type="production" />
              </span>

              <p className="mt-4 text-[13px] text-[#d2a45f]">
                In Production
              </p>
            </div>

            <div className="relative text-center">
              <span className="absolute left-[-50%] right-[50%] top-6 h-px bg-[#ded4c7]" />

              <span className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f8f5f0] text-[#99918a]">
                <TrackingIcon type="quality" />
              </span>

              <p className="mt-4 text-[13px] text-[#8f8781]">
                Quality Check
              </p>
            </div>

            <div className="relative text-center">
              <span className="absolute left-[-50%] right-[50%] top-6 h-px bg-[#ded4c7]" />

              <span className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f8f5f0] text-[#99918a]">
                <TrackingIcon type="shipped" />
              </span>

              <p className="mt-4 text-[13px] text-[#8f8781]">
                Shipped
              </p>
            </div>

            <div className="relative text-center">
              <span className="absolute left-[-50%] right-[50%] top-6 h-px bg-[#ded4c7]" />

              <span className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f8f5f0] text-[#99918a]">
                <TrackingIcon type="delivered" />
              </span>

              <p className="mt-4 text-[13px] text-[#8f8781]">
                Delivered
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push("/order-confirmation")
        }
        className="flex w-full items-center justify-end gap-2 border-t border-[#eee5da] px-7 py-6 text-[15px] font-medium transition hover:bg-[#fffaf2]"
      >
        View Full Order Details
        <span>→</span>
      </button>
    </section>

    <div className="mt-12 space-y-8">
      {previousOrders.map((previousOrder) => (
        <article
          key={previousOrder.orderNumber}
          className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(80,47,28,0.05)] sm:flex-row sm:items-center"
        >
          <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-[#e8ddcf]">
            <Image
              src={previousOrder.image}
              alt={previousOrder.orderNumber}
              fill
              unoptimized
              sizes="76px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-[Georgia,serif] text-[18px]">
              Order {previousOrder.orderNumber}
            </h3>

            <p className="mt-1 text-[16px] text-[#625851]">
              {previousOrder.date} • Delivered
            </p>
          </div>

          <p className="text-[15px] text-[#625851]">
            {previousOrder.itemCount}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/shop/furniture")
            }
            className="text-[15px] font-medium hover:underline"
          >
            Reorder
          </button>
        </article>
      ))}
    </div>
  </>
)}
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
                className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcdb8]"
                aria-label="Email"
              >
                ✉
              </a>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    window.location.href,
                  );

                  window.alert("Website link copied.");
                }}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#dfcdb8]"
                aria-label="Share"
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
                name="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-[#e7dbcc] bg-white px-6 py-3.5 outline-none"
              />

              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-[#5a2e14] px-6 py-3.5 text-white"
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
        Your order is in production. Ask me about delivery,
        care, or styling.
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