"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { UserPlus, Search, Shield, ChevronLeft, ChevronRight, X, Loader2, Check, AlertTriangle } from "lucide-react";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/utils";

async function fetchUsers(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/admin/api/v1/users?${q}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  "super-admin": { color: "var(--brand-600)", bg: "var(--brand-100)" },
  "admin":       { color: "#2563eb", bg: "rgba(59,130,246,0.12)" },
  "manager":     { color: "#059669", bg: "rgba(16,185,129,0.12)" },
  "finance":     { color: "#d97706", bg: "rgba(245,158,11,0.12)" },
  "operations":  { color: "#c2410c", bg: "rgba(234,88,12,0.12)" },
  "support":     { color: "#db2777", bg: "rgba(219,39,119,0.12)" },
  "marketing":   { color: "#0284c7", bg: "rgba(14,165,233,0.12)" },
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSlug, setRoleSlug] = useState("admin");

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch("/admin/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRoleSlug("admin");
      setFormError("");
    },
    onError: (error: any) => {
      setFormError(error.message || "An error occurred");
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["users", { search, page, roleFilter }],
    queryFn: () => fetchUsers({
      page: String(page), limit: "20",
      ...(search && { search }),
      ...(roleFilter !== "ALL" && { role: roleFilter }),
    }),
    placeholderData: (p) => p,
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!firstName || !lastName || !email || !password || !roleSlug) {
      setFormError("All fields are required");
      return;
    }
    createMutation.mutate({ firstName, lastName, email, password, roleSlug });
  };

  const roles = ["ALL", "super-admin", "admin", "manager", "finance", "operations", "support", "marketing"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>User Management</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {meta?.total ? `${meta.total} admin users` : "Manage admin users and roles"}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "var(--gradient)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)", fontFamily: "inherit" }}
        >
          <UserPlus size={14} /> Add User
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", minWidth: 260, boxShadow: "var(--shadow-sm)" }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          {roles.map((r) => {
            const cfg = ROLE_COLORS[r];
            const active = roleFilter === r;
            return (
              <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0, background: active ? (r === "ALL" ? "var(--gradient)" : cfg?.bg || "var(--bg-app)") : "transparent", color: active ? (r === "ALL" ? "white" : cfg?.color || "var(--text-primary)") : "var(--text-muted)" }}>
                {r === "ALL" ? "All Roles" : r.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
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
              {["User", "Email", "Role", "Status", "Last Active", "Joined"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(6)].map((_, j) => <td key={j} style={{ padding: "12px 16px" }}><div className="skeleton" style={{ height: 14, width: j === 0 ? 140 : 100 }} /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
                  <Shield size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No users found</div>
                </div>
              </td></tr>
            ) : (
              users.map((user: any, i: number) => {
                const primaryRole = user.userRoles?.[0]?.role;
                const roleStyle = ROLE_COLORS[primaryRole?.slug] || { color: "var(--text-muted)", bg: "var(--bg-app)" };
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-app)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{user.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {primaryRole ? (
                        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: roleStyle.bg, color: roleStyle.color, whiteSpace: "nowrap" }}>
                          {primaryRole.name}
                        </span>
                      ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: user.isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: user.isActive ? "#059669" : "#dc2626" }}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                      {formatDate(user.createdAt)}
                    </td>
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
                <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                  style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: btn.disabled ? "var(--text-muted)" : "var(--text-primary)", cursor: btn.disabled ? "not-allowed" : "pointer", opacity: btn.disabled ? 0.5 : 1 }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add User Modal */}
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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Add New Admin User</h3>
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
                <div className="form-grid-2">
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Role *</label>
                  <select
                    value={roleSlug}
                    onChange={(e) => setRoleSlug(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "white", fontFamily: "inherit" }}
                  >
                    <option value="super-admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="support">Support</option>
                    <option value="marketing">Marketing</option>
                  </select>
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
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save User
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



