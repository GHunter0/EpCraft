"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Tag,
  Check,
  X,
  Loader2,
  Send,
  User,
  Ruler,
  Paintbrush,
  Type,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";
import { declineRequest } from "../actions";

const STATUS_META = {
  pending_review: {
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending Review",
    icon: Clock,
  },
  quoted: {
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Quoted",
    icon: Tag,
  },
  accepted: {
    cls: "bg-green-50 text-green-700 border-green-200",
    label: "Accepted",
    icon: Check,
  },
  declined: {
    cls: "bg-red-50 text-red-700 border-red-200",
    label: "Declined",
    icon: X,
  },
};

export default function AdminCustomOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quote form state
  const [quotedPrice, setQuotedPrice] = useState("");
  const [quotedLeadTime, setQuotedLeadTime] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitMessageType, setSubmitMessageType] = useState("success");

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState("");
  const [declining, setDeclining] = useState(false);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First check admin status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setError("You do not have admin access.");
        setLoading(false);
        return;
      }

      // Fetch the custom order request with related data
      const { data, error: fetchErr } = await supabase
        .from("custom_order_requests")
        .select(
          `*,
           profile:profiles!custom_order_requests_user_id_fkey ( id, name, email, phone, address ),
           base_product:products!custom_order_requests_base_product_id_fkey ( id, name, price, image_url, wood_type, material )`
        )
        .eq("id", id)
        .single();

      if (fetchErr || !data) {
        setError("Custom order request not found.");
        setLoading(false);
        return;
      }

      setRequest(data);

      // Pre-fill form if already quoted
      if (data.quoted_price) setQuotedPrice(String(data.quoted_price));
      if (data.quoted_lead_time) setQuotedLeadTime(data.quoted_lead_time);
      if (data.admin_note) setAdminNote(data.admin_note);
    } catch (err) {
      console.error(err);
      setError("Failed to load request details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRequest();
    });
  }, [fetchRequest]);

  const handleDeclineRequest = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setDeclining(true);

    if (!rejectionReason.trim()) {
      setSubmitMessage("Please enter a reason for rejection.");
      setSubmitMessageType("error");
      setDeclining(false);
      return;
    }

    try {
      const result = await declineRequest(id, rejectionReason.trim());
      if (result.error) {
        setSubmitMessage(result.error);
        setSubmitMessageType("error");
      } else {
        setSubmitMessage("Request declined successfully.");
        setSubmitMessageType("success");
        setRejectionReason("");
        await fetchRequest();
      }
    } catch (err) {
      console.error("Decline request failed:", err);
      setSubmitMessage("Failed to decline request.");
      setSubmitMessageType("error");
    } finally {
      setDeclining(false);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitting(true);

    const price = parseFloat(quotedPrice);
    if (isNaN(price) || price <= 0) {
      setSubmitMessage("Please enter a valid positive price.");
      setSubmitMessageType("error");
      setSubmitting(false);
      return;
    }
    if (!quotedLeadTime.trim()) {
      setSubmitMessage("Lead time is required.");
      setSubmitMessageType("error");
      setSubmitting(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Confirm request is still pending_review
      const { data: currentReq } = await supabase
        .from("custom_order_requests")
        .select("status")
        .eq("id", id)
        .single();

      if (currentReq?.status !== "pending_review") {
        setSubmitMessage(
          `Request is already '${currentReq?.status}' — cannot re-quote.`
        );
        setSubmitMessageType("error");
        setSubmitting(false);
        return;
      }

      const { error: updateErr } = await supabase
        .from("custom_order_requests")
        .update({
          status: "quoted",
          quoted_price: price,
          quoted_lead_time: quotedLeadTime.trim(),
          admin_note: adminNote.trim() || null,
          updated_by: user.id,
        })
        .eq("id", id);

      if (updateErr) {
        throw updateErr;
      }

      setSubmitMessage("Quote submitted successfully! Verifying end-to-end connection...");
      setSubmitMessageType("success");

      // Refresh the request data
      await fetchRequest();

      // === End-to-end verification ===
      // Verify the customer can actually see this quote on their account page
      // by re-fetching the same record and confirming status = 'quoted'
      await verifyEndToEnd();
    } catch (err) {
      console.error("Quote submission failed:", err);
      setSubmitMessage(err.message || "Failed to submit quote.");
      setSubmitMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyEndToEnd = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      // Small delay to allow any DB triggers / replication to settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Re-fetch the record to verify the write persisted
      const { data: verifyReq, error: verifyErr } = await supabase
        .from("custom_order_requests")
        .select("id, status, quoted_price, quoted_lead_time, admin_note, user_id")
        .eq("id", id)
        .single();

      if (verifyErr) {
        setVerificationResult({
          success: false,
          message: `Verification query failed: ${verifyErr.message}`,
        });
        return;
      }

      if (verifyReq.status !== "quoted") {
        setVerificationResult({
          success: false,
          message: `Status is '${verifyReq.status}' instead of 'quoted'. The write may not have persisted.`,
        });
        return;
      }

      // Verify from the customer's perspective — the account page queries
      // custom_order_requests filtered by user_id. We simulate that query.
      const { data: customerView, error: custErr } = await supabase
        .from("custom_order_requests")
        .select("id, status, quoted_price, quoted_lead_time, admin_note")
        .eq("id", id)
        .eq("user_id", verifyReq.user_id)
        .single();

      if (custErr || !customerView) {
        setVerificationResult({
          success: false,
          message: `Customer-side query failed: ${custErr?.message || "Record not found for user"}. The customer may not see this quote.`,
        });
        return;
      }

      if (
        customerView.status === "quoted" &&
        Number(customerView.quoted_price) === parseFloat(quotedPrice) &&
        customerView.quoted_lead_time === quotedLeadTime.trim()
      ) {
        setVerificationResult({
          success: true,
          message:
            "End-to-end verified! The customer will see this quote on their account page with the correct price, lead time, and note. Accept/Decline buttons are active on their side.",
        });
      } else {
        setVerificationResult({
          success: false,
          message: `Data mismatch: status=${customerView.status}, price=${customerView.quoted_price}, lead_time=${customerView.quoted_lead_time}`,
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationResult({
        success: false,
        message: `Verification error: ${err.message}`,
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-3 font-sans text-bark">Loading request...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="font-sans text-base text-red-600">{error}</p>
        <Link
          href="/admin/custom-orders"
          className="font-sans text-sm text-espresso hover:text-gold font-semibold"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  if (!request) return null;

  const statusMeta = STATUS_META[request.status] ?? {
    cls: "bg-sand text-bark border-border/40",
    label: request.status,
    icon: Clock,
  };
  const StatusIcon = statusMeta.icon;
  const isPendingReview = request.status === "pending_review";

  const detailFields = [
    {
      label: "Finish",
      value: request.finish,
      icon: Paintbrush,
      accent: "text-espresso",
    },
    {
      label: "Dimension",
      value: request.dimension,
      icon: Ruler,
      accent: "text-espresso",
    },
    {
      label: "Engraving Text",
      value: request.engraving_text
        ? `"${request.engraving_text}"`
        : null,
      icon: Type,
      accent: "text-gold italic",
    },
    {
      label: "Font",
      value: request.font,
      icon: FileText,
      accent: "text-espresso",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Breadcrumb / Back */}
      <Link
        href="/admin/custom-orders"
        className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-bark hover:text-espresso transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Custom Orders
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 border-b border-border/30">
          <div>
            <h1 className="font-serif text-3xl font-bold text-espresso">
              Custom Request
            </h1>
            <p className="font-sans text-xs text-bark mt-1">
              ID: {request.id}
            </p>
            <p className="font-sans text-xs text-bark">
              Submitted:{" "}
              {new Date(request.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 font-sans text-sm font-semibold ${statusMeta.cls}`}
          >
            <StatusIcon size={14} />
            {statusMeta.label}
          </span>
        </div>

        {/* Customer Info */}
        <div className="p-8 border-b border-border/30 bg-cream/30">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso mb-4">
            <User size={18} className="text-gold" />
            Customer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                Name
              </p>
              <p className="font-sans text-sm text-ink mt-1">
                {request.profile?.name || "—"}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                Email
              </p>
              <p className="font-sans text-sm text-ink mt-1">
                {request.profile?.email || "—"}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                Phone
              </p>
              <p className="font-sans text-sm text-ink mt-1">
                {request.profile?.phone || "—"}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                Address
              </p>
              <p className="font-sans text-sm text-ink mt-1">
                {request.profile?.address || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="p-8 border-b border-border/30">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso mb-6">
            <Package size={18} className="text-gold" />
            Request Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {detailFields.map((field) => {
              const FieldIcon = field.icon;
              return (
                <div
                  key={field.label}
                  className="flex items-start gap-3 rounded-xl bg-cream/40 border border-border/20 p-4"
                >
                  <div className="mt-0.5 rounded-lg bg-white p-2 shadow-soft border border-border/20">
                    <FieldIcon size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                      {field.label}
                    </p>
                    <p className={`font-sans text-sm mt-1 ${field.accent}`}>
                      {field.value || (
                        <span className="text-bark/40 not-italic">
                          Not specified
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Base Product */}
          {request.base_product && (
            <div className="mt-6 rounded-xl bg-cream/40 border border-border/20 p-5">
              <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold mb-2">
                Base Product
              </p>
              <div className="flex items-center gap-4">
                {request.base_product.image_url && (
                  <img
                    src={request.base_product.image_url}
                    alt={request.base_product.name}
                    className="h-16 w-16 rounded-lg object-cover border border-border/20"
                  />
                )}
                <div>
                  <p className="font-serif text-base font-bold text-espresso">
                    {request.base_product.name}
                  </p>
                  <p className="font-sans text-xs text-bark mt-0.5">
                    Base price: {formatPrice(request.base_product.price)}
                    {request.base_product.wood_type &&
                      ` · ${request.base_product.wood_type}`}
                    {request.base_product.material &&
                      ` · ${request.base_product.material}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quote Details — shown if already quoted or declined */}
        {(request.status === "quoted" || request.status === "accepted" || request.status === "declined") && (
          <div className="p-8 border-b border-border/30 bg-sand/20">
            <h2 className="font-serif text-lg font-bold text-espresso mb-4">
              {request.status === "declined" ? "Rejection Details" : "Quote Details"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {request.status === "declined" ? (
                <div className="md:col-span-3">
                  <p className="font-sans text-xs uppercase tracking-widest text-red-500 font-semibold">
                    Reason for Rejection
                  </p>
                  <p className="font-sans text-sm text-red-700 mt-1 italic">
                    {request.rejection_reason || "No reason provided."}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                      Quoted Price
                    </p>
                    <p className="font-serif text-2xl font-bold text-espresso mt-1">
                      {formatPrice(Number(request.quoted_price))}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                      Lead Time
                    </p>
                    <p className="font-sans text-sm font-semibold text-espresso mt-1">
                      {request.quoted_lead_time || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-bark font-semibold">
                      Admin Note
                    </p>
                    <p className="font-sans text-sm text-ink mt-1 italic">
                      {request.admin_note || "—"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quote & Rejection Form — only for pending_review */}
        {isPendingReview && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/30">
            {/* Submit Quote */}
            <div className="pb-8 md:pb-0 md:pr-8">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso mb-6">
                <Send size={18} className="text-gold" />
                Submit Quote
              </h2>
 
              {submitMessage && submitMessageType === "success" && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 font-sans">
                  {submitMessage}
                </div>
              )}
              {submitMessage && submitMessageType === "error" && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-sans">
                  {submitMessage}
                </div>
              )}
 
              <form onSubmit={handleSubmitQuote} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                      Quoted Price (LKR) *
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      placeholder="e.g. 12500"
                      className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </label>
 
                  <label className="flex flex-col gap-2">
                    <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                      Estimated Lead Time *
                    </span>
                    <input
                      type="text"
                      required
                      value={quotedLeadTime}
                      onChange={(e) => setQuotedLeadTime(e.target.value)}
                      placeholder="e.g. 3-4 weeks"
                      className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </label>
                </div>
 
                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    Admin Note (optional)
                  </span>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Any notes for the customer about this custom piece…"
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  />
                </label>
 
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 bg-espresso hover:bg-gold text-white px-8 py-3.5 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors disabled:opacity-50 w-fit"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {'Submit Quote & Move to "Quoted"'}
                    </>
                  )}
                </button>
              </form>
            </div>
 
            {/* Decline Request */}
            <div className="pt-8 md:pt-0 md:pl-8">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso mb-6">
                <X size={18} className="text-red-500" />
                Decline Request
              </h2>
 
              <form onSubmit={handleDeclineRequest} className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
                    Reason for Rejection *
                  </span>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Please specify why this custom design request cannot be fulfilled…"
                    className="rounded-xl border border-border/60 bg-white px-4 py-3.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  />
                </label>
 
                <button
                  type="submit"
                  disabled={declining}
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-pill font-sans text-sm font-semibold shadow-soft transition-colors disabled:opacity-50 w-fit"
                >
                  {declining ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Declining…
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      Decline Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* End-to-end verification result */}
        {(verifying || verificationResult) && (
          <div className="p-8 border-t border-border/30 bg-cream/30">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-espresso mb-4">
              <ShieldCheck size={18} className="text-green-600" />
              End-to-End Verification
            </h2>

            {verifying && (
              <div className="flex items-center gap-3 font-sans text-sm text-bark">
                <Loader2 size={16} className="animate-spin text-gold" />
                Verifying that the customer can see the quote on their account
                page…
              </div>
            )}

            {verificationResult && (
              <div
                className={`rounded-lg border p-4 text-sm font-sans ${
                  verificationResult.success
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  {verificationResult.success ? (
                    <Check size={16} className="mt-0.5 text-green-600 shrink-0" />
                  ) : (
                    <X size={16} className="mt-0.5 text-red-600 shrink-0" />
                  )}
                  <p>{verificationResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
