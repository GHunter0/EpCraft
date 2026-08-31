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
  const customRequestId = searchParams.get("custom_request_id");

  const [customRequest, setCustomRequest] = useState(null);
  const [customRequestLoading, setCustomRequestLoading] = useState(false);

  const checkoutCart = customRequestId
    ? customRequest
      ? [
          {
            cartItemId: `custom-${customRequest.id}`,
            id: customRequest.base_product_id || "oak-serving-board",
            name: `Custom ${customRequest.finish || "Bespoke"} Wood Piece`,
            price: Number(customRequest.quoted_price || 0),
            image: customRequest.base_product?.image_url || "",
            category: "",
            woodType: "",
            allow_cod: customRequest.base_product?.allow_cod ?? true,
            quantity: 1,
            customOptions: {
              finish: customRequest.finish,
              dimension: customRequest.dimension,
              engraving_text: customRequest.engraving_text,
              font: customRequest.font,
              is_custom_studio_request: true,
              custom_request_id: customRequest.id,
            },
          },
        ]
      : []
    : selectedItemIds
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

  const canUseCOD = checkoutCart.every((item) => item.allow_cod !== false);
  const selectedPayment = payment === "cod" && !canUseCOD ? "card" : payment;

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
    async function loadCustomRequest() {
      if (!customRequestId) return;
      setCustomRequestLoading(true);
      try {
        const { data, error } = await supabase
          .from("custom_order_requests")
          .select(`
            *,
            base_product:products!custom_order_requests_base_product_id_fkey ( id, name, price, image_url, allow_cod )
          `)
          .eq("id", customRequestId)
          .single();

        if (!error && data) {
          setCustomRequest(data);
        }
      } catch (err) {
        console.error("Failed to load custom request:", err);
      } finally {
        setCustomRequestLoading(false);
      }
    }
    loadUserProfile();
    loadStoreSettings();
    loadCustomRequest();

    if (checkoutError === "cancelled") {
      if (cancelledOrderId) {
        Promise.resolve().then(() => {
          setError(`Payment was cancelled for Order #${(cancelledOrderId || "").slice(0, 8)}. You can edit details and retry.`);
        });
      }
    }
  }, [checkoutError, cancelledOrderId, customRequestId]);

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
          paymentMethod: selectedPayment,
          customRequestId: customRequestId || null,
          cartItems: checkoutCart.map((item) => ({
            id: item.id,
            nodeId: item.nodeId,
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

      // Clear the checked out items from cart
      try {
        if (!customRequestId) {
          await Promise.all(checkoutCart.map((item) => removeFromCart(item.cartItemId)));
        }
      } catch (clearErr) {
        console.error("Failed to clear purchased items from cart:", clearErr);
      }

      if (selectedPayment === "cod") {
        router.push(`/order-confirmation?order_id=${resData.orderId}`);
        return;
      }

      const payhereParams = resData.payhereParams;

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
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/cart" className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-bark hover:text-espresso">
          <ArrowLeft size={16} /> Return to Cart
        </Link>
        <span className="font-serif text-xl font-bold text-espresso sm:text-2xl">Secure Checkout</span>
        <div className="hidden w-24 sm:block" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 border-y border-border/40 py-6 sm:gap-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-sans text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                  i === 0 ? "bg-espresso text-white" : "border border-bark/40 text-ink opacity-40"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden font-sans text-sm font-medium sm:inline ${i === 0 ? "text-espresso" : "text-ink opacity-40"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-8 bg-gold/50 sm:w-16" />}
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
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-bold text-espresso">Payment Method</h2>
              {!canUseCOD && (
                <span className="font-sans text-[11px] text-bark italic">
                  * Cash on Delivery is disabled because one or more products in your cart require card payment.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <PaymentOption
                selected={selectedPayment === "card"}
                onSelect={() => setPayment("card")}
                title="Credit / Debit Card (PayHere Sandbox)"
                detail="You will be redirected to the secure PayHere Sandbox portal to safely complete your payment."
              />
              {canUseCOD && (
                <PaymentOption
                  selected={selectedPayment === "cod"}
                  onSelect={() => setPayment("cod")}
                  title="Cash on Delivery (COD)"
                  detail="Pay with cash upon delivery of your handcrafted item. Simple and secure."
                />
              )}
            </div>
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

function PaymentOption({ selected, onSelect, title, detail }) {
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
        <span className="font-sans text-sm font-bold text-espresso">{title}</span>
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
