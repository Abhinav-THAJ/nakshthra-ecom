import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logAudit } from "@/lib/logger";
import bcrypt from "bcryptjs";

interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleSlug?: string;
}

interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleSlug: string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleSlug?: string;
}

export class UserService {
  static async list(query: UserListQuery) {
    const { page, limit, search, isActive, roleSlug } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(roleSlug && {
        userRoles: { some: { role: { slug: roleSlug } } },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: { role: { select: { name: true, slug: true } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }

  static async create(data: CreateUserInput, createdBy: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("A user with this email already exists");

    const role = await prisma.role.findUnique({ where: { slug: data.roleSlug } });
    if (!role) throw new Error("Role not found");

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      await tx.userRole.create({
        data: { userId: newUser.id, roleId: role.id },
      });

      return newUser;
    });

    await logAudit({
      performedBy: createdBy,
      action: "CREATE",
      module: "users",
      entityType: "User",
      entityId: user.id,
      newValues: { email: user.email, role: data.roleSlug },
    });

    return user;
  }

  static async update(id: string, data: UpdateUserInput, updatedBy: string) {
    const existing = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("User not found");

    // Validate role slug early, before entering the transaction
    let resolvedRole: { id: string } | null = null;
    if (data.roleSlug) {
      resolvedRole = await prisma.role.findUnique({ where: { slug: data.roleSlug } });
      if (!resolvedRole) throw new Error(`Role "${data.roleSlug}" not found`);
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: data.isActive,
        },
      });

      if (resolvedRole) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({ data: { userId: id, roleId: resolvedRole.id } });
      }

      return updated;
    });

    await logAudit({
      performedBy: updatedBy,
      action: "UPDATE",
      module: "users",
      entityType: "User",
      entityId: id,
      oldValues: { firstName: existing.firstName, isActive: existing.isActive },
      newValues: data as any,
    });

    return user;
  }

  static async deactivate(id: string, deactivatedBy: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      performedBy: deactivatedBy,
      action: "DEACTIVATE",
      module: "users",
      entityType: "User",
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    return user;
  }

  static async getRoles() {
    return prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { userRoles: true } },
      },
    });
  }
}
