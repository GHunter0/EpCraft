import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import OrderTracker from "@/components/OrderTracker";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load orders history along with item details
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        product:products (
          name,
          image_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // Split into active (first order) and past orders
  const activeOrder = orders && orders.length > 0 ? orders[0] : null;
  const pastOrders = orders && orders.length > 1 ? orders.slice(1) : [];

  // Helper to map status to OrderTracker steps:
  // 0: Order Placed, 1: In Production, 2: Shipped, 3: Delivered
  const getTrackerStep = (status) => {
    switch (status) {
      case "pending_payment":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 1;
    }
  };

  const getStatusLabel = (order) => {
    if (order.payment_status === "unpaid") {
      return "Pending Payment";
    }
    switch (order.status) {
      case "pending_payment":
        return "Unpaid";
      case "processing":
        return "In Production";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return order.status;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cream">
      <AccountSidebar active="Orders" />

      <div className="flex flex-1 flex-col gap-8 px-6 py-8 md:px-16 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-espresso font-semibold">Order History</h1>
          <p className="font-sans text-base text-bark">
            Trace the journey of your handcrafted pieces from the forest to your home.
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/60 bg-white py-20 text-center shadow-soft">
            <h3 className="font-serif text-2xl font-semibold text-espresso">No orders placed yet</h3>
            <p className="max-w-md font-sans text-sm text-bark">
              Your timber journey is just beginning. Browse the catalog to find your first handcrafted heirloom piece.
            </p>
            <Link href="/shop" className="btn-primary">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Active / most recent order, expanded with tracker */}
            {activeOrder && (
              <div className="overflow-hidden rounded-xl border border-border/30 bg-white shadow-card">
                <div className="flex flex-col gap-6 border-b border-border/30 p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-serif text-lg font-semibold text-espresso">
                        Order #{activeOrder.id.slice(0, 8).toUpperCase()}
                      </h2>
                      <p className="font-sans text-sm text-bark">
                        Placed {new Date(activeOrder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-pill bg-[#c2e9c6] px-4 py-1 font-sans text-sm text-[#486a4e] font-semibold">
                      {getStatusLabel(activeOrder)}
                    </span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {activeOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        title={item.product?.name}
                        className="h-20 w-20 shrink-0 rounded-lg bg-sand border border-border/30 flex items-center justify-center font-serif text-[8px] text-bark p-1 text-center"
                      >
                        {item.product?.name || "Bespoke Piece"}
                      </div>
                    ))}
                  </div>

                  <OrderTracker currentStep={getTrackerStep(activeOrder.status)} />
                </div>
                <div className="flex justify-between items-center bg-cream px-8 py-4">
                  <p className="font-sans text-sm text-bark">
                    Total: <strong className="text-espresso">{formatPrice(activeOrder.total)}</strong>
                  </p>
                  <Link
                    href={`/order-confirmation?order_id=${activeOrder.id}`}
                    className="font-sans text-sm font-semibold text-espresso hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )}

            {/* Past orders */}
            {pastOrders.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-serif text-xl font-semibold text-espresso">Past Orders</h3>
                <div className="flex flex-col gap-4">
                  {pastOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-border/10 bg-white p-6 shadow-soft"
                    >
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 shrink-0 rounded-lg bg-sand flex items-center justify-center font-serif text-[8px] text-bark p-1 text-center">
                          {order.order_items?.[0]?.product?.name || "Bespoke Piece"}
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-semibold text-espresso">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p className="font-sans text-sm text-bark">
                            {new Date(order.created_at).toLocaleDateString()} • {getStatusLabel(order)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-sans text-sm text-bark">
                          {order.order_items?.reduce((sum, item) => sum + item.quantity, 0)} Items
                        </span>
                        <Link
                          href={`/order-confirmation?order_id=${order.id}`}
                          className="rounded-pill px-6 py-2 font-sans text-sm font-semibold text-espresso hover:bg-cream border border-border/40 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
