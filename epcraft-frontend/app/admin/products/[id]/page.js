"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminProductForm from "@/components/AdminProductForm";
import { updateProduct, deleteProduct } from "../actions";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [makers, setMakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, makerRes] = await Promise.all([
          supabase.from("products").select("*").eq("id", id).single(),
          supabase.from("categories").select("id, name").order("name"),
          supabase.from("makers").select("id, name").order("name"),
        ]);

        if (prodRes.error || !prodRes.data) {
          setError("Product not found.");
          setLoading(false);
          return;
        }

        setProduct(prodRes.data);
        setCategories(catRes.data || []);
        setMakers(makerRes.data || []);
      } catch (err) {
        setError("Failed to load product.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleUpdate(formData) {
    return await updateProduct(id, formData);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteProduct(id);
    if (result.error) {
      setDeleteError(result.error);
      setDeleting(false);
    } else {
      router.push("/admin/products");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="font-sans text-sm text-bark">Loading product…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="font-sans text-base text-red-600">{error}</p>
        <Link
          href="/admin/products"
          className="font-sans text-sm font-semibold text-espresso hover:text-gold"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <AdminProductForm
        initialData={product}
        categories={categories}
        makers={makers}
        onSubmit={handleUpdate}
        submitLabel="Update Product"
      />

      {/* Danger Zone */}
      <div className="rounded-2xl bg-white shadow-card border border-red-200 overflow-hidden">
        <div className="p-6 border-b border-red-100">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-red-700">
            <AlertTriangle size={18} />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          {deleteError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 font-sans text-sm text-red-700">
              {deleteError}
            </div>
          )}

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-sm text-ink font-semibold">
                  Delete this product
                </p>
                <p className="font-sans text-xs text-bark mt-0.5">
                  This action cannot be undone. The product will be permanently
                  removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-700 px-5 py-2.5 rounded-pill font-sans text-xs font-semibold shadow-soft transition-colors"
              >
                <Trash2 size={14} />
                Delete Product
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-red-50/50 p-4 rounded-xl border border-red-200">
              <p className="font-sans text-sm text-red-700 font-semibold">
                Are you sure? Type the product ID to confirm deletion:
              </p>
              <p className="font-mono text-xs text-red-600 bg-white px-3 py-1.5 rounded border border-red-200 w-fit">
                {id}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-pill font-sans text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Yes, Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="font-sans text-xs font-semibold text-bark hover:text-espresso transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
