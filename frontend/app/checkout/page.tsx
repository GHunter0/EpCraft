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

type PaymentMethod = "card" | "bank" | "cod";
type DeliveryMethod = "standard" | "express";

const CART_STORAGE_KEY = "epcraft-cart";
const ORDER_STORAGE_KEY = "epcraft-last-order";

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TruckIcon() {
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
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m3 9 9-5 9 5" />
      <path d="M5 10v7M9 10v7M15 10v7M19 10v7" />
      <path d="M3 20h18M4 17h16" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9h.01M18 15h.01" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
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
      className="h-4 w-4"
    >
      <path d="M12 3 19 6v5c0 4.7-2.6 8-7 10-4.4-2-7-5.3-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(CART_STORAGE_KEY);

      const items: CartItem[] = saved
        ? JSON.parse(saved)
        : [];

      setCartItems(items);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  const shipping =
    deliveryMethod === "express" && cartItems.length > 0
      ? 150
      : 0;

  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }

  function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormMessage("");

    if (
      !fullName.trim() ||
      !address.trim() ||
      !city.trim() ||
      !zipCode.trim() ||
      !phone.trim()
    ) {
      setFormMessage(
        "Please complete all shipping address fields.",
      );
      return;
    }

    if (cartItems.length === 0) {
      setFormMessage(
        "Your cart is empty. Add a product before placing an order.",
      );
      return;
    }

    if (
      paymentMethod === "card" &&
      (
        cardNumber.replace(/\s/g, "").length !== 16 ||
        expiryDate.replace(/\D/g, "").length !== 4 ||
        cvv.length < 3
      )
    ) {
      setFormMessage(
        "Please enter valid card details.",
      );
      return;
    }

    const order = {
      id: `EPC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: cartItems,
      customer: {
        fullName: fullName.trim(),
        address: address.trim(),
        city: city.trim(),
        zipCode: zipCode.trim(),
        phone: phone.trim(),
      },
      deliveryMethod,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
    };

    window.localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(order),
    );

    window.localStorage.removeItem(CART_STORAGE_KEY);

    window.dispatchEvent(
        new Event("epcraft-cart-updated"),
    );

    router.push("/order-confirmation");
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#5a321b]">
      <header className="border-b border-[#eadfce] bg-[#fbf5ec]">
        <div className="mx-auto flex h-[118px] max-w-[1500px] items-center justify-center px-6">
          <Link
            href="/"
            className="font-[Georgia,serif] text-[42px] font-semibold tracking-[-0.04em] text-[#5a2e14]"
          >
            EpCraft
          </Link>
        </div>
      </header>

      <section className="px-5 pb-28 pt-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1160px]">
          <div className="mx-auto flex max-w-[590px] items-center justify-center gap-5 text-[14px] sm:gap-8">
            <div className="flex items-center gap-3 text-[#5a2e14]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#5a2e14] text-white">
                1
              </span>
              <span>Shipping</span>
            </div>

            <span className="h-px w-8 bg-[#c69a57]" />

            <div className="flex items-center gap-3 text-[#aaa097]">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d6ccc1]">
                2
              </span>
              <span>Payment</span>
            </div>

            <span className="h-px w-8 bg-[#c69a57]" />

            <div className="flex items-center gap-3 text-[#aaa097]">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d6ccc1]">
                3
              </span>
              <span>Review</span>
            </div>
          </div>

          {!cartLoaded ? (
            <div className="mt-16 rounded-2xl bg-white p-12 text-center shadow-sm">
              Loading checkout...
            </div>
          ) : (
            <form
              onSubmit={handlePlaceOrder}
              className="mt-16 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <div className="space-y-10">
                <section className="rounded-2xl bg-white p-6 shadow-[0_12px_35px_rgba(89,51,28,0.05)] sm:p-8">
                  <div className="flex items-center justify-between gap-5">
                    <h1 className="font-[Georgia,serif] text-[31px]">
                      Shipping Address
                    </h1>
                    <span className="text-[#bd8a3f]">
                      <TruckIcon />
                    </span>
                  </div>

                  <div className="mt-8 space-y-6">
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                        Full Name
                      </span>
                      <input
                        value={fullName}
                        onChange={(event) =>
                          setFullName(event.target.value)
                        }
                        placeholder="Julian Vane"
                        className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                        Address
                      </span>
                      <input
                        value={address}
                        onChange={(event) =>
                          setAddress(event.target.value)
                        }
                        placeholder="128 Artisan Way, Studio 4"
                        className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                      />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                          City
                        </span>
                        <input
                          value={city}
                          onChange={(event) =>
                            setCity(event.target.value)
                          }
                          placeholder="High Point"
                          className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                          Zip Code
                        </span>
                        <input
                          value={zipCode}
                          onChange={(event) =>
                            setZipCode(
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            )
                          }
                          placeholder="27260"
                          className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                        Phone Number
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        placeholder="+94 77 123 4567"
                        className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-[0_12px_35px_rgba(89,51,28,0.05)] sm:p-8">
                  <h2 className="font-[Georgia,serif] text-[31px]">
                    Delivery Method
                  </h2>

                  <div className="mt-7 space-y-4">
                    <button
                      type="button"
                      onClick={() =>
                        setDeliveryMethod("standard")
                      }
                      className={`flex w-full items-center gap-4 rounded-lg border px-5 py-5 text-left transition ${
                        deliveryMethod === "standard"
                          ? "border-[#5a2e14] bg-[#fffaf2]"
                          : "border-[#eadfd2] bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                          deliveryMethod === "standard"
                            ? "border-[#6b4328]"
                            : "border-[#d9cfc4]"
                        }`}
                      >
                        {deliveryMethod === "standard" && (
                          <span className="h-2 w-2 rounded-full bg-[#6b4328]" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <strong className="block text-[14px]">
                          Standard Shipping
                        </strong>
                        <span className="mt-1 block text-[13px] text-[#6f6259]">
                          Arrives in 6–8 weeks • White glove setup optional
                        </span>
                      </span>

                      <span className="text-[13px]">
                        Free
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeliveryMethod("express")
                      }
                      className={`flex w-full items-center gap-4 rounded-lg border px-5 py-5 text-left transition ${
                        deliveryMethod === "express"
                          ? "border-[#5a2e14] bg-[#fffaf2]"
                          : "border-[#eadfd2] bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                          deliveryMethod === "express"
                            ? "border-[#6b4328]"
                            : "border-[#d9cfc4]"
                        }`}
                      >
                        {deliveryMethod === "express" && (
                          <span className="h-2 w-2 rounded-full bg-[#6b4328]" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <strong className="block text-[14px]">
                          Express Delivery
                        </strong>
                        <span className="mt-1 block text-[13px] text-[#6f6259]">
                          Arrives in 4 weeks • Priority crafting &amp; insurance
                        </span>
                      </span>

                      <span className="text-[13px]">
                        Rs. 150.00
                      </span>
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-[0_12px_35px_rgba(89,51,28,0.05)] sm:p-8">
                  <h2 className="font-[Georgia,serif] text-[31px]">
                    Payment Method
                  </h2>

                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-b border-[#eadfd2]">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod("card")
                      }
                      className={`flex items-center gap-2 border-b-2 pb-4 text-[13px] ${
                        paymentMethod === "card"
                          ? "border-[#6b4328] text-[#5a2e14]"
                          : "border-transparent text-[#6f6259]"
                      }`}
                    >
                      <CardIcon />
                      Credit Card
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod("bank")
                      }
                      className={`flex items-center gap-2 border-b-2 pb-4 text-[13px] ${
                        paymentMethod === "bank"
                          ? "border-[#6b4328] text-[#5a2e14]"
                          : "border-transparent text-[#6f6259]"
                      }`}
                    >
                      <BankIcon />
                      Bank Transfer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod("cod")
                      }
                      className={`flex items-center gap-2 border-b-2 pb-4 text-[13px] ${
                        paymentMethod === "cod"
                          ? "border-[#6b4328] text-[#5a2e14]"
                          : "border-transparent text-[#6f6259]"
                      }`}
                    >
                      <CashIcon />
                      COD
                    </button>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-7">
                      <div className="flex items-center justify-between gap-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                          Card Details
                        </p>

                        <div className="flex gap-2">
                          {["VISA", "MC", "AMEX"].map(
                            (brand) => (
                              <span
                                key={brand}
                                className="rounded bg-[#f1ece5] px-2 py-1 text-[9px] text-[#796e66]"
                              >
                                {brand}
                              </span>
                            ),
                          )}
                        </div>
                      </div>

                      <label className="relative mt-5 block">
                        <input
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(event) =>
                            setCardNumber(
                              formatCardNumber(
                                event.target.value,
                              ),
                            )
                          }
                          placeholder="0000 0000 0000 0000"
                          className="w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 pr-12 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a6b60]">
                          <LockIcon />
                        </span>
                      </label>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                            Expiry Date
                          </span>
                          <input
                            inputMode="numeric"
                            value={expiryDate}
                            onChange={(event) =>
                              setExpiryDate(
                                formatExpiry(
                                  event.target.value,
                                ),
                              )
                            }
                            placeholder="MM / YY"
                            className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                          />
                        </label>

                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#776a60]">
                            CVV
                          </span>
                          <input
                            inputMode="numeric"
                            value={cvv}
                            onChange={(event) =>
                              setCvv(
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              )
                            }
                            placeholder="123"
                            className="mt-3 w-full rounded-lg border border-[#eadfd2] bg-[#fffaf2] px-4 py-4 text-[14px] text-[#6d7480] outline-none focus:border-[#6b4328]"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="mt-7 rounded-xl bg-[#fffaf2] p-5 text-[14px] leading-6 text-[#665a52]">
                      Bank transfer instructions will be displayed
                      after the order is confirmed.
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-7 rounded-xl bg-[#fffaf2] p-5 text-[14px] leading-6 text-[#665a52]">
                      Pay when your order is delivered. Availability
                      may depend on your delivery location.
                    </div>
                  )}
                </section>
              </div>

              <aside className="rounded-2xl border border-[#eadfd2] bg-[#f8f1e7] p-6 lg:sticky lg:top-8">
                <h2 className="font-[Georgia,serif] text-[27px]">
                  Order Summary
                </h2>

                {cartItems.length === 0 ? (
                  <div className="mt-7 rounded-xl bg-white p-5 text-center">
                    <p className="text-[14px] text-[#71645b]">
                      Your cart is empty.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/shop/furniture")
                      }
                      className="mt-4 rounded-full bg-[#5a2e14] px-5 py-2.5 text-[13px] text-white"
                    >
                      Return to Shop
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-7 space-y-5">
                      {cartItems.map((item) => (
                        <article
                          key={item.id}
                          className="flex gap-4"
                        >
                          <Link
                            href={`/products/${item.slug}`}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#e9ddcf]"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              unoptimized
                              sizes="80px"
                              className="object-cover"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-[13px] font-semibold leading-5 hover:underline"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-[11px] text-[#74685f]">
                              Qty: {item.quantity}
                            </p>
                            <p className="mt-1 text-[13px]">
                              {formatPrice(
                                item.price * item.quantity,
                              )}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="my-7 h-px w-36 bg-[#d8b980]" />

                    <div className="space-y-4 text-[14px]">
                      <div className="flex justify-between gap-4">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>Shipping</span>
                        <span
                          className={
                            shipping === 0
                              ? "text-[#39704d]"
                              : ""
                          }
                        >
                          {shipping === 0
                            ? "Free"
                            : formatPrice(shipping)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span>Estimated Taxes</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#e5d8c9] pt-6">
                      <span className="font-[Georgia,serif] text-[22px]">
                        Total
                      </span>
                      <span className="font-[Georgia,serif] text-[23px] font-semibold">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#5a2e14] px-6 py-4 text-[14px] font-semibold text-white shadow-lg transition hover:bg-[#47230e]"
                    >
                      <LockIcon />
                      Place Order
                    </button>

                    <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.06em] text-[#776d65]">
                      <ShieldIcon />
                      Secure Encrypted Payment
                    </div>

                    {formMessage && (
                      <p
                        className={`mt-5 rounded-lg px-4 py-3 text-[12px] leading-5 ${
                          formMessage.startsWith(
                            "Order details saved",
                          )
                            ? "bg-[#eaf4ec] text-[#39704d]"
                            : "bg-[#f8e8e4] text-[#9c4a3b]"
                        }`}
                      >
                        {formMessage}
                      </p>
                    )}

                    <div className="mt-9 flex justify-center gap-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#aaa098]">
                      <span>Mastercard</span>
                      <span>Visa Secure</span>
                      <span>Norton</span>
                    </div>
                  </>
                )}
              </aside>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-[#eadfce] bg-[#f5eee4] px-6 py-10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-7 text-[13px] text-[#655a52] md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="font-[Georgia,serif] text-[24px] text-[#5a2e14]"
          >
            EpCraft
          </Link>

          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="#footer">Privacy Policy</a>
            <a href="#footer">Terms of Service</a>
            <a href="#footer">Shipping Information</a>
            <a href="#footer">Returns</a>
          </div>

          <p>© 2024 EpCraft. Handcrafted Quality.</p>
        </div>
      </footer>
    </main>
  );
}