import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  source: z.enum(["WEB", "MOBILE", "POS", "API", "MANUAL"]).default("MANUAL"),
  shippingAddressId: z.string().uuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  currency: z.string().length(3).default(process.env.STORE_DEFAULT_CURRENCY || "INR"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID required"),
        variantId: z.string().optional(),
        sku: z.string().optional(),
        name: z.string().min(1, "Product name required"),
        image: z.string().url().optional(),
        quantity: z.number().int().positive("Quantity must be positive"),
        unitPrice: z.number().positive("Price must be positive"),
        discount: z.number().min(0).default(0),
      })
    )
    .min(1, "At least one item required"),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  shippingAmount: z.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
  internalNotes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
    "ON_HOLD",
  ]),
  reason: z.string().max(500).optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
      "ON_HOLD",
    ])
    .optional(),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(["createdAt", "total", "orderNumber"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const addOrderNoteSchema = z.object({
  content: z.string().min(1).max(2000),
  isInternal: z.boolean().default(false),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type AddOrderNoteInput = z.infer<typeof addOrderNoteSchema>;
