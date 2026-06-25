import { NextRequest } from "next/server";
import { NotificationService } from "@/server/services/notification.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isRead: z.enum(["true", "false"]).optional().transform((v) =>
    v === undefined ? undefined : v === "true"
  ),
  isArchived: z.coerce.boolean().default(false),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  type: z.string().max(50).optional(),
});

/** Strongly-typed body for PATCH /api/v1/notifications */
const patchBodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("markAllRead") }),
  z.object({ action: z.literal("markRead"), id: z.string().uuid() }),
  z.object({ action: z.literal("archive"), id: z.string().uuid() }),
]);

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "notifications:read");

    const p = req.nextUrl.searchParams;
    const parsed = listQuerySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      isRead: p.get("isRead") ?? undefined,
      isArchived: p.get("isArchived") ?? undefined,
      priority: p.get("priority") ?? undefined,
      type: p.get("type") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const result = await NotificationService.list(session.user.id, parsed.data as any);

    return successResponse(
      { items: result.items, unreadCount: result.unreadCount },
      result.meta
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    // Writing to notifications requires authentication — the user manages their own notifications
    await requirePermission(session.user.permissions, "notifications:read");

    const body = await req.json();
    const parsed = patchBodySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400, parsed.error.flatten().fieldErrors as any);
    }

    const data = parsed.data;

    if (data.action === "markAllRead") {
      await NotificationService.markAllAsRead(session.user.id);
      return successResponse({ message: "All notifications marked as read" });
    }

    if (data.action === "markRead") {
      const updated = await NotificationService.markAsRead(data.id, session.user.id);
      return successResponse(updated);
    }

    if (data.action === "archive") {
      const updated = await NotificationService.archive(data.id, session.user.id);
      return successResponse(updated);
    }

    // Exhaustive check — should never reach here
    return errorResponse("Unknown action", 400);
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
