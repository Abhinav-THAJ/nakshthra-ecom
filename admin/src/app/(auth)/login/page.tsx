"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.validator";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/";
  // Prevent open redirect: only allow same-origin or relative paths
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setAuthError("");
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (result?.error) { setAuthError("Invalid email or password. Please try again."); return; }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <img
          src="/logo.png"
          alt="Nakshathra Gold & Diamonds"
          style={{
            maxHeight: "75px",
            objectFit: "contain",
            marginBottom: 16,
          }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.03em" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sign in to your Admin Portal account</p>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              color: "#dc2626", fontSize: 13,
            }}
          >
            <Lock size={13} />
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                {...register("email")}
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                style={{
                  width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                  borderRadius: 10, background: "var(--bg-app)", fontSize: 13, fontFamily: "inherit",
                  border: `1.5px solid ${errors.email ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                  color: "var(--text-primary)", outline: "none", transition: "border-color 0.15s",
                }}
              />
            </div>
            {errors.email && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              <a href="/forgot-password" style={{ fontSize: 12, color: "var(--brand-600)", textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                {...register("password")}
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: "100%", paddingLeft: 36, paddingRight: 40, paddingTop: 10, paddingBottom: 10,
                  borderRadius: 10, background: "var(--bg-app)", fontSize: 13, fontFamily: "inherit",
                  border: `1.5px solid ${errors.password ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                  color: "var(--text-primary)", outline: "none", transition: "border-color 0.15s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              background: isSubmitting ? "var(--brand-200)" : "var(--gradient)",
              color: "white", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: isSubmitting ? "none" : "0 6px 20px rgba(212, 175, 55, 0.25)",
              transition: "all 0.2s",
            }}
          >
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : "Sign in"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
        🔒 Secure enterprise authentication
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "var(--text-muted)" }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
