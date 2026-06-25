"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, CheckCheck, AlertTriangle, Info } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

async function fetchNotifications(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/notifications?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const PRIORITY_STYLES: Record<string, { color: string; bg: string; icon: React.ComponentType<any> }> = {
  URGENT: { color: "#dc2626", bg: "rgba(239,68,68,0.12)",   icon: AlertTriangle },
  HIGH:   { color: "#d97706", bg: "rgba(245,158,11,0.12)",  icon: AlertTriangle },
  MEDIUM: { color: "var(--brand-600)", bg: "var(--brand-100)",  icon: Info },
  LOW:    { color: "#4b5563", bg: "rgba(107,114,128,0.12)", icon: Info },
};

const TYPE_ICONS: Record<string, string> = {
  ORDER_PLACED: "🛒", ORDER_SHIPPED: "📦", ORDER_DELIVERED: "✅",
  PAYMENT_RECEIVED: "💳", PAYMENT_FAILED: "❌", REFUND_INITIATED: "↩️", REFUND_COMPLETED: "✅",
  REVIEW_SUBMITTED: "⭐", SYSTEM_ALERT: "⚠️", INTEGRATION_ERROR: "🔌", CUSTOM: "🔔",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {
    page: "1", limit: "30",
    ...(filter === "unread" && { isRead: "false" }),
    ...(filter === "archived" && { isArchived: "true" }),
  };

  const { data, isLoading } = useQuery({ queryKey: ["notifications", filter], queryFn: () => fetchNotifications(params), refetchInterval: 30000 });

  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/v1/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markAllRead" }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data?.items || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const tabs = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "archived", label: "Archived" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Notifications</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-sm)", fontFamily: "inherit" }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", width: "fit-content" }}>
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{ padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", background: active ? "var(--bg-app)" : "transparent", color: active ? "var(--text-primary)" : "var(--text-muted)", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ display: "flex", gap: 16 }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: "80%" }} />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", color: "var(--text-muted)" }}>
            <Bell size={40} style={{ marginBottom: 16, opacity: 0.2 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>You're all caught up! 🎉</div>
          </div>
        ) : (
          notifications.map((notif: any, i: number) => {
            const pStyle = PRIORITY_STYLES[notif.priority] || PRIORITY_STYLES.MEDIUM;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card" style={{ display: "flex", alignItems: "flex-start", gap: 16, borderLeft: notif.isRead ? "1px solid var(--border)" : `3px solid ${pStyle.color}`, background: notif.isRead ? "#fff" : "rgba(212,175,55,0.03)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: pStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {TYPE_ICONS[notif.type] || "🔔"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: 14, color: "var(--text-primary)" }}>{notif.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: pStyle.color, boxShadow: `0 0 8px ${pStyle.color}` }} />}
                      <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", fontWeight: 500 }}>{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>{notif.body}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: pStyle.color }}>{notif.priority}</span>
                    <span style={{ fontSize: 10, color: "var(--border)" }}>•</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{notif.type.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
