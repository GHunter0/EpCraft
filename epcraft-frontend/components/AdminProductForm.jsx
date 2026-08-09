"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getProductImageUrl } from "@/lib/products";

/**
 * Reusable product form used by both /admin/products/new and /admin/products/[id].
 *
 * Props:
 *  - initialData: existing product object (null for create)
 *  - categories: array of { id, name }
 *  - makers: array of { id, name }
 *  - onSubmit: async (formData) => { success?, error?, validationErrors? }
 *  - submitLabel: button text
 */
export default function AdminProductForm({
  initialData = null,
  categories = [],
  makers = [],
  onSubmit,
  submitLabel = "Save Product",
}) {
  const isEdit = !!initialData;
  const supabase = createClient();
  const fileInputRef = useRef(null);

  // Form state
  const [productId, setProductId] = useState(initialData?.id || "");
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [makerId, setMakerId] = useState(initialData?.maker_id || "");
  const [material, setMaterial] = useState(initialData?.material || "");
  const [woodType, setWoodType] = useState(initialData?.wood_type || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [inStock, setInStock] = useState(initialData?.in_stock ?? true);
  const [stock, setStock] = useState(initialData?.stock?.toString() || "10");
  const [allowBackorder, setAllowBackorder] = useState(initialData?.allow_backorder ?? false);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() => {
    if (initialData?.image_url) {
      return getProductImageUrl(initialData.image_url);
    }
    return null;
  });

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  // Auto-generate slug from name (only for new products)
  function handleNameChange(val) {
    setName(val);
    if (!isEdit) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setProductId(slug);
    }
  }

  // Handle image file selection → upload to Supabase Storage
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadError(null);
    setUploading(true);

    try {
      // Build a unique file path
      const ext = file.name.split(".").pop();
      const timestamp = Date.now();
      const slug = productId || "product";
      const filePath = `${slug}-${timestamp}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Store just the relative path — getProductImageUrl() resolves to full URL
      setImageUrl(data.path);

      // Replace local preview with the actual Supabase URL
      const fullUrl = getProductImageUrl(data.path);
      setPreviewUrl(fullUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError(err.message || "Upload failed. Please try again.");
      // Keep local preview even if upload failed
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setImageUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    setValidationErrors({});
    setSuccessMessage(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.set("id", productId);
    fd.set("name", name);
    fd.set("price", price);
    fd.set("category_id", categoryId);
    fd.set("maker_id", makerId);
    fd.set("material", material);
    fd.set("wood_type", woodType);
    fd.set("description", description);
    fd.set("image_url", imageUrl);
    fd.set("in_stock", String(inStock));
    fd.set("stock", stock);
    fd.set("allow_backorder", String(allowBackorder));

    try {
      const result = await onSubmit(fd);

      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      } else if (result.error) {
        setServerError(result.error);
      } else if (result.success) {
        setSuccessMessage(
          isEdit
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (field) =>
    validationErrors[field] ? (
      <p className="font-sans text-xs text-red-600 mt-1">
        {validationErrors[field]}
      </p>
    ) : null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-bark hover:text-espresso transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border/30">
          <h1 className="font-serif text-3xl font-bold text-espresso">
            {isEdit ? `Edit: ${initialData.name}` : "New Product"}
          </h1>
          {isEdit && (
            <p className="font-sans text-xs text-bark mt-1">
              ID: {initialData.id}
            </p>
          )}
        </div>

        {/* Alerts */}
        {serverError && (
          <div className="mx-8 mt-6 rounded-lg border border-red-200 bg-red-50 p-4 font-sans text-sm text-red-700">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="mx-8 mt-6 rounded-lg border border-green-200 bg-green-50 p-4 font-sans text-sm text-green-800">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8">
          {/* ── Image Upload ── */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-bark mb-3">
              Product Image
            </p>
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative h-40 w-40 rounded-xl border-2 border-dashed border-border/40 bg-cream/40 flex items-center justify-center overflow-hidden shrink-0">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <X size={12} className="text-red-600" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2
                          size={24}
                          className="animate-spin text-gold"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-bark/40">
                    <ImageIcon size={32} />
                    <span className="font-sans text-[10px]">No image</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 bg-cream hover:bg-sand border border-border/40 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-espresso transition-colors disabled:opacity-50 w-fit"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload Image
                    </>
                  )}
                </button>
                <p className="font-sans text-[11px] text-bark/60">
                  JPG, PNG, or WebP. Uploaded to the{" "}
                  <code className="text-espresso">product-images</code> bucket.
                </p>
                {uploadError && (
                  <p className="font-sans text-xs text-red-600">
                    {uploadError}
                  </p>
                )}

                {/* Manual URL input */}
                <label className="flex flex-col gap-1 mt-2">
                  <span className="font-sans text-[11px] text-bark/60">
                    Or paste image URL / storage path directly:
                  </span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) {
                        setPreviewUrl(getProductImageUrl(e.target.value));
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                    placeholder="e.g. oak-board-1234.jpg or https://…"
                    className="rounded-lg border border-border/40 bg-white px-3 py-2 font-sans text-xs text-ink placeholder:text-bark/40 focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── Core Fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Product Name *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Heirloom Oak Cutting Board"
                className={`rounded-xl border bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold ${
                  validationErrors.name
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-border/60"
                }`}
              />
              {fieldError("name")}
            </label>

            {/* Product ID / slug */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Product ID (slug) *
              </span>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={isEdit}
                placeholder="e.g. heirloom-oak-cutting-board"
                className={`rounded-xl border bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold ${
                  isEdit
                    ? "bg-sand/30 text-bark/60 cursor-not-allowed"
                    : ""
                } ${
                  validationErrors.id
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-border/60"
                }`}
              />
              {fieldError("id")}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Price */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Price (LKR) *
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 8500"
                className={`rounded-xl border bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold ${
                  validationErrors.price
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-border/60"
                }`}
              />
              {fieldError("price")}
            </label>

            {/* Category */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Category *
              </span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`rounded-xl border bg-white px-4 py-3.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold ${
                  validationErrors.category_id
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-border/60"
                }`}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldError("category_id")}
            </label>

            {/* Maker */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Maker
              </span>
              <select
                value={makerId}
                onChange={(e) => setMakerId(e.target.value)}
                className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">None</option>
                {makers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Material */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Material
              </span>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Solid Hardwood"
                className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </label>

            {/* Wood Type */}
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Wood Type
              </span>
              <input
                type="text"
                value={woodType}
                onChange={(e) => setWoodType(e.target.value)}
                placeholder="e.g. White Oak"
                className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </label>
          </div>

          {/* Description */}
          <label className="flex flex-col gap-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the product — craftsmanship, dimensions, care instructions…"
              className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
            />
          </label>

          {/* Stock and Allow Backorder Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Stock Quantity *
              </span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  const isAvailable = parseInt(e.target.value) > 0;
                  setInStock(isAvailable);
                }}
                className={`rounded-xl border bg-white px-4 py-3.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold ${
                  validationErrors.stock ? "border-red-300 ring-1 ring-red-200" : "border-border/60"
                }`}
              />
              {fieldError("stock")}
            </label>

            <label className="flex items-center gap-3 cursor-pointer mt-8">
              <input
                type="checkbox"
                checked={allowBackorder}
                onChange={(e) => setAllowBackorder(e.target.checked)}
                className="h-5 w-5 rounded border-border/60 text-gold focus:ring-gold accent-gold"
              />
              <div className="flex flex-col">
                <span className="font-sans text-sm text-espresso font-semibold">
                  Allow Backorders / Pre-orders
                </span>
                <span className="font-sans text-[10px] text-bark">
                  Customers can buy even if out of stock
                </span>
              </div>
            </label>
          </div>

          {/* In Stock toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-5 w-5 rounded border-border/60 text-gold focus:ring-gold accent-gold"
            />
            <span className="font-sans text-sm text-espresso font-semibold">
              In Stock
            </span>
            <span className="font-sans text-[11px] text-bark">
              (uncheck to mark as out of stock manually)
            </span>
          </label>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/30">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center justify-center gap-2 bg-espresso hover:bg-gold text-white px-8 py-3.5 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  {submitLabel}
                </>
              )}
            </button>
            <Link
              href="/admin/products"
              className="font-sans text-sm font-semibold text-bark hover:text-espresso transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
