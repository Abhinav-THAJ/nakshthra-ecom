import { NextRequest } from "next/server";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(
    Number(process.env.ANALYTICS_DEFAULT_DAYS ?? 30)
  ),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "payments:read");

    const p = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({ days: p.get("days") ?? undefined });
    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const { days } = parsed.data;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [byMethod, byStatus, volumeChart, totals] = await Promise.all([
      // Revenue by payment method
      prisma.payment.groupBy({
        by: ["method"],
        where: { status: "COMPLETED", createdAt: { gte: since } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Count by payment status
      prisma.payment.groupBy({
        by: ["status"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Daily transaction volume
      prisma.payment.findMany({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        select: { createdAt: true, amount: true, method: true },
        orderBy: { createdAt: "asc" },
      }),
      // Aggregate totals
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),
    ]);

    return successResponse({
      period: { days, since },
      byMethod: byMethod.map((m) => ({
        method: m.method,
        count: m._count.id,
        total: Number(m._sum.amount ?? 0),
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        total: Number(s._sum.amount ?? 0),
      })),
      volumeChart,
      totals: {
        count: totals._count.id,
        total: Number(totals._sum.amount ?? 0),
        average: Number(totals._avg.amount ?? 0),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
