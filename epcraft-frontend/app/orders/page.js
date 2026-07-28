import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import OrderTracker from "@/components/OrderTracker";

const pastOrders = [
  { id: "EPC-79224", date: "Sept 18, 2024", status: "Delivered", items: 3 },
  { id: "EPC-75011", date: "Aug 05, 2024", status: "Delivered", items: 1 },
];

export default function OrdersPage() {
  return (
    <div className="flex flex-col md:flex-row">
      <AccountSidebar active="Orders" />

      <div className="flex flex-1 flex-col gap-8 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-espresso">Order History</h1>
          <p className="font-sans text-base text-bark">
            Trace the journey of your handcrafted pieces from the forest to your home.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Active / most recent order, expanded with tracker */}
          <div className="overflow-hidden rounded-xl border border-border/30 bg-white shadow-card">
            <div className="flex flex-col gap-6 border-b border-border/30 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-base text-espresso">Order #EPC-82910</h2>
                  <p className="font-sans text-base text-bark">Placed Oct 12, 2024</p>
                </div>
                <span className="rounded-pill bg-[#c2e9c6] px-4 py-1 font-sans text-sm text-[#486a4e]">
                  In Production
                </span>
              </div>

              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-sand" />
                <div className="h-20 w-20 shrink-0 rounded-lg bg-sand" />
              </div>

              <OrderTracker currentStep={1} />
            </div>
            <div className="flex justify-end bg-cream px-8 py-4">
              <Link href="/orders/EPC-82910" className="font-sans text-base text-espresso">
                View Full Order Details →
              </Link>
            </div>
          </div>

          {/* Past orders */}
          {pastOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-border/10 bg-white p-6 shadow-soft"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-sand" />
                <div>
                  <h3 className="font-serif text-base text-espresso">Order #{order.id}</h3>
                  <p className="font-sans text-base text-bark">
                    {order.date} • {order.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-sans text-base text-bark">{order.items} Items</span>
                <button className="rounded-pill px-6 py-2 font-sans text-base text-espresso hover:bg-cream">
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
