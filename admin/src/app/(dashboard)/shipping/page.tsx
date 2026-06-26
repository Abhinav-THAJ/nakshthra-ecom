"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Truck, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

async function fetchShipments(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/admin/api/v1/shipping?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUS_CONFIG = {
  PENDING:           { color: "#d97706", bg: "rgba(245,158,11,0.12)",   label: "Pending" },
  LABEL_CREATED:     { color: "#2563eb", bg: "rgba(59,130,246,0.12)",   label: "Label Created" },
  PICKED_UP:         { color: "var(--brand-600)", bg: "var(--brand-100)",   label: "Picked Up" },
  IN_TRANSIT:        { color: "#0ea5e9", bg: "rgba(14,165,233,0.12)",   label: "In Transit" },
  OUT_FOR_DELIVERY:  { color: "#059669", bg: "rgba(16,185,129,0.12)",   label: "Out for Delivery" },
  DELIVERED:         { color: "#16a34a", bg: "rgba(22,163,74,0.12)",    label: "Delivered" },
  FAILED_DELIVERY:   { color: "#dc2626", bg: "rgba(239,68,68,0.12)",    label: "Failed Delivery" },
  RETURNED:          { color: "#ea580c", bg: "rgba(234,88,12,0.12)",   label: "Returned" },
  CANCELLED:         { color: "#4b5563", bg: "rgba(107,114,128,0.12)",  label: "Cancelled" },
};

export default function ShippingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["shipments", search, statusFilter, page],
    queryFn: () => fetchShipments({
      page: String(page), limit: "20",
      ...(search && { search }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    }),
    placeholderData: (p) => p,
  });

  const shipments = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Shipping</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Track shipments and manage delivery status</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 340, boxShadow: "var(--shadow-sm)" }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tracking # or order..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          {["ALL", ...Object.keys(STATUS_CONFIG)].map((s) => {
            const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0, background: active ? (s === "ALL" ? "var(--gradient)" : cfg?.bg || "var(--bg-app)") : "transparent", color: active ? (s === "ALL" ? "white" : cfg?.color || "var(--text-primary)") : "var(--text-muted)" }}>
                {s === "ALL" ? "All Shipments" : (cfg?.label || s)}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflowX: "auto", boxShadow: "var(--shadow-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
              {["Tracking #", "Order", "Customer", "Carrier", "Status", "Est. Delivery", "Last Update"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(7)].map((_, j) => <td key={j} style={{ padding: "12px 16px" }}><div className="skeleton" style={{ height: 14, width: j === 0 ? 120 : 90 }} /></td>)}
                </tr>
              ))
            ) : shipments.length === 0 ? (
              <tr><td colSpan={7}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
                  <Truck size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No shipments found</div>
                </div>
              </td></tr>
            ) : (
              shipments.map((shipment: any, i: number) => {
                const cfg = STATUS_CONFIG[shipment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                const lastEvent = shipment.trackingEvents?.[0];
                return (
                  <motion.tr key={shipment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--brand-600)", fontWeight: 600 }}>{shipment.trackingNumber || "—"}</div>
                      {shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>Track →</a>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{shipment.order?.orderNumber || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{shipment.order?.customer ? `${shipment.order.customer.firstName} ${shipment.order.customer.lastName}` : "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{shipment.carrierName || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{shipment.estimatedDelivery ? formatDate(shipment.estimatedDelivery) : "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{lastEvent ? formatRelativeTime(lastEvent.timestamp) : formatRelativeTime(shipment.updatedAt)}</td>
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



