"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitQuote(requestId, formData) {
  const supabase = await createClient();

  // Re-verify admin on every mutation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden" };

  // Parse & validate inputs
  const quoted_price = parseFloat(formData.get("quoted_price"));
  const quoted_lead_time = (formData.get("quoted_lead_time") || "").trim();
  const admin_note = (formData.get("admin_note") || "").trim();

  if (isNaN(quoted_price) || quoted_price <= 0) {
    return { error: "A valid positive quoted price is required." };
  }
  if (!quoted_lead_time) {
    return { error: "Lead time is required." };
  }

  // Confirm request exists and is still pending_review
  const { data: req, error: fetchErr } = await supabase
    .from("custom_order_requests")
    .select("id, status")
    .eq("id", requestId)
    .single();

  if (fetchErr || !req) return { error: "Custom order request not found." };

  if (req.status !== "pending_review") {
    return {
      error: `Request is already '${req.status}' — cannot re-quote.`,
    };
  }

  // Write the quote — this triggers the customer-facing 'quoted' state on account page
  const { error: updateErr } = await supabase
    .from("custom_order_requests")
    .update({
      status: "quoted",
      quoted_price,
      quoted_lead_time,
      admin_note: admin_note || null,
      updated_by: user.id,
      // updated_at is handled by the trigger on this table
    })
    .eq("id", requestId);

  if (updateErr) {
    console.error("Quote submission failed:", updateErr);
    return { error: updateErr.message };
  }

  revalidatePath(`/admin/custom-orders/${requestId}`);
  revalidatePath("/admin/custom-orders");

  return { success: true };
}
