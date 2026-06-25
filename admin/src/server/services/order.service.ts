 import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { paginationMeta } from "@/lib/api-helpers";
import { logActivity, logAudit } from "@/lib/logger";
import type {
  CreateOrderInput,
  OrderListQuery,
  AddOrderNoteInput,
} from "@/lib/validators/order.validator";
import type { PaginatedResult } from "@/types";

/** ─── Order State Machine ───────────────────────────────────────────────────
 *
 * Defines the ONLY legal status transitions. Any other combination is rejected.
 * This prevents, for example, setting a DELIVERED order back to PENDING.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:             ["CONFIRMED", "CANCELLED", "ON_HOLD"],
  CONFIRMED:           ["PROCESSING", "CANCELLED", "ON_HOLD"],
  PROCESSING:          ["SHIPPED", "CANCELLED", "ON_HOLD"],
  SHIPPED:             ["DELIVERED", "RETURNED"],
  DELIVERED:           ["REFUNDED", "PARTIALLY_REFUNDED", "RETURNED"],
  ON_HOLD:             ["PENDING", "CONFIRMED", "CANCELLED"],
  PARTIALLY_REFUNDED:  ["REFUNDED"],
  RETURNED:            ["REFUNDED"],
  // Terminal states — no transitions out
  CANCELLED:           [],
  REFUNDED:            [],
};

/** Statuses that reduce the customer's financial counters */
const COUNTER_REVERSAL_STATUSES = new Set(["CANCELLED", "RETURNED", "REFUNDED"]);

export class OrderService {
  static async list(
    query: OrderListQuery
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status, search, customerId, from, to, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { email: { contains: search, mode: "insensitive" } } },
          { customer: { firstName: { contains: search, mode: "insensitive" } } },
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
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        total: Number(o.total),
        discountAmount: Number(o.discountAmount),
        taxAmount: Number(o.taxAmount),
        shippingAmount: Number(o.shippingAmount),
      })),
      meta: paginationMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        orderItems: true,
        payments: true,
        refunds: true,
        shipments: {
          include: { trackingEvents: { orderBy: { timestamp: "desc" } } },
        },
        orderNotes: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return null;

    return {
      ...order,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
    };
  }

  static async create(data: CreateOrderInput, userId: string) {
    // Use env-configured currency or fall back to the schema default
    const currency = data.currency ?? (process.env.STORE_DEFAULT_CURRENCY || "INR");

    // Validate the customer exists and is active
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId, deletedAt: null, isActive: true },
    });
    if (!customer) throw new Error("Customer not found or is inactive");

    const orderNumber = generateOrderNumber();

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity - item.discount,
      0
    );
    const total =
      subtotal +
      (data.taxAmount || 0) +
      (data.shippingAmount || 0) -
      (data.discountAmount || 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: data.customerId,
          source: data.source,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId,
          currency,
          subtotal,
          discountAmount: data.discountAmount || 0,
          taxAmount: data.taxAmount || 0,
          shippingAmount: data.shippingAmount || 0,
          total,
          notes: data.notes,
          internalNotes: data.internalNotes,
          tags: data.tags,
          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              sku: item.sku,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity - item.discount,
              discount: item.discount || 0,
            })),
          },
        },
        include: { orderItems: true, customer: true },
      });

      // Increment customer stats inside the same transaction
      await tx.customer.update({
        where: { id: data.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
          lifetimeValue: { increment: total },
        },
      });

      return newOrder;
    });

    await logActivity({
      userId,
      orderId: order.id,
      customerId: data.customerId,
      action: "CREATE",
      module: "orders",
      description: `Order ${orderNumber} created`,
    });

    await logAudit({
      performedBy: userId,
      action: "CREATE",
      module: "orders",
      entityType: "Order",
      entityId: order.id,
      newValues: { orderNumber, total, status: "PENDING" },
    });

    return order;
  }

  static async updateStatus(
    id: string,
    newStatus: string,
    userId: string,
    reason?: string
  ) {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new Error("Order not found");

    // ── State machine enforcement ────────────────────────────────────────────
    const currentStatus = existing.status as string;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
          `Allowed transitions: ${allowedNext.join(", ") || "none (terminal state)"}`
      );
    }

    // Compute extra fields based on the new status
    const statusData: any = { status: newStatus };
    if (newStatus === "CANCELLED") {
      statusData.cancelledAt = new Date();
      statusData.cancelReason = reason;
    }
    if (newStatus === "DELIVERED") {
      statusData.deliveredAt = new Date();
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: statusData,
      });

      // Reconcile customer counters when an order is reverted to a void state
      if (COUNTER_REVERSAL_STATUSES.has(newStatus)) {
        // Only reverse if the previous status was NOT already a void state
        if (!COUNTER_REVERSAL_STATUSES.has(currentStatus)) {
          await tx.customer.update({
            where: { id: existing.customerId },
            data: {
              totalOrders: { decrement: 1 },
              totalSpent: { decrement: Number(existing.total) },
            },
          });
        }
      }

      return updated;
    });

    await logActivity({
      userId,
      orderId: id,
      action: "STATUS_UPDATE",
      module: "orders",
      description: `Order ${existing.orderNumber} status changed from ${currentStatus} to ${newStatus}`,
      metadata: { from: currentStatus, to: newStatus, reason },
    });

    await logAudit({
      performedBy: userId,
      action: "UPDATE",
      module: "orders",
      entityType: "Order",
      entityId: id,
      oldValues: { status: currentStatus },
      newValues: { status: newStatus, reason },
    });

    return order;
  }

  static async addNote(orderId: string, data: AddOrderNoteInput, userId: string) {
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId, deletedAt: null },
      select: { id: true },
    });
    if (!orderExists) throw new Error("Order not found");

    const note = await prisma.orderNote.create({
      data: {
        orderId,
        authorId: userId,
        content: data.content,
        isInternal: data.isInternal,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    await logActivity({
      userId,
      orderId,
      action: "ADD_NOTE",
      module: "orders",
      description: `Note added to order`,
    });

    return note;
  }

  static async getTimeline(orderId: string) {
    const [activities, notes, shipments] = await Promise.all([
      prisma.activityLog.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.orderNote.findMany({
        where: { orderId },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shipment.findMany({
        where: { orderId },
        include: { trackingEvents: { orderBy: { timestamp: "desc" } } },
      }),
    ]);

    return { activities, notes, shipments };
  }
}
