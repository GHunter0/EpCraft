export const metadata = {
  title: "Privacy Policy | EpCraft",
};

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-page flex flex-col gap-10 py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-2 font-sans text-sm text-bark/70">Last updated: {updated}</p>
      </div>

      <div className="flex max-w-3xl flex-col gap-8 font-sans text-base leading-relaxed text-bark">
        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">1. What We Collect</h2>
          <p>
            When you create an account, place an order, or contact us, we collect
            information such as your name, email address, shipping address, phone
            number, and order details. If you use our AI Stylist or chat
            assistant, we also process the messages you send to provide a
            response.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">2. How We Use It</h2>
          <p>
            We use your information to process and deliver orders, manage your
            account and wishlist, respond to support requests, and improve our
            products and services. We don&apos;t sell your personal information to
            third parties.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">3. Cookies & Local Storage</h2>
          <p>
            We use browser storage to keep your cart and wishlist available
            between visits, and to keep you signed in. You can clear this at any
            time through your browser settings, though doing so may sign you out
            or empty your saved cart.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">4. Data Sharing</h2>
          <p>
            We share information with service providers only as needed to operate
            the site — for example, payment processing and delivery. These
            providers are only permitted to use your data to perform services for
            us.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">5. Your Choices</h2>
          <p>
            You can review or update your account details at any time from your
            Account page, or request that we delete your account and associated
            data by contacting us.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-semibold text-espresso">6. Contact</h2>
          <p>
            Questions about this Privacy Policy can be sent to epcraft@gmail.com
            or through our <a href="/contact" className="text-gold underline underline-offset-2">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
