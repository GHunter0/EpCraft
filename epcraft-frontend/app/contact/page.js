"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Mail, Phone, Sparkles } from "lucide-react";

const faqs = [
  {
    q: "Shipping & Delivery",
    a: "Most pieces ship within 6–8 weeks of order confirmation, with white-glove delivery available in select regions.",
  },
  {
    q: "Custom Orders",
    a: "Use the Customization Studio to select finish, dimensions, and engraving — our artisans will confirm feasibility within 48 hours.",
  },
  {
    q: "Returns & Exchanges",
    a: "Standard pieces can be returned within 30 days. Custom/engraved pieces are final sale unless defective.",
  },
  {
    q: "Wood Care Instructions",
    a: "Dust with a soft cloth and re-oil every 6–12 months. Avoid direct sunlight and high-humidity environments.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-walnut">
          Support &amp; Care
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
          We&apos;re Here to Help
        </h1>
        <p className="max-w-2xl pt-2 font-sans text-lg text-bark">
          Our commitment to craftsmanship doesn&apos;t end when your piece leaves our workshop.
          Whether you have a question about an order or need care advice, our artisans are at
          your service.
        </p>
      </section>

      {/* AI callout */}
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border/40 bg-cream p-6 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-espresso text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base text-espresso">Need an instant answer?</h3>
              <p className="font-sans text-base text-bark">
                Ask our AI Assistant instead for quick guidance on care and shipping.
              </p>
            </div>
          </div>
          <button className="rounded-pill bg-[#44664a] px-8 py-3 font-sans text-base text-white">
            Launch Assistant
          </button>
        </div>
      </div>

      {/* Form + FAQ */}
      <div className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-2">
        <form className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-card">
          <h2 className="font-serif text-3xl font-semibold text-espresso">Send a Message</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-base text-bark">Name</span>
              <input
                placeholder="Oveen Dilmith"
                className="rounded-xl border border-border/50 px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-base text-bark">Email Address</span>
              <input
                type="email"
                placeholder="oveendilmith@gmail.com"
                className="rounded-xl border border-border/50 px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-sans text-base text-bark">Order Number (Optional)</span>
            <input
              placeholder="#EPC-0000"
              className="rounded-xl border border-border/50 px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-sans text-base text-bark">Your Message</span>
            <textarea
              rows={5}
              placeholder="How can we assist you?"
              className="rounded-xl border border-border/50 px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
            />
          </label>

          <button type="submit" className="btn-dark rounded-pill py-4">
            Send Inquiry
          </button>
        </form>

        <div className="flex flex-col gap-8">
          <h2 className="font-serif text-3xl font-semibold text-espresso">Frequently Asked</h2>
          <div className="flex flex-col">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border-b border-border/40 py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-serif text-base text-espresso">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-bark transition ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="pt-3 font-sans text-base text-bark">{faq.a}</p>
                )}
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-xl border-l-4 border-walnut bg-border/10 p-8">
            <h4 className="font-sans text-base text-espresso">Our Promise</h4>
            <p className="pt-2 font-sans italic text-base text-bark">
              &ldquo;Every grain tells a story. If your story isn&apos;t perfect, we will make it
              right. That is our artisan&apos;s vow.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Alt contact */}
      <section className="flex flex-col items-center gap-12 bg-[#f3ede4] px-6 py-24">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-serif text-3xl font-semibold text-espresso">Prefer a Direct Line?</h2>
          <div className="h-px w-24 bg-walnut/50" />
        </div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <ContactCard
            icon={MessageCircle}
            title="WhatsApp"
            detail="Real-time chat with our showroom concierge."
            value="+94 (075) 234-0642"
          />
          <ContactCard
            icon={Mail}
            title="Email"
            detail="For detailed inquiries or bulk order requests."
            value="epcraft@gmail.com"
          />
          <ContactCard
            icon={Phone}
            title="Phone"
            detail="Available Mon–Fri, 9am – 6pm"
            value="+94 (076) 987-6543"
          />
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon: Icon, title, detail, value }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-cream text-espresso">
        <Icon size={24} />
      </div>
      <h3 className="pt-2 font-serif text-base text-espresso">{title}</h3>
      <p className="pb-2 font-sans text-base text-bark">{detail}</p>
      <span className="border-b border-walnut/30 font-sans text-base text-walnut">{value}</span>
    </div>
  );
}
