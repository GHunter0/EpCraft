"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  Users,
  ImageIcon,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductImageUrl } from "@/lib/products";
import { saveMaker, deleteMaker } from "../categories/actions";

export default function AdminMakersPage() {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  // List data
  const [makers, setMakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [makerId, setMakerId] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Status/Feedback
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMakers();
  }, []);

  async function fetchMakers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("makers")
      .select("*")
      .order("name");
    if (error) console.error("Fetch makers failed:", error);
    setMakers(data || []);
    setLoading(false);
  }

  function handleOpenCreate() {
    setIsEdit(false);
    setMakerId("");
    setName("");
    setBio("");
    setPhotoUrl("");
    setPreviewUrl(null);
    setValidationErrors({});
    setServerError(null);
    setShowForm(true);
  }

  function handleOpenEdit(maker) {
    setIsEdit(true);
    setMakerId(maker.id);
    setName(maker.name);
    setBio(maker.bio || "");
    setPhotoUrl(maker.photo_url || "");
    setPreviewUrl(maker.photo_url ? getProductImageUrl(maker.photo_url) : null);
    setValidationErrors({});
    setServerError(null);
    setShowForm(true);
  }

  function handleNameChange(val) {
    setName(val);
    if (!isEdit) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setMakerId(slug);
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const timestamp = Date.now();
      const slug = makerId || "maker";
      const filePath = `makers/${slug}-${timestamp}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;
      setPhotoUrl(data.path);
      setPreviewUrl(getProductImageUrl(data.path));
    } catch (err) {
      console.error(err);
      setServerError("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setValidationErrors({});

    const fd = new FormData();
    fd.set("isEdit", String(isEdit));
    fd.set("id", makerId);
    fd.set("name", name);
    fd.set("bio", bio);
    fd.set("photo_url", photoUrl);

    const res = await saveMaker(fd);
    if (res.validationErrors) {
      setValidationErrors(res.validationErrors);
      setSubmitting(false);
    } else if (res.error) {
      setServerError(res.error);
      setSubmitting(false);
    } else {
      setShowForm(false);
      setSubmitting(false);
      fetchMakers();
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const res = await deleteMaker(id);
    if (res.error) {
      alert(res.error);
    } else {
      setDeleteConfirmId(null);
      fetchMakers();
    }
    setDeletingId(null);
  }

  const filtered = makers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-espresso">Makers</h1>
          <p className="font-sans text-sm text-bark mt-1">
            Manage the artisans, creators, and workshops in the collective.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-espresso hover:bg-gold text-white px-6 py-3 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors"
          >
            <Plus size={16} /> Add Maker
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white shadow-card border border-border/40 p-6 max-w-xl">
          <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-6">
            <h2 className="font-serif text-xl font-bold text-espresso">
              {isEdit ? `Edit Maker: ${name}` : "New Maker"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-bark hover:text-espresso"
            >
              <X size={20} />
            </button>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 font-sans text-xs">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Maker Portrait Upload */}
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark block mb-2">
                Maker Photo
              </span>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-sand/40 border border-border/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setPhotoUrl("");
                        }}
                        className="absolute top-1 right-1 h-5 w-5 bg-white/90 rounded-full flex items-center justify-center shadow"
                      >
                        <X size={10} className="text-red-600" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon size={24} className="text-bark/30" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-gold" />
                    </div>
                  )}
                </div>
                <div>
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
                    className="bg-cream hover:bg-sand border border-border/40 px-4 py-2 rounded-lg font-sans text-xs font-semibold text-espresso transition-colors"
                  >
                    <Upload size={12} className="inline mr-1.5" /> Upload Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Name */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Maker Name *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. John Doe Crafts"
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {validationErrors.name && (
                <span className="text-xs text-red-600 font-sans">{validationErrors.name}</span>
              )}
            </label>

            {/* ID / Slug */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Maker ID (slug) *
              </span>
              <input
                type="text"
                value={makerId}
                onChange={(e) => setMakerId(e.target.value)}
                disabled={isEdit}
                placeholder="e.g. john-doe"
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-sand/30 disabled:text-bark/60 disabled:cursor-not-allowed"
              />
              {validationErrors.id && (
                <span className="text-xs text-red-600 font-sans">{validationErrors.id}</span>
              )}
            </label>

            {/* Bio */}
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                Bio
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Artist or collective background story..."
                className="rounded-xl border border-border/60 bg-white px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </label>

            <div className="flex items-center gap-3 pt-3 border-t border-border/30">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="bg-espresso hover:bg-gold text-white font-sans text-xs font-semibold px-5 py-3 rounded-pill transition-colors flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {isEdit ? "Update Maker" : "Create Maker"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-bark hover:text-espresso font-sans text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search makers..."
          className="w-full rounded-xl border border-border/60 bg-white pl-10 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Main List Table */}
      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-gold" />
            <span className="font-sans text-sm text-bark">Loading makers...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto text-bark/30 mb-2" size={32} />
            <p className="font-sans text-sm text-bark italic">No makers found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-border/40 bg-cream/60">
              <tr>
                {["Photo", "Name / ID", "Bio", "Actions"].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-4 font-sans text-[11px] font-semibold uppercase tracking-widest text-bark"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map((maker) => {
                const img = getProductImageUrl(maker.photo_url);
                return (
                  <tr key={maker.id} className="hover:bg-cream/25 transition-colors">
                    <td className="px-5 py-3 w-20">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-sand border border-border/10">
                        {img ? (
                          <img src={img} alt={maker.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-sand to-border/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-espresso">{maker.name}</p>
                      <p className="font-sans text-[11px] text-bark">{maker.id}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate font-sans text-sm text-bark">
                      {maker.bio || <em className="opacity-40">No bio provided</em>}
                    </td>
                    <td className="px-5 py-4 w-40">
                      {deleteConfirmId === maker.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(maker.id)}
                            disabled={deletingId === maker.id}
                            className="text-red-600 hover:text-red-700 font-sans text-xs font-semibold"
                          >
                            {deletingId === maker.id ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-bark hover:text-espresso font-sans text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEdit(maker)}
                            className="inline-flex items-center gap-1 text-espresso hover:text-gold transition-colors font-sans text-xs font-semibold"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(maker.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-sans text-xs font-semibold"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
