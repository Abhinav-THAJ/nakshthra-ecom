"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, Save, Globe, Shield, Mail, Bell, Loader2, CheckCircle } from "lucide-react";

async function fetchSettings() {
  const res = await fetch("/admin/api/v1/settings");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  general: Globe, security: Shield, email: Mail, notifications: Bell,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [localChanges, setLocalChanges] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const mutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      fetch("/admin/api/v1/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setLocalChanges({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const settings = data?.data || {};
  const sections = Object.keys(settings);
  const currentSettings = settings[activeSection] || {};
  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Settings</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Configure your store preferences</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved && !hasChanges && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669", fontSize: 13, fontWeight: 600 }}>
              <CheckCircle size={14} /> Saved!
            </div>
          )}
          {hasChanges && (
            <button onClick={() => mutation.mutate(localChanges)} disabled={mutation.isPending}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "var(--gradient)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(212, 175, 55, 0.25)", fontFamily: "inherit" }}>
              {mutation.isPending ? <><Loader2 size={13} className="animate-spin"/>Saving...</> : <><Save size={13}/>Save Changes</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 8, boxShadow: "var(--shadow-card)" }}>
            {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: 4 }} />) :
              sections.map((section) => {
                const Icon = SECTION_ICONS[section] || Settings;
                const active = activeSection === section;
                return (
                  <button key={section} onClick={() => setActiveSection(section)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 9, marginBottom: 2, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s", background: active ? "var(--gradient)" : "transparent", color: active ? "white" : "var(--text-secondary)", textAlign: "left", boxShadow: active ? "0 4px 12px rgba(212, 175, 55, 0.2)" : "none" }}>
                    <Icon size={14} />
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                );
              })
            }
          </div>
        </div>

        {/* Panel */}
        <motion.div key={activeSection} className="card" style={{ flex: 1 }} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24, textTransform: "capitalize" }}>
            {activeSection} Settings
          </h2>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ height: 12, width: 100, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 40, borderRadius: 10 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {Object.entries(currentSettings).map(([key, setting]: [string, any]) => {
                const val = key in localChanges ? localChanges[key] : setting.value;
                const isBoolean = typeof setting.value === "boolean";
                const isNumber = typeof setting.value === "number";

                return (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                      {setting.label || key}
                    </label>
                    {isBoolean ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => setLocalChanges(p => ({ ...p, [key]: !val }))}
                          style={{ width: 46, height: 26, borderRadius: 13, background: val ? "var(--gradient)" : "#e5e7eb", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <div style={{ position: "absolute", top: 3, left: val ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </button>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{val ? "Enabled" : "Disabled"}</span>
                      </div>
                    ) : (
                      <input type={isNumber ? "number" : "text"} value={String(val ?? "")}
                        onChange={(e) => setLocalChanges(p => ({ ...p, [key]: isNumber ? Number(e.target.value) : e.target.value }))}
                        style={{ width: "100%", maxWidth: 420, padding: "10px 14px", borderRadius: 10, background: "var(--bg-app)", border: "1.5px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
