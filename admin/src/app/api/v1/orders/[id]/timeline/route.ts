import { NextRequest } from "next/server";
import { OrderService } from "@/server/services/order.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/v1/orders/:id/timeline */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "orders:read");

    const { id } = await params;
    const timeline = await OrderService.getTimeline(id);
    return successResponse(timeline);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
