"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Star, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

async function fetchReviews(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/admin/api/v1/reviews?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUS_CONFIG = {
  PENDING:  { color: "#d97706", bg: "rgba(245,158,11,0.12)",  label: "Pending" },
  APPROVED: { color: "#059669", bg: "rgba(16,185,129,0.12)",  label: "Approved" },
  REJECTED: { color: "#dc2626", bg: "rgba(239,68,68,0.12)",   label: "Rejected" },
  FLAGGED:  { color: "#ea580c", bg: "rgba(234,88,12,0.12)",   label: "Flagged" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={13} fill={i <= rating ? "#f59e0b" : "none"} color={i <= rating ? "#f59e0b" : "#d1d5db"} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", statusFilter, page],
    queryFn: () => fetchReviews({ page: String(page), limit: "20", ...(statusFilter !== "ALL" && { status: statusFilter }) }),
    placeholderData: (p) => p,
  });

  const reviews = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Reviews Moderation</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage customer product reviews</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", width: "fit-content" }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED", "FLAGGED"].map((s) => {
          const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", background: active ? (s === "ALL" ? "var(--gradient)" : cfg?.bg || "var(--bg-app)") : "transparent", color: active ? (s === "ALL" ? "white" : cfg?.color || "var(--text-primary)") : "var(--text-muted)" }}>
              {s === "ALL" ? "All Reviews" : cfg?.label || s}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: "90%" }} />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
            <Star size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No {statusFilter.toLowerCase()} reviews</div>
          </div>
        ) : (
          reviews.map((review: any, i: number) => {
            const statusCfg = STATUS_CONFIG[review.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            return (
              <motion.div key={review.id} className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                      {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {review.customer?.firstName} {review.customer?.lastName}
                        </span>
                        <StarRating rating={review.rating} />
                        {review.isVerified && <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ Verified Buyer</span>}
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>• {formatRelativeTime(review.createdAt)}</span>
                      </div>
                      {review.title && <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{review.title}</div>}
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{review.content}</p>
                      
                      {review.moderationNote && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                          <AlertCircle size={14} style={{ color: "#dc2626", marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#dc2626" }}>Note: {review.moderationNote}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                    {review.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={async () => await fetch(`/admin/api/v1/reviews/${review.id}/moderate`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "APPROVED" }) })}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={async () => await fetch(`/admin/api/v1/reviews/${review.id}/moderate`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "REJECTED" }) })}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ icon: <ChevronLeft size={14}/>, onClick: () => setPage(p => p-1), disabled: !meta.hasPrev },
              { icon: <ChevronRight size={14}/>, onClick: () => setPage(p => p+1), disabled: !meta.hasNext }].map((btn, i) => (
              <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: btn.disabled ? "var(--text-muted)" : "var(--text-primary)", cursor: btn.disabled ? "not-allowed" : "pointer", opacity: btn.disabled ? 0.5 : 1 }}>
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
