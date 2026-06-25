import { NextRequest } from "next/server";
import { PaymentService } from "@/server/services/payment.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().max(50).optional(),
  method: z.string().max(50).optional(),
  search: z.string().max(200).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "payments:read");

    const p = req.nextUrl.searchParams;
    const parsed = listQuerySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      status: p.get("status") ?? undefined,
      method: p.get("method") ?? undefined,
      search: p.get("search") ?? undefined,
      from: p.get("from") ?? undefined,
      to: p.get("to") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const result = await PaymentService.listTransactions(parsed.data);
    return successResponse(result.items, result.meta);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
