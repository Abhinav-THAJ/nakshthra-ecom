"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function fetchOrders(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/admin/api/v1/orders?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  CONFIRMED:  { bg: "rgba(59,130,246,0.12)",  color: "#2563eb" },
  PROCESSING: { bg: "var(--brand-100)",  color: "var(--brand-600)" },
  SHIPPED:    { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  DELIVERED:  { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  CANCELLED:  { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
  REFUNDED:   { bg: "rgba(107,114,128,0.12)", color: "#4b5563" },
  ON_HOLD:    { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = {
    page: String(page), limit: "20",
    ...(search && { search }),
    ...(status !== "ALL" && { status }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
    placeholderData: (prev) => prev,
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Orders</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {meta?.total ? `${meta.total.toLocaleString()} total orders` : "Manage all customer orders"}
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "var(--gradient)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)", fontFamily: "inherit" }}>
          <Plus size={14} /> New Order
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 340, boxShadow: "var(--shadow-sm)" }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order # or customer..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          {STATUSES.map((s) => {
            const active = status === s;
            const st = STATUS_STYLES[s];
            return (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap", background: active ? (s === "ALL" ? "var(--gradient)" : st?.bg || "var(--bg-app)") : "transparent", color: active ? (s === "ALL" ? "white" : st?.color || "var(--text-primary)") : "var(--text-muted)" }}>
                {s === "ALL" ? "All Orders" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflowX: "auto", boxShadow: "var(--shadow-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
              {["Order", "Customer", "Status", "Items", "Total", "Date"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} style={{ padding: "12px 16px" }}>
                      <div className="skeleton" style={{ height: 14, width: j === 0 ? 100 : 110 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={6}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
                  <Package size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No orders found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
                </div>
              </td></tr>
            ) : (
              orders.map((order: any, i: number) => {
                const s = STATUS_STYLES[order.status] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    onClick={() => (window.location.href = `/orders/${order.id}`)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-app)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-600)" }}>{order.orderNumber}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{order.customer?.firstName} {order.customer?.lastName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.customer?.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: s.bg, color: s.color }}>
                        {order.status.toLowerCase().replace("_"," ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{order._count?.orderItems || 0} items</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{formatDate(order.createdAt)}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-app)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages} · {meta.total} results</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { icon: <ChevronLeft size={14}/>, onClick: () => setPage(p => p-1), disabled: !meta.hasPrev },
                { icon: <ChevronRight size={14}/>, onClick: () => setPage(p => p+1), disabled: !meta.hasNext },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                  style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: btn.disabled ? "var(--text-muted)" : "var(--text-primary)", cursor: btn.disabled ? "not-allowed" : "pointer", opacity: btn.disabled ? 0.5 : 1 }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

