// ══════════════════════════════════════════
// API Response Types
// ══════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: string | null;
  errors?: Record<string, string[]>;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ══════════════════════════════════════════
// Auth Types
// ══════════════════════════════════════════

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  roles: string[];
  permissions: string[];
}

export type Permission =
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "orders:create"
  | "orders:read"
  | "orders:update"
  | "orders:delete"
  | "customers:create"
  | "customers:read"
  | "customers:update"
  | "customers:delete"
  | "payments:read"
  | "payments:refund"
  | "shipping:read"
  | "shipping:update"
  | "reviews:read"
  | "reviews:moderate"
  | "analytics:read"
  | "notifications:read"
  | "integrations:read"
  | "integrations:manage"
  | "settings:read"
  | "settings:manage"
  | "products:read"
  | "products:write";

export type RoleSlug =
  | "super-admin"
  | "admin"
  | "manager"
  | "finance"
  | "operations"
  | "support"
  | "marketing";

// ══════════════════════════════════════════
// Order Types
// ══════════════════════════════════════════

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "ON_HOLD";

export type OrderSource = "WEB" | "MOBILE" | "POS" | "API" | "MANUAL";

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  sku?: string | null;
  name: string;
  image?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  source: OrderSource;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  notes?: string | null;
  tags: string[];
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  orderItems?: OrderItem[];
}

// ══════════════════════════════════════════
// Customer Types
// ══════════════════════════════════════════

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  tags: string[];
  source?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ══════════════════════════════════════════
// Payment Types
// ══════════════════════════════════════════

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CRYPTO"
  | "CASH_ON_DELIVERY"
  | "STORE_CREDIT";

export type RefundStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED";

// ══════════════════════════════════════════
// Shipping Types
// ══════════════════════════════════════════

export type ShipmentStatus =
  | "PENDING"
  | "LABEL_CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED"
  | "CANCELLED";

// ══════════════════════════════════════════
// Analytics Types
// ══════════════════════════════════════════

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  refundRate: number;
  refundRateChange: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
  totalCustomers: number;
}
