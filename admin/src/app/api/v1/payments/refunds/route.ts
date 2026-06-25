import { NextRequest } from "next/server";
import { PaymentService } from "@/server/services/payment.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const refundSchema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
});

const listRefundsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "payments:read");

    const p = req.nextUrl.searchParams;
    const parsed = listRefundsQuerySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      status: p.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const result = await PaymentService.listRefunds(parsed.data);
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
    await requirePermission(session.user.permissions, "payments:refund");

    const body = await req.json();
    const data = refundSchema.parse(body);

    const refund = await PaymentService.processRefund(
      data.orderId,
      data.paymentId,
      data.amount,
      data.reason,
      session.user.id
    );
    return successResponse(refund, undefined, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      // Only return safe, known business-logic messages
      const SAFE_MESSAGES = [
        "Payment not found",
        "Refund amount exceeds payment amount",
        "Order not found",
        "Payment has already been fully refunded",
      ];
      if (SAFE_MESSAGES.some((m) => error.message.includes(m))) {
        return errorResponse(error.message, 400);
      }
    }
    console.error("[POST /api/v1/payments/refunds]", error);
    return errorResponse("Internal server error", 500);
  }
}
