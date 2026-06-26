"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const user = session?.user;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: "var(--sidebar-width)",
        height: "var(--header-height)",
        background: "#ffffff",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        zIndex: 30,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-app)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "7px 14px",
          flex: 1,
          maxWidth: 360,
        }}
      >
        <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search orders, customers, products..."
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }}
        />
        <kbd
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 5,
            padding: "1px 6px",
            fontFamily: "monospace",
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        {/* Notification Bell */}
        <button
          style={{
            position: "relative",
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--bg-app)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--gradient)",
              fontSize: 9,
              fontWeight: 700,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            3
          </span>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: "var(--border)" }} />

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 10,
              background: profileOpen ? "var(--bg-app)" : "transparent",
              border: `1px solid ${profileOpen ? "var(--border)" : "transparent"}`,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {user?.avatar && (
              <img src={user.avatar} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {user?.firstName || "Admin"} {user?.lastName || ""}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {user?.roles?.[0] || "Administrator"}
              </div>
            </div>
            <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
          </button>

          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 180,
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                padding: "6px",
                zIndex: 100,
              }}
            >
              <DropdownLink href="/settings/profile" icon={User} label="My Profile" onClick={() => setProfileOpen(false)} />
              <DropdownLink href="/settings" icon={Settings} label="Settings" onClick={() => setProfileOpen(false)} />
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#dc2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 13,
        color: "var(--text-secondary)",
        textDecoration: "none",
        transition: "all 0.15s",
      }}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
