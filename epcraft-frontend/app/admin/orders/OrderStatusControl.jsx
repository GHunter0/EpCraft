"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { ChevronRight, Loader2 } from "lucide-react";

const NEXT_STATUS_MAP = {
  processing: { label: "Mark as Shipped", next: "shipped" },
  shipped:    { label: "Mark as Delivered", next: "delivered" },
};

export default function OrderStatusControl({ orderId, currentStatus }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  const action = NEXT_STATUS_MAP[currentStatus];

  if (!action) {
    // delivered or pending_payment — no admin action available
    return (
      <p className="font-sans text-xs text-bark italic mt-2">
        {currentStatus === "delivered"
          ? "This order is complete. No further status changes are available."
          : "Status can only be advanced once payment is confirmed."}
      </p>
    );
  }

  async function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, action.next);
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className="flex items-center gap-2 self-start bg-espresso hover:bg-gold text-white font-sans text-xs font-semibold px-6 py-3 rounded-pill transition-colors disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ChevronRight size={14} />
        )}
        {pending ? "Updating…" : action.label}
      </button>

      {result?.error && (
        <p className="font-sans text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          ✕ {result.error}
        </p>
      )}
      {result?.success && (
        <p className="font-sans text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          ✓ Order status updated to <strong>{action.next}</strong>.
        </p>
      )}
    </div>
  );
}
