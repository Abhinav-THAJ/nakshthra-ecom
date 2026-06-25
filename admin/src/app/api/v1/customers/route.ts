import { NextRequest } from "next/server";
import { CustomerService } from "@/server/services/customer.service";
import { customerListQuerySchema, createCustomerSchema } from "@/lib/validators/customer.validator";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "customers:read");

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = customerListQuerySchema.parse(searchParams);

    const result = await CustomerService.list(query);
    return successResponse(result.items, result.meta);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "customers:create");

    const body = await req.json();
    const data = createCustomerSchema.parse(body);

    const customer = await CustomerService.create(data, session.user.id);
    return successResponse(customer, undefined, 201);
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
