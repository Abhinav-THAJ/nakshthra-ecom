import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Validate required environment variables early */
function requireEnv(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback;
  if (!val) throw new Error(`Missing required env variable: ${name}`);
  return val;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Permissions ──────────────────────────────────────────────────────────
  const permissions = [
    // Users
    { module: "users", action: "create" },
    { module: "users", action: "read" },
    { module: "users", action: "update" },
    { module: "users", action: "delete" },
    // Orders
    { module: "orders", action: "create" },
    { module: "orders", action: "read" },
    { module: "orders", action: "update" },
    { module: "orders", action: "delete" },
    // Customers
    { module: "customers", action: "create" },
    { module: "customers", action: "read" },
    { module: "customers", action: "update" },
    { module: "customers", action: "delete" },
    // Payments
    { module: "payments", action: "read" },
    { module: "payments", action: "refund" },
    // Shipping
    { module: "shipping", action: "read" },
    { module: "shipping", action: "update" },
    // Reviews
    { module: "reviews", action: "read" },
    { module: "reviews", action: "moderate" },
    // Analytics
    { module: "analytics", action: "read" },
    // Notifications
    { module: "notifications", action: "read" },
    // Integrations
    { module: "integrations", action: "read" },
    { module: "integrations", action: "manage" },
    // Settings
    { module: "settings", action: "read" },
    { module: "settings", action: "manage" },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((p) =>
      prisma.permission.upsert({
        where: { module_action: p },
        create: p,
        update: {},
      })
    )
  );

  const permMap = new Map(
    createdPermissions.map((p) => [`${p.module}:${p.action}`, p.id])
  );

  // ─── Roles ────────────────────────────────────────────────────────────────
  const roleDefinitions = [
    {
      name: "Super Admin",
      slug: "super-admin",
      description: "Full access to everything",
      isSystem: true,
      permissions: Object.keys(Object.fromEntries(permMap)), // all
    },
    {
      name: "Admin",
      slug: "admin",
      description: "Full access except delete users",
      isSystem: true,
      permissions: [
        "users:create", "users:read", "users:update",
        "orders:create", "orders:read", "orders:update", "orders:delete",
        "customers:create", "customers:read", "customers:update",
        "payments:read", "payments:refund",
        "shipping:read", "shipping:update",
        "reviews:read", "reviews:moderate",
        "analytics:read", "notifications:read",
        "integrations:read", "integrations:manage",
        "settings:read", "settings:manage",
      ],
    },
    {
      name: "Manager",
      slug: "manager",
      description: "Manage orders, customers, and view analytics",
      isSystem: true,
      permissions: [
        "orders:create", "orders:read", "orders:update",
        "customers:read", "customers:update",
        "shipping:read", "shipping:update",
        "reviews:read", "reviews:moderate",
        "analytics:read", "notifications:read",
      ],
    },
    {
      name: "Finance",
      slug: "finance",
      description: "Payments and financial data",
      isSystem: true,
      permissions: [
        "orders:read", "payments:read", "payments:refund", "analytics:read",
      ],
    },
    {
      name: "Operations",
      slug: "operations",
      description: "Orders and shipping",
      isSystem: true,
      permissions: [
        "orders:read", "orders:update",
        "shipping:read", "shipping:update",
        "customers:read", "analytics:read",
      ],
    },
    {
      name: "Support",
      slug: "support",
      description: "Customer support access",
      isSystem: true,
      permissions: [
        "orders:read", "customers:read",
        "reviews:read", "notifications:read",
        "shipping:read",
      ],
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Analytics and reviews",
      isSystem: true,
      permissions: ["analytics:read", "reviews:read"],
    },
  ];

  const createdRoles: Record<string, string> = {};
  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      update: { name: roleDef.name, description: roleDef.description },
    });
    createdRoles[roleDef.slug] = role.id;

    // Assign permissions
    for (const permKey of roleDef.permissions) {
      const permId = permMap.get(permKey);
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        create: { roleId: role.id, permissionId: permId },
        update: {},
      });
    }
  }

  // ─── Super Admin User ─────────────────────────────────────────────────────
  const adminEmail = requireEnv("SEED_ADMIN_EMAIL", "admin@nakshtragold.com");
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");

  if (adminPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      isActive: true,
      emailVerified: new Date(),
    },
    update: {},
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: createdRoles["super-admin"] } },
    create: { userId: superAdmin.id, roleId: createdRoles["super-admin"] },
    update: {},
  });

  // No sample customers seeded (start with clean database)

  // ─── Default Settings ─────────────────────────────────────────────────────
  const defaultSettings = [
    { key: "store_name",      value: process.env.NEXT_PUBLIC_APP_NAME || "Nakshtra Gold & Diamonds", group: "general", label: "Store Name",    isPublic: true },
    { key: "store_currency",   value: process.env.STORE_DEFAULT_CURRENCY || "INR", group: "general", label: "Currency",      isPublic: true },
    { key: "store_timezone", value: "UTC", group: "general", label: "Timezone", isPublic: true },
    { key: "email_notifications", value: true, group: "notifications", label: "Email Notifications" },
    { key: "order_auto_confirm", value: false, group: "general", label: "Auto-confirm Orders" },
    { key: "require_2fa", value: false, group: "security", label: "Require 2FA" },
    { key: "session_timeout", value: 60, group: "security", label: "Session Timeout (min)" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value, group: s.group, label: s.label, isPublic: s.isPublic ?? false },
      update: {},
    });
  }

  console.log("✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log(`👤 Super Admin: ${adminEmail}`);
  console.log("🔑 Password:    [hidden — set via SEED_ADMIN_PASSWORD env var]");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
