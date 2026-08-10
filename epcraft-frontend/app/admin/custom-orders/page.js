import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, Filter, Clock, Tag, Check, X } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
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

const ALL_STATUSES = ["pending_review", "quoted", "accepted", "declined"];

export default async function AdminCustomOrdersPage({ searchParams }) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const filterStatus = resolvedSearchParams?.status || "";

  let query = supabase
    .from("custom_order_requests")
    .select(
      `id, status, finish, dimension, engraving_text, font, quoted_price, quoted_lead_time, created_at,
       base_product_id,
       profile:profiles!custom_order_requests_user_id_fkey ( name, email ),
       base_product:products!custom_order_requests_base_product_id_fkey ( name )`
    );

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  // pending_review sorts alphabetically before "quoted" — ascending gives us pending_review first.
  // Within that group oldest first (ascending created_at).
  query = query
    .order("status", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: allRows, error: fetchErr } = await query;

  if (fetchErr) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 font-sans text-sm">
        <h2 className="font-serif text-lg font-bold mb-1">Failed to load custom order requests</h2>
        <p>{fetchErr.message}</p>
      </div>
    );
  }

  const requests = allRows || [];
  const pendingCount = requests.filter(
    (r) => r.status === "pending_review"
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-espresso">
            Custom Order Requests
          </h1>
          <p className="font-sans text-sm text-bark mt-1">
            {requests.length} request{requests.length !== 1 ? "s" : ""}
            {filterStatus ? ` · ${filterStatus.replace("_", " ")}` : ""}
            {pendingCount > 0 && !filterStatus && (
              <span className="ml-2 font-semibold text-amber-700">
                — {pendingCount} awaiting quote
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-bark uppercase tracking-widest mr-2">
          <Filter size={14} /> Filter:
        </span>
        <Link
          href="/admin/custom-orders"
          className={`rounded-pill px-4 py-1.5 font-sans text-xs font-semibold border transition-colors ${
            !filterStatus
              ? "bg-espresso text-white border-espresso"
              : "bg-white text-bark border-border/40 hover:border-espresso hover:text-espresso"
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => {
          const meta = STATUS_STYLES[s];
          return (
            <Link
              key={s}
              href={`/admin/custom-orders?status=${s}`}
              className={`rounded-pill px-4 py-1.5 font-sans text-xs font-semibold border transition-colors ${
                filterStatus === s
                  ? "bg-espresso text-white border-espresso"
                  : "bg-white text-bark border-border/40 hover:border-espresso hover:text-espresso"
              }`}
            >
              {meta?.label ?? s}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card border border-border/40 overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-sans text-base text-bark italic">
              No custom order requests found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border/40 bg-cream/60">
                <tr>
                  {[
                    "Customer",
                    "Finish · Dimension",
                    "Engraving",
                    "Base Product",
                    "Status",
                    "Quoted Price",
                    "Submitted",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-sans text-[11px] font-semibold uppercase tracking-widest text-bark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {requests.map((req) => {
                  const meta = STATUS_STYLES[req.status] ?? {
                    cls: "bg-sand text-bark border-border/40",
                    label: req.status,
                    icon: Clock,
                  };
                  const StatusIcon = meta.icon;
                  return (
                    <tr
                      key={req.id}
                      className={`group hover:bg-cream/40 transition-colors ${
                        req.status === "pending_review"
                          ? "border-l-2 border-l-amber-400"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm font-semibold text-espresso">
                          {req.profile?.name || "—"}
                        </p>
                        <p className="font-sans text-[11px] text-bark">
                          {req.profile?.email || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm text-ink">
                          {req.finish || "—"}
                        </p>
                        <p className="font-sans text-[11px] text-bark">
                          {req.dimension || "—"} · {req.font || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <p className="font-sans text-sm text-gold italic truncate">
                          {req.engraving_text ? (
                            `"${req.engraving_text}"`
                          ) : (
                            <span className="text-bark/40 not-italic">
                              None
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm text-ink">
                          {req.base_product?.name || (
                            <span className="text-bark/40 italic text-xs">
                              No base product
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-sans text-[11px] font-semibold ${meta.cls}`}
                        >
                          <StatusIcon size={11} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-serif text-sm font-bold text-espresso">
                        {req.quoted_price ? (
                          `LKR ${Number(req.quoted_price).toLocaleString()}`
                        ) : (
                          <span className="font-sans text-xs text-bark/50 font-normal">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-bark">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/custom-orders/${req.id}`}
                          className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-espresso hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {req.status === "pending_review" ? "Review" : "View"}{" "}
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
