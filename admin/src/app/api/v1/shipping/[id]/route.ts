import { NextRequest } from "next/server";
import { ShippingService } from "@/server/services/shipping.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY",
    "DELIVERED", "RETURNED", "LOST", "FAILED",
  ]),
  trackingEvent: z
    .object({
      description: z.string().min(1).max(500),
      location: z.string().max(200).optional(),
    })
    .optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "shipping:read");

    const { id } = await params;
    const shipment = await ShippingService.getById(id);
    if (!shipment) return errorResponse("Shipment not found", 404);
    return successResponse(shipment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "shipping:update");

    const { id } = await params;
    const body = await req.json();
    const { status, trackingEvent } = updateStatusSchema.parse(body);

    const shipment = await ShippingService.updateStatus(id, status, session.user.id, trackingEvent);
    return successResponse(shipment);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message === "Shipment not found") return errorResponse(error.message, 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
