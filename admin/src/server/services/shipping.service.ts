import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logActivity, logAudit } from "@/lib/logger";

interface ShipmentListQuery {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  orderId?: string;
}

export class ShippingService {
  static async list(query: ShipmentListQuery) {
    const { page, limit, status, search, orderId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(orderId && { orderId }),
      ...(search && {
        OR: [
          { trackingNumber: { contains: search, mode: "insensitive" } },
          { order: { orderNumber: { contains: search, mode: "insensitive" } } },
          { carrierName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.shipment.findMany({
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
          trackingEvents: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  static async getById(id: string) {
    return prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            shippingAddress: true,
          },
        },
        trackingEvents: { orderBy: { timestamp: "desc" } },
      },
    });
  }

  static async updateStatus(
    id: string,
    status: string,
    userId: string,
    trackingEvent?: { description: string; location?: string }
  ) {
    const existing = await prisma.shipment.findUnique({ where: { id } });
    if (!existing) throw new Error("Shipment not found");

    const updated = await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id },
        data: {
          status: status as any,
          ...(status === "DELIVERED" && { deliveredAt: new Date() }),
        },
      });

      if (trackingEvent) {
        await tx.trackingEvent.create({
          data: {
            shipmentId: id,
            status,
            description: trackingEvent.description,
            location: trackingEvent.location,
            timestamp: new Date(),
          },
        });
      }

      return shipment;
    });

    await logActivity({
      userId,
      orderId: existing.orderId,
      action: "SHIPMENT_STATUS_UPDATE",
      module: "shipping",
      description: `Shipment ${existing.trackingNumber || id} status → ${status}`,
    });

    await logAudit({
      performedBy: userId,
      action: "UPDATE",
      module: "shipping",
      entityType: "Shipment",
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status },
    });

    return updated;
  }

  static async getTracking(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        trackingEvents: { orderBy: { timestamp: "desc" } },
      },
    });
    if (!shipment) throw new Error("Shipment not found");
    return shipment;
  }
}
