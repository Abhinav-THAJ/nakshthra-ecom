"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Package, Plus, Search, ChevronLeft, ChevronRight, AlertTriangle, X, Check, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function fetchProducts(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/products?${q}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function createProduct(data: any) {
  const res = await fetch("/api/v1/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create product");
  }
  return res.json();
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [karatage, setKaratage] = useState("22");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products", { search, page }],
    queryFn: () => fetchProducts({ page: String(page), limit: "15", ...(search && { search }) }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || "Something went wrong");
    },
  });

  const products = data?.data || [];
  const meta = data?.meta;

  const resetForm = () => {
    setName("");
    setSku("");
    setBasePrice("");
    setInventory("");
    setKaratage("22");
    setWeight("");
    setDescription("");
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !sku.trim() || !basePrice || !inventory) {
      setFormError("Please fill in all required fields.");
      return;
    }

    createMutation.mutate({
      name,
      sku,
      basePrice: parseFloat(basePrice),
      inventory: parseInt(inventory, 10),
      karatage: karatage ? parseInt(karatage, 10) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      description: description || undefined,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Products & Stock</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {meta?.total ? `${meta.total.toLocaleString()} products in inventory` : "Manage products, karatage, and stock levels"}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 10,
            background: "var(--gradient)",
            color: "white",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)",
            fontFamily: "inherit",
          }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", maxWidth: 380, boxShadow: "var(--shadow-sm)" }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }}
        />
      </div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-card)" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
              {["Product Details", "SKU", "Karatage", "Weight", "Stock Status", "Base Price", "Created"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} style={{ padding: "12px 16px" }}>
                      <div className="skeleton" style={{ height: 14, width: j === 0 ? 180 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", color: "var(--text-muted)" }}>
                    <Package size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No products found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Add a product to get started</div>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p: any, i: number) => {
                const stock = p.inventory;
                let stockColor = "#059669"; // Green
                let stockBg = "rgba(16,185,129,0.12)";
                let stockLabel = "In Stock";

                if (stock === 0) {
                  stockColor = "#dc2626"; // Red
                  stockBg = "rgba(239,68,68,0.12)";
                  stockLabel = "Out of Stock";
                } else if (stock <= 10) {
                  stockColor = "#d97706"; // Amber
                  stockBg = "rgba(245,158,11,0.12)";
                  stockLabel = `Low Stock (${stock})`;
                } else {
                  stockLabel = `${stock} Units`;
                }

                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-app)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-600)", flexShrink: 0 }}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace", color: "var(--text-secondary)" }}>{p.sku}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)" }}>
                      {p.karatage ? `${p.karatage}K` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)" }}>
                      {p.weight ? `${p.weight}g` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: stockBg, color: stockColor }}>
                        {stockLabel}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(p.basePrice)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{formatDate(p.createdAt)}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-app)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!meta.hasPrev}
                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: !meta.hasPrev ? "var(--text-muted)" : "var(--text-primary)", cursor: !meta.hasPrev ? "not-allowed" : "pointer", opacity: !meta.hasPrev ? 0.5 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNext}
                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", color: !meta.hasNext ? "var(--text-muted)" : "var(--text-primary)", cursor: !meta.hasNext ? "not-allowed" : "pointer", opacity: !meta.hasNext ? 0.5 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Product Modal */}
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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Add New Product</h3>
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
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 22K Gold Wedding Ring"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>SKU *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. RING-22K-001"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Base Price *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="e.g. 45000"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      placeholder="e.g. 25"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Karatage (K)</label>
                    <select
                      value={karatage}
                      onChange={(e) => setKaratage(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "white", fontFamily: "inherit" }}
                    >
                      <option value="">None</option>
                      <option value="18">18K</option>
                      <option value="22">22K</option>
                      <option value="24">24K</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 8.5"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the product..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit" }}
                  />
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
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Product
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
