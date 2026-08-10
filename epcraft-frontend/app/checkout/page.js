"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { formatPrice, getProductImageUrl } from "@/lib/products";
import { useShop } from "@/lib/ShopContext";
import { createClient } from "@/lib/supabase/client";

const steps = ["Shipping", "Payment", "Review"];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, removeFromCart } = useShop();

  const selectedParam = searchParams.get("selected");
  const selectedItemIds = selectedParam ? selectedParam.split(",") : null;
  const checkoutCart = selectedItemIds
    ? cart.filter((item) => selectedItemIds.includes(String(item.cartItemId)))
    : cart;

  const checkoutSubtotal = checkoutCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Pre-fill states from user profile
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  const [savedAddresses, setSavedAddresses] = useState({
    primary: null,
    secondary: null,
  });
  const [addressSource, setAddressSource] = useState("new"); // 'primary' | 'secondary' | 'new'

  const parseAddress = (addrStr, defaultName = "", defaultPhone = "") => {
    const defaultVal = { name: defaultName, phone: defaultPhone, street: "", city: "", zip: "", country: "Sri Lanka" };
    if (!addrStr) return null;

    if (addrStr.trim().startsWith("{")) {
      try {
        return { ...defaultVal, ...JSON.parse(addrStr) };
      } catch (e) {
        console.error("Failed to parse JSON address", e);
      }
    }

    const parts = addrStr.split(",").map((s) => s.trim());
    return {
      name: defaultName,
      phone: defaultPhone,
      street: parts[0] || "",
      city: parts[1] || "",
      zip: parts[2] || "",
      country: parts[3] || "Sri Lanka",
    };
  };

  const handleAddressSourceChange = (source) => {
    setAddressSource(source);
    if (source === "primary" && savedAddresses.primary) {
      setName(savedAddresses.primary.name);
      setAddress(savedAddresses.primary.street);
      setPhone(savedAddresses.primary.phone);
      setCity(savedAddresses.primary.city);
      setZip(savedAddresses.primary.zip);
    } else if (source === "secondary" && savedAddresses.secondary) {
      setName(savedAddresses.secondary.name);
      setAddress(savedAddresses.secondary.street);
      setPhone(savedAddresses.secondary.phone);
      setCity(savedAddresses.secondary.city);
      setZip(savedAddresses.secondary.zip);
    } else if (source === "new") {
      setName("");
      setAddress("");
      setPhone("");
      setCity("");
      setZip("");
    }
  };
  
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();
  const checkoutError = searchParams.get("error");
  const cancelledOrderId = searchParams.get("order_id");

  const [settings, setSettings] = useState({
    standard_shipping: 0,
    express_shipping: 150,
    tax_percentage: 8,
  });

  useEffect(() => {
    async function loadUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const parsedPrimary = parseAddress(profile.address, profile.name || "", profile.phone || "");
          const parsedSecondary = parseAddress(profile.secondary_address, "", "");
          
          setSavedAddresses({
            primary: parsedPrimary,
            secondary: parsedSecondary,
          });

          // Default selection: if primary address exists, use it!
          if (parsedPrimary) {
            setAddressSource("primary");
            setName(parsedPrimary.name);
            setAddress(parsedPrimary.street);
            setPhone(parsedPrimary.phone);
            setCity(parsedPrimary.city);
            setZip(parsedPrimary.zip);
          } else {
            setAddressSource("new");
          }
        }
      }
    }
    async function loadStoreSettings() {
      const { data } = await supabase
        .from("store_settings")
        .select("standard_shipping, express_shipping, tax_percentage")
        .eq("id", 1)
        .single();
      if (data) {
        setSettings({
          standard_shipping: Number(data.standard_shipping),
          express_shipping: Number(data.express_shipping),
          tax_percentage: Number(data.tax_percentage),
        });
      }
    }
    loadUserProfile();
    loadStoreSettings();

    if (checkoutError === "cancelled") {
      if (cancelledOrderId) {
        Promise.resolve().then(() => {
          setError(`Payment was cancelled for Order #${(cancelledOrderId || "").slice(0, 8)}. You can edit details and retry.`);
        });
      }
    }
  }, [checkoutError, cancelledOrderId]);

  const shipping = delivery === "express" ? settings.express_shipping : settings.standard_shipping;
  const tax = Math.round(checkoutSubtotal * (settings.tax_percentage / 100) * 100) / 100;
  const total = checkoutSubtotal + shipping + tax;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (checkoutCart.length === 0) {
      setError("Your checkout cart is empty!");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on the server
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: { name, address, city, zip, phone },
          deliveryMethod: delivery,
          cartItems: checkoutCart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            customOptions: item.customOptions,
          })),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setError(resData.error || "Failed to place order.");
        setLoading(false);
        return;
      }

      // 2. Redirect user to PayHere sandbox payment page
      const payhereParams = resData.payhereParams;

      // Clear the checked out items from cart
      try {
        await Promise.all(checkoutCart.map((item) => removeFromCart(item.cartItemId)));
      } catch (clearErr) {
        console.error("Failed to clear purchased items from cart:", clearErr);
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(payhereParams).forEach(([key, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = typeof val === "object" ? JSON.stringify(val) : val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex flex-col gap-10 py-12 pb-24 bg-cream min-h-screen">
      <div className="flex items-center justify-between">
        <Link href="/cart" className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-bark hover:text-espresso">
          <ArrowLeft size={16} /> Return to Cart
        </Link>
        <span className="font-serif text-2xl font-bold text-espresso">EpCraft Secure Checkout</span>
        <div className="w-24" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-8 border-y border-border/40 py-6">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-pill font-sans text-sm font-bold ${
                  i === 0 ? "bg-espresso text-white" : "border border-bark/40 text-ink opacity-40"
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-sans text-sm font-medium ${i === 0 ? "text-espresso" : "text-ink opacity-40"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-16 bg-gold/50" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          {/* Shipping Address */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Shipping Address</h2>

            {/* Saved Address Selector */}
            {(savedAddresses.primary || savedAddresses.secondary) && (
              <div className="flex flex-col gap-3 p-4 bg-cream/35 border border-border/30 rounded-2xl">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                  Use a Saved Destination
                </span>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
                  {savedAddresses.primary && (
                    <label className={`flex flex-1 items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      addressSource === "primary" ? "border-espresso bg-espresso/5 shadow-soft" : "border-border/60 hover:bg-cream/10"
                    }`}>
                      <input
                        type="radio"
                        name="addressSource"
                        value="primary"
                        checked={addressSource === "primary"}
                        onChange={() => handleAddressSourceChange("primary")}
                        className="mt-1 h-4 w-4 text-espresso accent-espresso focus:ring-espresso"
                      />
                      <div className="font-sans text-xs text-bark">
                        <span className="font-bold text-espresso block mb-0.5">Primary Address</span>
                        <p className="font-medium text-ink truncate max-w-[200px]">{savedAddresses.primary.name}</p>
                        <p className="truncate max-w-[200px]">{savedAddresses.primary.street}</p>
                      </div>
                    </label>
                  )}
                  {savedAddresses.secondary && (
                    <label className={`flex flex-1 items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      addressSource === "secondary" ? "border-espresso bg-espresso/5 shadow-soft" : "border-border/60 hover:bg-cream/10"
                    }`}>
                      <input
                        type="radio"
                        name="addressSource"
                        value="secondary"
                        checked={addressSource === "secondary"}
                        onChange={() => handleAddressSourceChange("secondary")}
                        className="mt-1 h-4 w-4 text-espresso accent-espresso focus:ring-espresso"
                      />
                      <div className="font-sans text-xs text-bark">
                        <span className="font-bold text-espresso block mb-0.5">Secondary Address</span>
                        <p className="font-medium text-ink truncate max-w-[200px]">{savedAddresses.secondary.name}</p>
                        <p className="truncate max-w-[200px]">{savedAddresses.secondary.street}</p>
                      </div>
                    </label>
                  )}
                  <label className={`flex flex-1 items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    addressSource === "new" ? "border-espresso bg-espresso/5 shadow-soft" : "border-border/60 hover:bg-cream/10"
                  }`}>
                    <input
                      type="radio"
                      name="addressSource"
                      value="new"
                      checked={addressSource === "new"}
                      onChange={() => handleAddressSourceChange("new")}
                      className="mt-1 h-4 w-4 text-espresso accent-espresso focus:ring-espresso"
                    />
                    <div className="font-sans text-xs text-bark">
                      <span className="font-bold text-espresso block mb-0.5">Custom Address</span>
                      <p className="font-medium text-ink">Enter details below</p>
                      <p className="opacity-70">Add a different delivery address</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="Full Name"
                placeholder="Julian Vane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="md:col-span-2"
                required
              />
              <Field
                label="Address"
                placeholder="128 Artisan Way, Studio 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="md:col-span-2"
                required
              />
              <Field
                label="City"
                placeholder="Colombo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Field
                label="Postal / Zip Code"
                placeholder="00100"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
              <Field
                label="Phone Number"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="md:col-span-2"
                required
              />
            </div>
          </section>

          {/* Delivery Method */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Delivery Option</h2>
            <div className="flex flex-col gap-4">
              <DeliveryOption
                selected={delivery === "standard"}
                onSelect={() => setDelivery("standard")}
                title="Standard Insured Delivery"
                price="Free"
                detail="Arrives in 4-6 weeks • Insured white glove installation"
              />
              <DeliveryOption
                selected={delivery === "express"}
                onSelect={() => setDelivery("express")}
                title="Express Priority Crafting"
                price="Rs. 150.00"
                detail="Arrives in 2-3 weeks • Priority workshop slot"
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-card border border-border/40">
            <h2 className="font-serif text-2xl font-bold text-espresso">Payment Method</h2>
            <div className="flex gap-8 border-b border-border/40">
              {[
                { id: "card", label: "Credit / Debit Card (PayHere Sandbox)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPayment(tab.id)}
                  className={`pb-4 font-sans text-sm font-semibold transition-colors ${
                    payment === tab.id
                      ? "border-b-2 border-espresso text-espresso"
                      : "text-bark hover:text-espresso"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="font-sans text-sm text-bark">
              You will be redirected to the secure PayHere Sandbox portal to safely complete your payment.
            </p>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border/40 bg-white p-8 shadow-card">
            <h3 className="font-serif text-2xl font-bold text-espresso">Order Summary</h3>

            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
              {checkoutCart.length === 0 ? (
                <p className="font-sans text-sm text-bark italic">No items selected.</p>
              ) : (
                checkoutCart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-4 border-b border-border/30 pb-3">
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-sand flex items-center justify-center font-serif text-[10px] text-bark overflow-hidden relative border border-border/30">
                      {item.image ? (
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        item.name
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-sm font-bold text-espresso">{item.name}</p>
                      <p className="font-sans text-xs text-bark">Qty: {item.quantity}</p>
                      <p className="pt-0.5 font-serif text-sm font-semibold text-espresso">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="h-px w-full bg-gold/50" />

            <div className="flex flex-col gap-3 font-sans text-sm text-bark">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(checkoutSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "font-medium text-green-700" : "font-medium text-ink"}>
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax ({settings.tax_percentage}%)</span>
                <span className="font-medium text-ink">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <span className="font-serif text-2xl font-bold text-ink">Total</span>
              <span className="font-serif text-2xl font-bold text-espresso">{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              disabled={checkoutCart.length === 0 || loading}
              className={`flex items-center justify-center gap-2 rounded-pill py-4 font-sans text-base font-semibold text-white shadow-soft transition-colors ${
                checkoutCart.length === 0 || loading ? "bg-sand text-bark/50 cursor-not-allowed" : "bg-espresso hover:bg-gold"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Preparing Checkout...
                </>
              ) : (
                <>
                  <Lock size={16} /> Place Order & Pay
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wide text-bark opacity-80">
              <ShieldCheck size={16} className="text-espresso" />
              PayHere Sandbox Security Guaranteed
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, className = "", required }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

function DeliveryOption({ selected, onSelect, title, price, detail }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-6 rounded-xl border p-5 transition-all ${
        selected ? "border-2 border-espresso bg-white shadow-sm" : "border-border/40 bg-cream/40"
      }`}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onSelect}
        className="h-5 w-5 accent-espresso"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-bold text-espresso">{title}</span>
          <span className="font-sans text-sm font-bold text-espresso">{price}</span>
        </div>
        <p className="font-sans text-xs text-bark mt-1">{detail}</p>
      </div>
    </label>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] bg-cream flex items-center justify-center font-sans text-bark">
        Preparing Secure Checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
