import { NextRequest } from "next/server";
import { OrderService } from "@/server/services/order.service";
import { orderListQuerySchema, createOrderSchema } from "@/lib/validators/order.validator";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "orders:read");

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = orderListQuerySchema.parse(searchParams);

    const result = await OrderService.list(query);
    return successResponse(result.items, result.meta);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    console.error("[GET /api/v1/orders]", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "orders:create");

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    const order = await OrderService.create(data, session.user.id);
    return successResponse(order, undefined, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message === "A customer with this email already exists") {
        return errorResponse(error.message, 409);
      }
    }
    console.error("[POST /api/v1/orders]", error);
    return errorResponse("Internal server error", 500);
  }
}
