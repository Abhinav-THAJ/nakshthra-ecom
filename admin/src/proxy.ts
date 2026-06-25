import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limit store for single-instance environments
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth", // NextAuth internal routes
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Rate Limiting (API routes only)
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    let maxHits = 100;
    let windowMs = 60 * 1000;

    if (pathname.startsWith("/api/auth/") || pathname === "/api/v1/auth/forgot-password" || pathname === "/api/v1/auth/reset-password") {
      maxHits = parseInt(process.env.LOGIN_RATE_LIMIT_MAX || "10", 10);
      windowMs = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || "300", 10) * 1000;
    }

    const now = Date.now();
    const rateKey = `${ip}:${pathname.startsWith("/api/auth/") ? "auth" : "api"}`;

    let record = rateLimitMap.get(rateKey);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }

    record.count++;
    rateLimitMap.set(rateKey, record);

    if (record.count > maxHits) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((record.resetAt - now) / 1000).toString(),
          },
        }
      );
    }
  }

  // Allow public API routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
