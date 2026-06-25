import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logActivity, logAudit } from "@/lib/logger";
import type { PaginatedResult } from "@/types";

interface TransactionListQuery {
  page: number;
  limit: number;
  status?: string;
  method?: string;
  from?: string;
  to?: string;
  search?: string;
}

interface RefundListQuery {
  page: number;
  limit: number;
  status?: string;
}

export class PaymentService {
  static async listTransactions(
    query: TransactionListQuery
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status, method, from, to, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(method && { method }),
      ...(search && {
        OR: [
          { transactionId: { contains: search, mode: "insensitive" } },
          { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        ],
      }),
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
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((p) => ({ ...p, amount: Number(p.amount) })),
      meta: paginationMeta(total, page, limit),
    };
  }

  static async listRefunds(
    query: RefundListQuery
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { ...(status && { status }) };

    const [items, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          payment: { select: { method: true, transactionId: true } },
        },
      }),
      prisma.refund.count({ where }),
    ]);

    return {
      items: items.map((r) => ({ ...r, amount: Number(r.amount) })),
      meta: paginationMeta(total, page, limit),
    };
  }

  static async processRefund(
    orderId: string,
    paymentId: string,
    amount: number,
    reason: string,
    userId: string
  ) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("Payment not found");

    if (Number(payment.amount) < amount) {
      throw new Error("Refund amount exceeds payment amount");
    }

    const refund = await prisma.refund.create({
      data: {
        orderId,
        paymentId,
        amount,
        reason,
        status: "PENDING",
      },
    });

    await logActivity({
      userId,
      orderId,
      action: "REFUND_INITIATED",
      module: "payments",
      description: `Refund of $${amount} initiated for order`,
      metadata: { paymentId, amount, reason },
    });

    await logAudit({
      performedBy: userId,
      action: "CREATE",
      module: "payments",
      entityType: "Refund",
      entityId: refund.id,
      newValues: { orderId, paymentId, amount, reason, status: "PENDING" },
    });

    return refund;
  }

  static async approveRefund(refundId: string, userId: string) {
    const refund = await prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "PENDING") throw new Error("Only pending refunds can be approved");

    const updated = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: "APPROVED",
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await logAudit({
      performedBy: userId,
      action: "APPROVE",
      module: "payments",
      entityType: "Refund",
      entityId: refundId,
      oldValues: { status: "PENDING" },
      newValues: { status: "APPROVED" },
    });

    return updated;
  }

  static async rejectRefund(refundId: string, userId: string, notes: string) {
    const refund = await prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) throw new Error("Refund not found");

    const updated = await prisma.refund.update({
      where: { id: refundId },
      data: { status: "REJECTED", notes },
    });

    await logAudit({
      performedBy: userId,
      action: "REJECT",
      module: "payments",
      entityType: "Refund",
      entityId: refundId,
      oldValues: { status: refund.status },
      newValues: { status: "REJECTED", notes },
    });

    return updated;
  }

  static async getAnalytics(from?: string, to?: string) {
    const dateFilter = from || to
      ? {
          createdAt: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {};

    const [
      totalRevenue,
      byStatus,
      byMethod,
      failedPayments,
      totalRefunds,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "COMPLETED", ...dateFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where: dateFilter,
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["method"],
        where: { status: "COMPLETED", ...dateFilter },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: "FAILED", ...dateFilter },
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.refund.aggregate({
        where: { status: "COMPLETED", ...dateFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalTransactions: totalRevenue._count.id,
      totalRefunded: Number(totalRefunds._sum.amount || 0),
      totalRefundCount: totalRefunds._count.id,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        amount: Number(s._sum.amount || 0),
      })),
      byMethod: byMethod.map((m) => ({
        method: m.method,
        count: m._count.id,
        amount: Number(m._sum.amount || 0),
      })),
      failedPayments: failedPayments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };
  }
}
