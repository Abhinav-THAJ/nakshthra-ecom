import { PrismaClient, OrderStatus, OrderSource, PaymentStatus, PaymentMethod, ShipmentStatus, ReviewStatus } from "@prisma/client";
import { subDays, eachDayOfInterval } from "date-fns";
import fs from "fs";
import path from "path";

// Manually load env variables from .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        if (key && !key.startsWith("#")) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn("Failed to load .env.local", e);
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding mock store activity data...");

  // 1. Create or ensure some mock products
  const productsData = [
    { name: "22K Gold Classic Ring", sku: "RING-22K-001", basePrice: 42000, karatage: 22, weight: 6.5, inventory: 50 },
    { name: "24K Gold Sovereign Coin", sku: "COIN-24K-008", basePrice: 59000, karatage: 24, weight: 8.0, inventory: 100 },
    { name: "18K Diamond Stud Earrings", sku: "EAR-18K-002", basePrice: 85000, karatage: 18, weight: 4.2, inventory: 15 },
    { name: "22K Gold Bridal Necklace", sku: "NECK-22K-009", basePrice: 245000, karatage: 22, weight: 32.5, inventory: 8 },
    { name: "22K Gold Unisex Bangle", sku: "BANG-22K-005", basePrice: 95000, karatage: 22, weight: 14.8, inventory: 24 }
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      create: p,
      update: { basePrice: p.basePrice, inventory: p.inventory }
    });
    products.push(product);
  }
  console.log(`✓ Upserted ${products.length} mock products`);

  // 2. Create or ensure some mock customers
  const customersData = [
    { email: "rahul.sharma@example.com", firstName: "Rahul", lastName: "Sharma", phone: "+91 98765 43210" },
    { email: "priya.nair@example.com", firstName: "Priya", lastName: "Nair", phone: "+91 94470 12345" },
    { email: "amit.patel@example.com", firstName: "Amit", lastName: "Patel", phone: "+91 98250 98765" },
    { email: "sneha.reddy@example.com", firstName: "Sneha", lastName: "Reddy", phone: "+91 99887 76655" },
    { email: "ananya.rao@example.com", firstName: "Ananya", lastName: "Rao", phone: "+91 90001 23456" }
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      create: c,
      update: {}
    });
    customers.push(customer);
  }
  console.log(`✓ Upserted ${customers.length} mock customers`);

  // Clean old orders/payments/shipments/reviews created by mock seed to avoid infinite accumulation
  // (Optional: but good for keeping a clean environment when testing)
  // Let's just create new ones and spread them over the last 30 days
  const now = new Date();
  const start = subDays(now, 30);
  const days = eachDayOfInterval({ start, end: now });

  let totalOrdersCreated = 0;
  let totalRevenueCreated = 0;

  console.log("⏳ Generating orders and completed payments over the last 30 days...");

  for (const date of days) {
    // Generate a random number of orders for each day (e.g. 0 to 2)
    const numOrders = Math.floor(Math.random() * 3); 

    for (let i = 0; i < numOrders; i++) {
      // Pick a random customer and product
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];

      const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2
      const itemPrice = Number(product.basePrice);
      const subtotal = itemPrice * qty;
      const tax = Math.round(subtotal * 0.03); // 3% GST on Gold
      const total = subtotal + tax;

      const orderNumber = `ORD-${date.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Create Order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: OrderStatus.DELIVERED,
          source: OrderSource.WEB,
          subtotal,
          taxAmount: tax,
          total,
          createdAt: date,
          updatedAt: date,
          orderItems: {
            create: {
              productId: product.id,
              name: product.name,
              sku: product.sku,
              quantity: qty,
              unitPrice: itemPrice,
              totalPrice: subtotal,
              createdAt: date
            }
          },
          payments: {
            create: {
              transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              method: PaymentMethod.CREDIT_CARD,
              status: PaymentStatus.COMPLETED,
              amount: total,
              processedAt: date,
              createdAt: date,
              updatedAt: date
            }
          },
          shipments: {
            create: {
              carrierName: "Blue Dart",
              trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
              status: ShipmentStatus.DELIVERED,
              deliveredAt: date,
              createdAt: date,
              updatedAt: date
            }
          }
        }
      });

      // Update customer aggregates
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
          lifetimeValue: { increment: total }
        }
      });

      totalOrdersCreated++;
      totalRevenueCreated += total;
    }
  }

  console.log(`✓ Created ${totalOrdersCreated} orders with a total revenue of ₹${totalRevenueCreated.toLocaleString()}`);
  console.log("✅ Mock data seed successful!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
