import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";

interface NotificationListQuery {
  page: number;
  limit: number;
  isRead?: boolean;
  isArchived?: boolean;
  priority?: string;
  type?: string;
}

export class NotificationService {
  static async list(userId: string, query: NotificationListQuery) {
    const { page, limit, isRead, isArchived, priority, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      isArchived: isArchived ?? false,
      ...(isRead !== undefined && { isRead }),
      ...(priority && { priority }),
      ...(type && { type }),
    };

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false, isArchived: false } }),
    ]);

    return { items, meta: paginationMeta(total, page, limit), unreadCount };
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async archive(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  }

  static async create(data: {
    userId: string;
    type: string;
    priority?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    expiresAt?: Date;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        priority: (data.priority as any) ?? "MEDIUM",
        title: data.title,
        body: data.body,
        data: data.data as any,
        expiresAt: data.expiresAt,
      },
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }
}
