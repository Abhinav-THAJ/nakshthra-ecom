import { NextRequest } from "next/server";
import { AnalyticsService } from "@/server/services/analytics.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const querySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1)
    .max(365)
    .default(Number(process.env.ANALYTICS_DEFAULT_DAYS ?? 30)),
  recentOrders: z.coerce.number().int().min(1).max(50).default(8),
  recentActivity: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "analytics:read");

    const p = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      days: p.get("days") ?? undefined,
      recentOrders: p.get("recentOrders") ?? undefined,
      recentActivity: p.get("recentActivity") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const { days, recentOrders, recentActivity } = parsed.data;

    const [stats, revenueChart, orderDistribution, customerGrowth, activity, orders] =
      await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getRevenueChart(days),
        AnalyticsService.getOrderStatusDistribution(),
        AnalyticsService.getCustomerGrowth(days),
        AnalyticsService.getRecentActivity(recentActivity),
        AnalyticsService.getRecentOrders(recentOrders),
      ]);

    return successResponse({
      stats,
      revenueChart,
      orderDistribution,
      customerGrowth,
      recentActivity: activity,
      recentOrders: orders,
      meta: { days, recentOrders, recentActivity },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    console.error("[GET /api/v1/analytics/overview]", error);
    return errorResponse("Internal server error", 500);
  }
}
