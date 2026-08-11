"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Valid admin-controlled status transitions only.
// payment_status is deliberately excluded — it's controlled only by the PayHere callback.
const ALLOWED_TRANSITIONS = {
  processing: ["shipped"],
  shipped: ["delivered"],
};

export async function updateOrderStatus(orderId, newStatus) {
  const supabase = await createClient();

  // Re-verify admin server-side on every mutation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Forbidden: admin access required" };
  }

  // Fetch current order status to validate the transition
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("status, payment_status")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { error: "Order not found" };
  }

  // Validate transition is allowed
  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowedNextStatuses.includes(newStatus)) {
    return {
      error: `Invalid transition: cannot move from '${order.status}' to '${newStatus}'`,
    };
  }

  // Update status, updated_at (via trigger), and updated_by
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_by: user.id,
    })
    .eq("id", orderId);

  if (updateErr) {
    console.error("Order status update failed:", updateErr);
    return { error: updateErr.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true };
}

export async function markOrderAsPaid(orderId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Forbidden: admin access required" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
    })
    .eq("id", orderId);

  if (error) {
    console.error("Order payment mark failed:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true };
}
