import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logActivity, logAudit } from "@/lib/logger";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQuery,
} from "@/lib/validators/customer.validator";
import type { PaginatedResult } from "@/types";

export class CustomerService {
  static async list(query: CustomerListQuery): Promise<PaginatedResult<any>> {
    const { page, limit, search, isActive, from, to, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
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
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { orders: true, addresses: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        ...c,
        totalSpent: Number(c.totalSpent),
        lifetimeValue: Number(c.lifetimeValue),
      })),
      meta: paginationMeta(total, page, limit),
    };
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id, deletedAt: null },
      include: {
        addresses: true,
        orders: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!customer) return null;

    return {
      ...customer,
      totalSpent: Number(customer.totalSpent),
      lifetimeValue: Number(customer.lifetimeValue),
      orders: customer.orders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
    };
  }

  static async create(data: CreateCustomerInput, userId: string) {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("A customer with this email already exists");
    }

    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        notes: data.notes,
        tags: data.tags,
        source: data.source,
      },
    });

    await logActivity({
      userId,
      customerId: customer.id,
      action: "CREATE",
      module: "customers",
      description: `Customer ${customer.email} created`,
    });

    await logAudit({
      performedBy: userId,
      action: "CREATE",
      module: "customers",
      entityType: "Customer",
      entityId: customer.id,
      newValues: { email: customer.email, firstName: customer.firstName, lastName: customer.lastName },
    });

    return customer;
  }

  static async update(id: string, data: UpdateCustomerInput, userId: string) {
    const existing = await prisma.customer.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("Customer not found");

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    await logAudit({
      performedBy: userId,
      action: "UPDATE",
      module: "customers",
      entityType: "Customer",
      entityId: id,
      oldValues: existing as any,
      newValues: data as any,
    });

    return customer;
  }

  static async deactivate(id: string, userId: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    await logActivity({
      userId,
      customerId: id,
      action: "DEACTIVATE",
      module: "customers",
      description: `Customer ${customer.email} deactivated`,
    });

    await logAudit({
      performedBy: userId,
      action: "DEACTIVATE",
      module: "customers",
      entityType: "Customer",
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    return customer;
  }

  static async getAnalytics(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error("Customer not found");

    const [ordersByStatus, monthlySpend, recentOrders] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        where: { customerId: id, deletedAt: null },
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: {
          customerId: id,
          deletedAt: null,
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: { customerId: id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      }),
    ]);

    return {
      customer: {
        ...customer,
        totalSpent: Number(customer.totalSpent),
        lifetimeValue: Number(customer.lifetimeValue),
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        total: Number(s._sum.total || 0),
      })),
      monthlySpend,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
    };
  }
}
