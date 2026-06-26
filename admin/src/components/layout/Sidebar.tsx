"use client";

import { useUIStore } from "@/store";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  Star,
  Bell,
  BarChart3,
  Plug,
  Settings,
  UserCog,
  ChevronRight,
  Package,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, section: null },
  { label: "Operations", href: null, icon: null, section: true },
  { label: "Products & Stock", href: "/products", icon: Package, section: null },
  { label: "Orders", href: "/orders", icon: ShoppingCart, section: null },
  { label: "Customers", href: "/customers", icon: Users, section: null },
  { label: "Shipping", href: "/shipping", icon: Truck, section: null },
  { label: "Finance", href: null, icon: null, section: true },
  { label: "Payments", href: "/payments", icon: CreditCard, section: null },
  { label: "Engagement", href: null, icon: null, section: true },
  { label: "Reviews", href: "/reviews", icon: Star, section: null },
  { label: "Notifications", href: "/notifications", icon: Bell, section: null },
  { label: "Insights", href: null, icon: null, section: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, section: null },
  { label: "System", href: null, icon: null, section: true },
  { label: "Integrations", href: "/integrations", icon: Plug, section: null },
  { label: "Users", href: "/users", icon: UserCog, section: null },
  { label: "Settings", href: "/settings", icon: Settings, section: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
      style={{
        position: "fixed",
        inset: "0 auto 0 0",
        width: "var(--sidebar-width)",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 15px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <img
            src="/logo.png"
            alt="Nakshathra Gold & Diamonds"
            style={{
              maxHeight: "46px",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{ padding: "14px 10px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {item.label}
              </div>
            );
          }

          const active = isActive(item.href!);
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: "none",
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                color: active ? "white" : "var(--text-secondary)",
                background: active ? "var(--gradient)" : "transparent",
                boxShadow: active ? "0 4px 12px rgba(212,175,55,0.30)" : "none",
                transition: "all 0.15s ease",
                position: "relative",
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {!active && (
                <ChevronRight size={13} style={{ opacity: 0.35 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>All systems operational</span>
        </div>
      </div>
    </aside>
    </>
  );
}
