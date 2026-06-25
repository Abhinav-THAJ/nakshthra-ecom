import { z } from "zod";

export const createCustomerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({
  email: true,
});

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  tags: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "totalSpent", "totalOrders", "lifetimeValue"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createAddressSchema = z.object({
  label: z.string().default("Home"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  line1: z.string().min(1, "Address line 1 required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  postalCode: z.string().min(1, "Postal code required"),
  country: z.string().length(2, "Use 2-letter country code"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
