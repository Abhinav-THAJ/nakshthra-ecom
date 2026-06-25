import { NextRequest } from "next/server";
import { UserService } from "@/server/services/user.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  roleSlug: z.string().min(1).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "users:read");

    const { id } = await params;
    const user = await UserService.getById(id);
    if (!user) return errorResponse("User not found", 404);
    return successResponse(user);
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
    await requirePermission(session.user.permissions, "users:update");

    const { id } = await params;

    // Prevent self-role-escalation: cannot update your own role
    if (id === session.user.id && req.method === "PATCH") {
      const body = await req.json();
      if (body.roleSlug) {
        return errorResponse("You cannot change your own role", 403);
      }
    }

    const body = await req.json();
    const data = updateUserSchema.parse(body);
    const user = await UserService.update(id, data, session.user.id);
    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message === "User not found") return errorResponse(error.message, 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "users:update");

    const { id } = await params;

    // Prevent self-deactivation
    if (id === session.user.id) {
      return errorResponse("You cannot deactivate your own account", 403);
    }

    const user = await UserService.deactivate(id, session.user.id);
    return successResponse(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
