"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { CreditCard, RefreshCw, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function fetchTransactions(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/payments/transactions?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchRefunds(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/payments/refunds?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card", DEBIT_CARD: "Debit Card", PAYPAL: "PayPal",
  BANK_TRANSFER: "Bank Transfer", CRYPTO: "Crypto", CASH_ON_DELIVERY: "COD", STORE_CREDIT: "Store Credit",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  COMPLETED:  { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  PENDING:    { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  PROCESSING: { bg: "var(--brand-100)",  color: "var(--brand-600)" },
  FAILED:     { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
  REFUNDED:   { bg: "rgba(107,114,128,0.12)", color: "#4b5563" },
  APPROVED:   { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  REJECTED:   { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "refunds">("transactions");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const txQuery = useQuery({
    queryKey: ["transactions", { search, page, statusFilter }],
    queryFn: () => fetchTransactions({ page: String(page), limit: "20", ...(search && { search }), ...(statusFilter !== "ALL" && { status: statusFilter }) }),
    enabled: activeTab === "transactions", placeholderData: (p) => p,
  });

  const refundQuery = useQuery({
    queryKey: ["refunds", { page, statusFilter }],
    queryFn: () => fetchRefunds({ page: String(page), limit: "20", ...(statusFilter !== "ALL" && { status: statusFilter }) }),
    enabled: activeTab === "refunds", placeholderData: (p) => p,
  });

  const activeData = activeTab === "transactions" ? txQuery : refundQuery;
  const items = activeData.data?.data || [];
  const meta = activeData.data?.meta;

  const tabs = [
    { key: "transactions", label: "Transactions", icon: CreditCard },
    { key: "refunds", label: "Refunds", icon: RefreshCw },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Payments</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage transactions, refunds, and financial analytics</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", width: "fit-content" }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); setStatusFilter("ALL"); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", background: active ? "var(--bg-app)" : "transparent", color: active ? "var(--text-primary)" : "var(--text-muted)", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
              <tab.icon size={15} style={{ color: active ? "var(--brand-600)" : "inherit" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {activeTab === "transactions" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 340, boxShadow: "var(--shadow-sm)" }}>
            <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by transaction ID..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          {["ALL", "PENDING", "COMPLETED", "FAILED", "REFUNDED"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap", background: statusFilter === s ? "var(--bg-app)" : "transparent", color: statusFilter === s ? "var(--text-primary)" : "var(--text-muted)" }}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
              {(activeTab === "transactions"
                ? ["Transaction ID", "Order", "Customer", "Method", "Amount", "Status", "Date"]
                : ["Refund ID", "Order", "Customer", "Amount", "Reason", "Status", "Date"]
              ).map((h) => <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {activeData.isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(7)].map((_, j) => <td key={j} style={{ padding: "12px 16px" }}><div className="skeleton" style={{ height: 14, width: j === 0 ? 130 : 100 }} /></td>)}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={7}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
                  <AlertCircle size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No {activeTab} found</div>
                </div>
              </td></tr>
            ) : (
              items.map((item: any, i: number) => {
                const style = STATUS_STYLES[item.status] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{(item.transactionId || item.id || "").slice(0, 16)}…</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--brand-600)" }}>{item.order?.orderNumber || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{item.order?.customer ? `${item.order.customer.firstName} ${item.order.customer.lastName}` : "—"}</td>
                    {activeTab === "transactions" ? (
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{METHOD_LABELS[item.method] || item.method}</td>
                    ) : (
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", maxWidth: 180 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.reason}</div></td>
                    )}
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(item.amount)}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: style.bg, color: style.color }}>{item.status.toLowerCase()}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{formatDate(item.createdAt)}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-app)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ icon: <ChevronLeft size={14}/>, onClick: () => setPage(p => p-1), disabled: !meta.hasPrev },
                { icon: <ChevronRight size={14}/>, onClick: () => setPage(p => p+1), disabled: !meta.hasNext }].map((btn, i) => (
                <button key={i} onClick={btn.onClick} disabled={btn.disabled} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: btn.disabled ? "var(--text-muted)" : "var(--text-primary)", cursor: btn.disabled ? "not-allowed" : "pointer", opacity: btn.disabled ? 0.5 : 1 }}>{btn.icon}</button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
