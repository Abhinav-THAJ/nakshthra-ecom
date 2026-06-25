import { NextRequest } from "next/server";
import { UserService } from "@/server/services/user.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";
import { ZodError } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8),
  roleSlug: z.string().min(1),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  role: z.string().max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "users:read");

    const p = req.nextUrl.searchParams;
    const parsed = listQuerySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      search: p.get("search") ?? undefined,
      role: p.get("role") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const result = await UserService.list({
      page: parsed.data.page,
      limit: parsed.data.limit,
      search: parsed.data.search,
      roleSlug: parsed.data.role,
    });
    return successResponse(result.items, result.meta);
  } catch (error) {
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
    await requirePermission(session.user.permissions, "users:create");

    const body = await req.json();
    const data = createUserSchema.parse(body);
    const user = await UserService.create(data, session.user.id);
    return successResponse(user, undefined, 201);
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
