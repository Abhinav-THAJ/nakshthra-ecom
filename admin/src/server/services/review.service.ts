import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logAudit } from "@/lib/logger";

interface ReviewListQuery {
  page: number;
  limit: number;
  status?: string;
  productId?: string;
  rating?: number;
}

export class ReviewService {
  static async list(query: ReviewListQuery) {
    const { page, limit, status, productId, rating } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(productId && { productId }),
      ...(rating && { rating }),
    };

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  static async getById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  static async moderate(
    id: string,
    status: "APPROVED" | "REJECTED",
    moderatedBy: string,
    note?: string
  ) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found");

    const updated = await prisma.review.update({
      where: { id },
      data: {
        status,
        moderatedBy,
        moderatedAt: new Date(),
        moderationNote: note,
      },
    });

    await logAudit({
      performedBy: moderatedBy,
      action: status === "APPROVED" ? "APPROVE" : "REJECT",
      module: "reviews",
      entityType: "Review",
      entityId: id,
      oldValues: { status: review.status },
      newValues: { status, moderationNote: note },
    });

    return updated;
  }

  static async getAnalytics() {
    const [byStatus, byRating, recent, averageRating] = await Promise.all([
      prisma.review.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        _count: { id: true },
        orderBy: { rating: "desc" },
      }),
      prisma.review.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byRating: byRating.map((r) => ({ rating: r.rating, count: r._count.id })),
      pendingReviews: recent,
      averageRating: Number((averageRating._avg.rating || 0).toFixed(1)),
    };
  }
}
