export const metadata = {
  title: "Terms of Service | EpCraft",
};

export default function TermsPage() {
  const updated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-page flex flex-col gap-10 py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-2 font-sans text-sm text-bark/70">Last updated: {updated}</p>
      </div>

      <div className="flex max-w-3xl flex-col gap-8 font-sans text-base leading-relaxed text-bark">
        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">1. Overview</h2>
          <p>
            These Terms govern your use of the EpCraft website and any purchase you
            make through it. By browsing our catalog, placing an order, or using
            the Customization Studio or AI Stylist, you agree to these Terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">2. Orders & Pricing</h2>
          <p>
            All prices are listed in the currency shown at checkout and are subject
            to change without notice until an order is confirmed. We reserve the
            right to refuse or cancel any order, including in cases of pricing
            errors, suspected fraud, or unavailable materials.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">3. Custom Orders</h2>
          <p>
            Pieces created through the Customization Studio are made to your
            specifications (finish, dimensions, engraving) and are treated as
            custom goods. See our{" "}
            <a href="/shipping" className="text-gold underline underline-offset-2">
              Shipping &amp; Returns
            </a>{" "}
            page for how this affects returns.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">4. Accounts</h2>
          <p>
            You&apos;re responsible for keeping your account credentials secure and for
            any activity that happens under your account. Let us know right away
            if you believe your account has been accessed without your permission.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">5. Intellectual Property</h2>
          <p>
            All product designs, photography, and content on this site belong to
            EpCraft unless otherwise noted, and may not be reproduced without
            permission.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">6. Limitation of Liability</h2>
          <p>
            EpCraft is not liable for indirect or incidental damages arising from
            the use of this website or our products, beyond what is required by
            applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">7. Contact</h2>
          <p>
            Questions about these Terms can be sent to epcraft@gmail.com or
            through our <a href="/contact" className="text-gold underline underline-offset-2">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
