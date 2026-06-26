"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  IndianRupee, ShoppingCart, Users, RotateCcw,
  TrendingUp, TrendingDown, Eye, ArrowRight,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";

/* ─── Stats card color configs ──────────────── */
const STAT_CARDS = [
  {
    title: "Total Revenue",
    key: "totalRevenue",
    changeKey: "revenueGrowth",
    icon: IndianRupee,
    format: (v: number) => formatCurrency(v),
    gradient: "var(--gradient)",
    bg: "var(--brand-50)",
    iconColor: "var(--brand-600)",
  },
  {
    title: "Total Orders",
    key: "totalOrders",
    changeKey: "ordersGrowth",
    icon: ShoppingCart,
    format: (v: number) => String(v),
    gradient: "linear-gradient(135deg,#ec4899,#f472b6)",
    bg: "rgba(236,72,153,0.08)",
    iconColor: "#ec4899",
  },
  {
    title: "New Customers",
    key: "totalCustomers",
    changeKey: "customersGrowth",
    icon: Users,
    format: (v: number) => String(v),
    gradient: "linear-gradient(135deg,#06b6d4,#38bdf8)",
    bg: "rgba(6,182,212,0.08)",
    iconColor: "#0891b2",
  },
  {
    title: "Refund Rate",
    key: "refundRate",
    changeKey: "refundRateChange",
    icon: RotateCcw,
    format: (v: number) => `${v.toFixed(1)}%`,
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    bg: "rgba(245,158,11,0.08)",
    iconColor: "#d97706",
    invert: true,
  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", PROCESSING: "var(--brand-500)",
  SHIPPED: "#10b981", DELIVERED: "#059669", CANCELLED: "#ef4444", REFUNDED: "#9ca3af",
};

async function fetchDashboard() {
  const res = await fetch("/admin/api/v1/analytics/overview");
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return json.data;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboard,
    refetchInterval: 60000,
  });

  const stats = data?.stats;
  const revenueChart = data?.revenueChart || [];
  const orderDist = data?.orderDistribution || [];
  const recentOrders = data?.recentOrders || [];
  const recentActivity = data?.recentActivity || [];
  const customerGrowth = data?.customerGrowth || [];

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48, maxWidth: 480, margin: "40px auto" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Database not connected</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Run your PostgreSQL instance and apply migrations to see live data.
          <br />
          <code style={{ fontSize: 12, background: "var(--bg-app)", padding: "2px 6px", borderRadius: 4, marginTop: 8, display: "inline-block" }}>
            npm run db:migrate && npm run db:seed
          </code>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
          {formatDate(new Date(), "EEEE, MMMM dd, yyyy")} — Welcome back!
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {STAT_CARDS.map((card, i) => {
          const value = stats?.[card.key as keyof typeof stats];
          const change = stats?.[card.changeKey as keyof typeof stats] as number | undefined;
          const isPos = card.invert ? (change || 0) <= 0 : (change || 0) >= 0;
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              className="card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{card.title}</span>
                <div
                  className="icon-blob"
                  style={{ background: card.bg, width: 36, height: 36, borderRadius: 10 }}
                >
                  <Icon size={15} style={{ color: card.iconColor }} />
                </div>
              </div>
              {isLoading ? (
                <>
                  <div className="skeleton" style={{ height: 28, width: "55%" }} />
                  <div className="skeleton" style={{ height: 14, width: "40%" }} />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    {value !== undefined ? card.format(Number(value)) : "—"}
                  </div>
                  {change !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {isPos
                        ? <TrendingUp size={12} style={{ color: "#10b981" }} />
                        : <TrendingDown size={12} style={{ color: "#ef4444" }} />}
                      <span style={{ fontSize: 12, color: isPos ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                        {Math.abs(change).toFixed(1)}%
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>vs last month</span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Revenue Area Chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Revenue Overview</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Last 30 days performance</div>
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, padding: 3 }}>
              {["7D", "30D", "90D"].map((d) => (
                <button key={d} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: d === "30D" ? "var(--gradient)" : "transparent", color: d === "30D" ? "white" : "var(--text-muted)" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? <div className="skeleton" style={{ height: 240 }} /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--text-primary)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                  formatter={(v: any) => [formatCurrency(Number(v)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--brand-500)" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "var(--brand-600)" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Order Distribution */}
        <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Order Status</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Distribution</div>
          {isLoading ? <div className="skeleton" style={{ height: 240 }} /> : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={orderDist} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3}>
                    {orderDist.map((e: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[e.status] || "var(--brand-500)"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {orderDist.slice(0, 5).map((s: any) => (
                  <div key={s.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[s.status] || "var(--brand-500)", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {s.status.charAt(0) + s.status.slice(1).toLowerCase().replace("_"," ")}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Orders */}
        <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Recent Orders</div>
            <a href="/orders" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--brand-600)", textDecoration: "none", fontWeight: 600 }}>
              View All <ArrowRight size={12} />
            </a>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(5)].map((_,i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No orders yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentOrders.map((order: any) => (
                <a key={order.id} href={`/orders/${order.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--bg-app)", textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {getInitials(order.customer?.firstName||"", order.customer?.lastName||"")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.customer?.firstName} {order.customer?.lastName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.orderNumber}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <StatusPill status={order.status} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", minWidth: 70, textAlign: "right" }}>
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Customer Growth Bar Chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Customer Growth</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>New customers — last 30 days</div>

          {isLoading ? <div className="skeleton" style={{ height: 220 }} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={customerGrowth.filter((_: any, i: number) => i % 3 === 0)} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-500)" />
                    <stop offset="100%" stopColor="var(--brand-400)" />
                  </linearGradient>
                </defs>
                <Bar dataKey="newCustomers" fill="url(#barGrad)" radius={[4,4,0,0]} name="New Customers" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────── */
const STATUS_PILL_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  CONFIRMED:  { bg: "rgba(59,130,246,0.12)",  color: "#2563eb" },
  PROCESSING: { bg: "var(--brand-100)",  color: "var(--brand-600)" },
  SHIPPED:    { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  DELIVERED:  { bg: "rgba(16,185,129,0.12)",  color: "#059669" },
  CANCELLED:  { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
  REFUNDED:   { bg: "rgba(107,114,128,0.12)", color: "#4b5563" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_PILL_STYLES[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.04em",
      background: s.bg, color: s.color,
    }}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace("_"," ")}
    </span>
  );
}
