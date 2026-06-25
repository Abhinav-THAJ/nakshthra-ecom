import { NextRequest } from "next/server";
import { ProductService, productSchema } from "@/server/services/product.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { ZodError } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "products:read");

    const { id } = await params;
    const product = await ProductService.getById(id);
    if (!product) return errorResponse("Product not found", 404);

    return successResponse(product);
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
    await requirePermission(session.user.permissions, "products:write");

    const { id } = await params;
    const body = await req.json();
    const data = productSchema.partial().parse(body);

    const product = await ProductService.update(id, data, session.user.id);
    return successResponse(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message.includes("already exists")) return errorResponse(error.message, 409);
    }
    return errorResponse("Internal server error", 500);
  }
}
