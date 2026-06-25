import prisma from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";
import type { DashboardStats, RevenueDataPoint, OrderStatusDistribution } from "@/types";

export class AnalyticsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      currentRefunds,
      previousRefunds,
      totalOrders,
    ] = await Promise.all([
      // Current 30 days revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      // Previous 30 days revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      // Current 30 days orders
      prisma.order.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      // Previous 30 days orders
      prisma.order.count({
        where: {
          deletedAt: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // New customers current period
      prisma.customer.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      // New customers previous period
      prisma.customer.count({
        where: {
          deletedAt: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // Current refunds
      prisma.refund.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // Previous refunds
      prisma.refund.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      // Total orders for refund rate
      prisma.order.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const rev = Number(currentRevenue._sum.amount || 0);
    const prevRev = Number(previousRevenue._sum.amount || 0);
    const refundRate = totalOrders > 0 ? (currentRefunds / totalOrders) * 100 : 0;
    const prevRefundRate =
      previousOrders > 0 ? (previousRefunds / previousOrders) * 100 : 0;

    return {
      totalRevenue: rev,
      revenueGrowth: prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0,
      totalOrders: currentOrders,
      ordersGrowth:
        previousOrders > 0
          ? ((currentOrders - previousOrders) / previousOrders) * 100
          : 0,
      totalCustomers: currentCustomers,
      customersGrowth:
        previousCustomers > 0
          ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
          : 0,
      refundRate,
      refundRateChange: refundRate - prevRefundRate,
    };
  }

  static async getRevenueChart(days = 30): Promise<RevenueDataPoint[]> {
    const now = new Date();
    const start = subDays(now, days);
    const dateRange = eachDayOfInterval({ start, end: now });

    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: start },
      },
      select: { amount: true, createdAt: true },
    });

    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: start },
      },
      select: { createdAt: true },
    });

    const revenueByDay = new Map<string, number>();
    const ordersByDay = new Map<string, number>();

    payments.forEach((p) => {
      const key = format(p.createdAt, "yyyy-MM-dd");
      revenueByDay.set(key, (revenueByDay.get(key) || 0) + Number(p.amount));
    });

    orders.forEach((o) => {
      const key = format(o.createdAt, "yyyy-MM-dd");
      ordersByDay.set(key, (ordersByDay.get(key) || 0) + 1);
    });

    return dateRange.map((date) => {
      const key = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM dd"),
        revenue: revenueByDay.get(key) || 0,
        orders: ordersByDay.get(key) || 0,
      };
    });
  }

  static async getOrderStatusDistribution(): Promise<OrderStatusDistribution[]> {
    const grouped = await prisma.order.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const total = grouped.reduce((sum, g) => sum + g._count.id, 0);

    return grouped.map((g) => ({
      status: g.status as any,
      count: g._count.id,
      percentage: total > 0 ? Number(((g._count.id / total) * 100).toFixed(1)) : 0,
    }));
  }

  static async getCustomerGrowth(days = 30) {
    const start = subDays(new Date(), days);
    const dateRange = eachDayOfInterval({ start, end: new Date() });

    const customers = await prisma.customer.findMany({
      where: { deletedAt: null, createdAt: { gte: start } },
      select: { createdAt: true },
    });

    const totalBefore = await prisma.customer.count({
      where: { deletedAt: null, createdAt: { lt: start } },
    });

    const newByDay = new Map<string, number>();
    customers.forEach((c) => {
      const key = format(c.createdAt, "yyyy-MM-dd");
      newByDay.set(key, (newByDay.get(key) || 0) + 1);
    });

    let runningTotal = totalBefore;
    return dateRange.map((date) => {
      const key = format(date, "yyyy-MM-dd");
      const newCustomers = newByDay.get(key) || 0;
      runningTotal += newCustomers;
      return {
        date: format(date, "MMM dd"),
        newCustomers,
        totalCustomers: runningTotal,
      };
    });
  }

  static async getRecentActivity(limit = 10) {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  static async getRecentOrders(limit = 8) {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true, avatar: true },
        },
      },
    });

    return orders.map((o) => ({ ...o, total: Number(o.total) }));
  }
}
