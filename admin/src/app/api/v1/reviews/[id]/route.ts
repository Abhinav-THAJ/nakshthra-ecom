import { NextRequest } from "next/server";
import { ReviewService } from "@/server/services/review.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/logger";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/v1/reviews/:id */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "reviews:read");

    const { id } = await params;
    const review = await ReviewService.getById(id);
    if (!review) return errorResponse("Review not found", 404);
    return successResponse(review);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

/** DELETE /api/v1/reviews/:id */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "reviews:moderate");

    const { id } = await params;
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) return errorResponse("Review not found", 404);

    await prisma.review.delete({ where: { id } });

    await logAudit({
      performedBy: session.user.id,
      action: "DELETE",
      module: "reviews",
      entityType: "Review",
      entityId: id,
      oldValues: { status: existing.status, rating: existing.rating },
    });

    return successResponse({ message: "Review deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
