import { NextRequest } from "next/server";
import { ReviewService } from "@/server/services/review.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const moderateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().max(500).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "reviews:moderate");

    const { id } = await params;
    const body = await req.json();
    const { status, note } = moderateSchema.parse(body);

    const review = await ReviewService.moderate(id, status, session.user.id, note);
    return successResponse(review);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message === "Review not found") return errorResponse(error.message, 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
