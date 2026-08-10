"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
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
// Category Server Actions
// ─────────────────────────────────────────────
export async function saveCategory(formData) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const isEdit = formData.get("isEdit") === "true";
  const id = formData.get("id")?.trim();
  const name = formData.get("name")?.trim();
  const imageUrl = formData.get("image_url")?.trim() || null;

  const errors = {};
  if (!id) {
    errors.id = "Category ID (slug) is required.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    errors.id = "ID must be a lowercase slug (e.g. 'cutting-boards').";
  }

  if (!name) {
    errors.name = "Category name is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { validationErrors: errors };
  }

  const supabase = await createClient();

  if (!isEdit) {
    // Check duplicate ID
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .single();

    if (existing) {
      return { validationErrors: { id: "A category with this ID already exists." } };
    }

    const { error: insertErr } = await supabase.from("categories").insert({
      id,
      name,
      image_url: imageUrl,
    });

    if (insertErr) return { error: insertErr.message };
  } else {
    const { error: updateErr } = await supabase
      .from("categories")
      .update({
        name,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (updateErr) return { error: updateErr.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return { success: true };
}

export async function deleteCategory(id) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { error: deleteErr } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return { error: "Failed to delete category. Make sure no products are using it." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true };
}

// ─────────────────────────────────────────────
// Maker Server Actions
// ─────────────────────────────────────────────
export async function saveMaker(formData) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const isEdit = formData.get("isEdit") === "true";
  const id = formData.get("id")?.trim();
  const name = formData.get("name")?.trim();
  const bio = formData.get("bio")?.trim() || null;
  const photoUrl = formData.get("photo_url")?.trim() || null;

  const errors = {};
  if (!id) {
    errors.id = "Maker ID (slug) is required.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    errors.id = "ID must be a lowercase slug (e.g. 'john-doe').";
  }

  if (!name) {
    errors.name = "Maker name is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { validationErrors: errors };
  }

  const supabase = createClient();

  if (!isEdit) {
    // Check duplicate ID
    const { data: existing } = await supabase
      .from("makers")
      .select("id")
      .eq("id", id)
      .single();

    if (existing) {
      return { validationErrors: { id: "A maker with this ID already exists." } };
    }

    const { error: insertErr } = await supabase.from("makers").insert({
      id,
      name,
      bio,
      photo_url: photoUrl,
    });

    if (insertErr) return { error: insertErr.message };
  } else {
    const { error: updateErr } = await supabase
      .from("makers")
      .update({
        name,
        bio,
        photo_url: photoUrl,
      })
      .eq("id", id);

    if (updateErr) return { error: updateErr.message };
  }

  revalidatePath("/admin/makers");
  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return { success: true };
}

export async function deleteMaker(id) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const supabase = createClient();
  const { error: deleteErr } = await supabase
    .from("makers")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return { error: "Failed to delete maker. Make sure no products refer to this maker." };
  }

  revalidatePath("/admin/makers");
  revalidatePath("/shop");
  return { success: true };
}
