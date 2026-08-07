"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper: verify the current user is an authenticated admin.
 * Returns { user, error }.
 */
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

// ─────────────────────────────────────────────
// Toggle in_stock
// ─────────────────────────────────────────────
export async function toggleProductStock(productId) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const supabase = createClient();

  // Fetch current value
  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("in_stock")
    .eq("id", productId)
    .single();

  if (fetchErr || !product) return { error: "Product not found." };

  const { error: updateErr } = await supabase
    .from("products")
    .update({ in_stock: !product.in_stock })
    .eq("id", productId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");

  return { success: true, in_stock: !product.in_stock };
}

// ─────────────────────────────────────────────
// Server-side validation for product form
// ─────────────────────────────────────────────
function validateProductFields(fields) {
  const errors = {};

  if (!fields.id || !fields.id.trim()) {
    errors.id = "Product ID (slug) is required.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.id.trim())) {
    errors.id = "ID must be a lowercase slug (e.g. 'oak-cutting-board').";
  }

  if (!fields.name || !fields.name.trim()) {
    errors.name = "Product name is required.";
  }

  const price = parseFloat(fields.price);
  if (isNaN(price) || price < 0) {
    errors.price = "A valid price (≥ 0) is required.";
  }

  if (!fields.category_id || !fields.category_id.trim()) {
    errors.category_id = "Category is required.";
  }

  // Optional fields — no validation needed for maker_id, material, wood_type, description, image_url

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─────────────────────────────────────────────
// Create product
// ─────────────────────────────────────────────
export async function createProduct(formData) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const fields = {
    id: formData.get("id"),
    name: formData.get("name"),
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    maker_id: formData.get("maker_id") || null,
    material: formData.get("material") || null,
    wood_type: formData.get("wood_type") || null,
    description: formData.get("description") || null,
    image_url: formData.get("image_url") || null,
    in_stock: formData.get("in_stock") === "true",
  };

  const { valid, errors } = validateProductFields(fields);
  if (!valid) return { validationErrors: errors };

  const supabase = createClient();

  // Check for duplicate ID
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("id", fields.id.trim())
    .single();

  if (existing) {
    return { validationErrors: { id: "A product with this ID already exists." } };
  }

  const { error: insertErr } = await supabase.from("products").insert({
    id: fields.id.trim(),
    name: fields.name.trim(),
    price: parseFloat(fields.price),
    category_id: fields.category_id.trim(),
    maker_id: fields.maker_id?.trim() || null,
    material: fields.material?.trim() || null,
    wood_type: fields.wood_type?.trim() || null,
    description: fields.description?.trim() || null,
    image_url: fields.image_url?.trim() || null,
    in_stock: fields.in_stock,
  });

  if (insertErr) {
    console.error("Product creation failed:", insertErr);
    return { error: insertErr.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return { success: true, productId: fields.id.trim() };
}

// ─────────────────────────────────────────────
// Update product
// ─────────────────────────────────────────────
export async function updateProduct(productId, formData) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const fields = {
    id: productId, // ID cannot be changed
    name: formData.get("name"),
    price: formData.get("price"),
    category_id: formData.get("category_id"),
    maker_id: formData.get("maker_id") || null,
    material: formData.get("material") || null,
    wood_type: formData.get("wood_type") || null,
    description: formData.get("description") || null,
    image_url: formData.get("image_url") || null,
    in_stock: formData.get("in_stock") === "true",
  };

  const { valid, errors } = validateProductFields(fields);
  if (!valid) return { validationErrors: errors };

  const supabase = createClient();

  const { error: updateErr } = await supabase
    .from("products")
    .update({
      name: fields.name.trim(),
      price: parseFloat(fields.price),
      category_id: fields.category_id.trim(),
      maker_id: fields.maker_id?.trim() || null,
      material: fields.material?.trim() || null,
      wood_type: fields.wood_type?.trim() || null,
      description: fields.description?.trim() || null,
      image_url: fields.image_url?.trim() || null,
      in_stock: fields.in_stock,
    })
    .eq("id", productId);

  if (updateErr) {
    console.error("Product update failed:", updateErr);
    return { error: updateErr.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/product/${productId}`);
  revalidatePath("/shop");

  return { success: true };
}

// ─────────────────────────────────────────────
// Delete product
// ─────────────────────────────────────────────
export async function deleteProduct(productId) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const supabase = createClient();

  const { error: deleteErr } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteErr) {
    console.error("Product deletion failed:", deleteErr);
    return { error: deleteErr.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return { success: true };
}
