import { NextRequest } from "next/server";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { paginationMeta } from "@/lib/api-helpers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  module: z.string().max(50).optional(),
  action: z.string().max(50).optional(),
  entityType: z.string().max(50).optional(),
  performedBy: z.string().uuid().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    // Only super-admin and admin roles can read audit logs
    await requirePermission(session.user.permissions, "settings:read");

    const p = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      module: p.get("module") ?? undefined,
      action: p.get("action") ?? undefined,
      entityType: p.get("entityType") ?? undefined,
      performedBy: p.get("performedBy") ?? undefined,
      from: p.get("from") ?? undefined,
      to: p.get("to") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const { page, limit, module, action, entityType, performedBy, from, to } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(module && { module }),
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(performedBy && { performedBy }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          performer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(items, paginationMeta(total, page, limit));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
