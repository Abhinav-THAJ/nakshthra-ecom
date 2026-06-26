import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Providers>
      <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
        <Sidebar />
        <Header />
        <main className="app-main"
          style={{
            marginLeft: "var(--sidebar-width)",
            paddingTop: "var(--header-height)",
            minHeight: "100vh",
          }}
        >
          <div style={{ padding: "24px" }}>{children}</div>
        </main>
      </div>
    </Providers>
  );
}
