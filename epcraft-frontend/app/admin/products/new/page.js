"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminProductForm from "@/components/AdminProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLookups() {
      const catRes = await supabase.from("categories").select("id, name").order("name");
      setCategories(catRes.data || []);
      setLoading(false);
    }
    loadLookups();
  }, []);

  async function handleCreate(formData) {
    const result = await createProduct(formData);
    if (result.success) {
      // Short delay so user sees the success message, then redirect
      setTimeout(() => router.push("/admin/products"), 1200);
    }
    return result;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="font-sans text-sm text-bark">
          Loading form data…
        </span>
      </div>
    );
  }

  return (
    <AdminProductForm
      categories={categories}
      onSubmit={handleCreate}
      submitLabel="Create Product"
    />
  );
}
