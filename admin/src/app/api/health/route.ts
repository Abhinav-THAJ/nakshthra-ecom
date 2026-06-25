import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** GET /api/health
 * Returns 200 when the application and database are healthy.
 * Returns 503 when any dependency is unhealthy.
 */
export async function GET() {
  const start = Date.now();

  try {
    // Verify database connectivity with a lightweight raw query
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        app: process.env.NEXT_PUBLIC_APP_NAME || "Admin Portal",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        database: { status: "ok", latencyMs: dbLatencyMs },
      },
      { status: 200 }
    );
  } catch (error) {
    const dbLatencyMs = Date.now() - start;
    console.error("[HealthCheck] Database connectivity failed:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          latencyMs: dbLatencyMs,
          message: "Database connection failed",
        },
      },
      { status: 503 }
    );
  }
}
