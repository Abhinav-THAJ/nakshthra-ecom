"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Search, Plug, Plus, CheckCircle, XCircle, AlertCircle, Clock, RefreshCw, Zap, X, Loader2, Check, AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

async function fetchIntegrations(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/admin/api/v1/integrations?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUS_CONFIG = {
  ACTIVE:   { icon: CheckCircle, color: "#059669", bg: "rgba(16,185,129,0.12)",  label: "Active" },
  INACTIVE: { icon: Clock,       color: "#4b5563", bg: "rgba(107,114,128,0.12)", label: "Inactive" },
  ERROR:    { icon: XCircle,     color: "#dc2626", bg: "rgba(239,68,68,0.12)",   label: "Error" },
  PENDING:  { icon: AlertCircle, color: "#d97706", bg: "rgba(245,158,11,0.12)",  label: "Pending" },
};

const TYPE_COLORS: Record<string, string> = {
  courier: "#2563eb",
  payment: "#059669",
  product: "var(--brand-600)",
  notification: "#d97706",
  analytics: "#db2777",
};

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState<"courier" | "payment" | "product" | "notification" | "analytics">("courier");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch("/admin/api/v1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to create integration");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setIsModalOpen(false);
      // Reset form
      setName("");
      setType("courier");
      setBaseUrl("");
      setApiKey("");
      setApiSecret("");
      setFormError("");
    },
    onError: (error: any) => {
      setFormError(error.message || "An error occurred");
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["integrations", typeFilter],
    queryFn: () => fetchIntegrations({ page: "1", limit: "20", ...(typeFilter !== "ALL" && { type: typeFilter }) }),
  });

  const integrations = data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name || !baseUrl || !type) {
      setFormError("Name, Base URL, and Type are required");
      return;
    }
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) {
      setFormError("Invalid name for generating identifier");
      return;
    }
    createMutation.mutate({
      name,
      slug,
      type,
      baseUrl,
      apiKey: apiKey || undefined,
      apiSecret: apiSecret || undefined,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Integrations</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage external API connections</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "var(--gradient)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)", fontFamily: "inherit" }}
        >
          <Plus size={14} /> Add Integration
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={18} color="var(--brand-600)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-600)", marginBottom: 4 }}>Future-proof Architecture</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            All external APIs connect through the Integration Layer. Future Product APIs will be connected here without frontend UI changes.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", width: "fit-content" }}>
        {["ALL", "courier", "payment", "product", "notification", "analytics"].map((type) => {
          const active = typeFilter === type;
          return (
            <button key={type} onClick={() => setTypeFilter(type)}
              style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", background: active ? "var(--bg-app)" : "transparent", color: active ? (type !== "ALL" ? TYPE_COLORS[type] : "var(--text-primary)") : "var(--text-muted)" }}>
              {type === "ALL" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 30 }} />
            </div>
          ))
        ) : integrations.length === 0 ? (
          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)", background: "#fff", border: "1px solid var(--border)", borderRadius: 14 }}>
            <Plug size={40} style={{ marginBottom: 14, opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No integrations configured</div>
            <div style={{ fontSize: 13 }}>Connect your first external API to get started</div>
          </div>
        ) : (
          integrations.map((integration: any, i: number) => {
            const statusCfg = STATUS_CONFIG[integration.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;
            const typeColor = TYPE_COLORS[integration.type] || "var(--brand-600)";
            return (
              <motion.div key={integration.id} className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ position: "relative", overflow: "hidden", paddingTop: 24 }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: typeColor }} />
                
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{integration.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{integration.type}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, background: statusCfg.bg }}>
                    <StatusIcon size={12} style={{ color: statusCfg.color }} />
                    <span style={{ fontSize: 11, color: statusCfg.color, fontWeight: 700 }}>{statusCfg.label}</span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, fontFamily: "monospace", background: "var(--bg-app)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {integration.baseUrl}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: "auto" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                    {integration.lastSyncAt ? `Synced ${formatRelativeTime(integration.lastSyncAt)}` : "Never synced"}
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "var(--shadow-sm)" }}>
                    <RefreshCw size={12} /> Test
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Integration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)" }}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Add New Integration</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 8, padding: "10px 12px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Integration Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. FedEx Shipping API"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "white", fontFamily: "inherit" }}
                    >
                      <option value="courier">Courier</option>
                      <option value="payment">Payment Gateway</option>
                      <option value="product">Product Sync</option>
                      <option value="notification">Notifications</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Base URL *</label>
                  <input
                    type="url"
                    required
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>API Key (Optional)</label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="key_..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>API Secret (Optional)</label>
                    <input
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "var(--gradient)",
                      color: "white",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: createMutation.isPending ? "not-allowed" : "pointer",
                      opacity: createMutation.isPending ? 0.7 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Integration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
