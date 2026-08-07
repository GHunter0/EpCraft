"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { user: null, error: "Forbidden" };

  return { user, error: null };
}

export async function getStoreSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to load store settings:", error);
    // Return defaults as fallback
    return {
      id: 1,
      standard_shipping: 0,
      express_shipping: 150,
      tax_percentage: 8,
      store_name: "EpCraft",
      store_email: "contact@epcraft.com",
      store_phone: "+94 11 234 5678",
      store_address: "123 Artisan Lane, Colombo, Sri Lanka",
    };
  }

  return data;
}

export async function updateStoreSettings(formData) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const fields = {
    standard_shipping: parseFloat(formData.get("standard_shipping")),
    express_shipping: parseFloat(formData.get("express_shipping")),
    tax_percentage: parseFloat(formData.get("tax_percentage")),
    store_name: formData.get("store_name")?.trim(),
    store_email: formData.get("store_email")?.trim(),
    store_phone: formData.get("store_phone")?.trim(),
    store_address: formData.get("store_address")?.trim(),
  };

  // Validation
  const errors = {};
  if (isNaN(fields.standard_shipping) || fields.standard_shipping < 0) {
    errors.standard_shipping = "Standard shipping must be a positive number.";
  }
  if (isNaN(fields.express_shipping) || fields.express_shipping < 0) {
    errors.express_shipping = "Express shipping must be a positive number.";
  }
  if (isNaN(fields.tax_percentage) || fields.tax_percentage < 0 || fields.tax_percentage > 100) {
    errors.tax_percentage = "Tax percentage must be between 0 and 100.";
  }
  if (!fields.store_name) {
    errors.store_name = "Store name is required.";
  }
  if (!fields.store_email) {
    errors.store_email = "Store email is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { validationErrors: errors };
  }

  const supabase = createClient();
  const { error: updateErr } = await supabase
    .from("store_settings")
    .update(fields)
    .eq("id", 1);

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return { success: true };
}
