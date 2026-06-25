import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logAudit } from "@/lib/logger";
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
  categoryId: z.string().optional(),
  basePrice: z.coerce.number().positive(),
  weight: z.coerce.number().positive().optional(),
  karatage: z.coerce.number().int().optional(),
  inventory: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ProductCreateInput = z.infer<typeof productSchema>;

export class ProductService {
  static async list(query: { page: number; limit: number; search?: string; categoryId?: string }) {
    const { page, limit, search, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  static async getById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async create(data: ProductCreateInput, userId: string) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new Error("A product with this SKU already exists");

    const product = await prisma.product.create({ data });

    await logAudit({
      performedBy: userId,
      action: "CREATE",
      module: "products",
      entityType: "Product",
      entityId: product.id,
      newValues: { name: product.name, sku: product.sku },
    });

    return product;
  }

  static async update(id: string, data: Partial<ProductCreateInput>, userId: string) {
    if (data.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku && existingSku.id !== id) {
        throw new Error("A product with this SKU already exists");
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await logAudit({
      performedBy: userId,
      action: "UPDATE",
      module: "products",
      entityType: "Product",
      entityId: product.id,
      newValues: data as any,
    });

    return product;
  }
}
