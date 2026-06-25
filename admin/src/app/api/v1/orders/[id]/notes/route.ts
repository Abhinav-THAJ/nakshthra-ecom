import { NextRequest } from "next/server";
import { OrderService } from "@/server/services/order.service";
import { addOrderNoteSchema } from "@/lib/validators/order.validator";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { ZodError } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "orders:update");

    const { id } = await params;
    const body = await req.json();
    const data = addOrderNoteSchema.parse(body);

    const note = await OrderService.addNote(id, data, session.user.id);
    return successResponse(note, undefined, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message === "Order not found") return errorResponse(error.message, 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
