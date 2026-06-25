import prisma from "@/lib/prisma";
import { paginationMeta } from "@/lib/api-helpers";
import { logAudit } from "@/lib/logger";
import { encrypt } from "@/lib/encryption";

interface IntegrationListQuery {
  page: number;
  limit: number;
  type?: string;
  status?: string;
}

export class IntegrationService {
  static async list(query: IntegrationListQuery) {
    const { page, limit, type, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(type && { type }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      prisma.apiIntegration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { syncLogs: true } },
        },
      }),
      prisma.apiIntegration.count({ where }),
    ]);

    // Mask secrets before returning
    const maskedItems = items.map((i) => ({
      ...i,
      apiKey: i.apiKey ? "***" + i.apiKey.slice(-4) : null,
      apiSecret: i.apiSecret ? "***masked***" : null,
      webhookSecret: i.webhookSecret ? "***masked***" : null,
    }));

    return { items: maskedItems, meta: paginationMeta(total, page, limit) };
  }

  static async getById(id: string) {
    const integration = await prisma.apiIntegration.findUnique({
      where: { id },
      include: {
        syncLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!integration) return null;

    return {
      ...integration,
      apiKey: integration.apiKey ? "***" + integration.apiKey.slice(-4) : null,
      apiSecret: integration.apiSecret ? "***masked***" : null,
      webhookSecret: integration.webhookSecret ? "***masked***" : null,
    };
  }

  static async create(
    data: {
      name: string;
      slug: string;
      type: string;
      baseUrl: string;
      apiKey?: string;
      apiSecret?: string;
      webhookUrl?: string;
      webhookSecret?: string;
      config?: Record<string, unknown>;
    },
    createdBy: string
  ) {
    const existing = await prisma.apiIntegration.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error("An integration with this slug already exists");

    const secureData = {
      ...data,
      apiKey: data.apiKey ? encrypt(data.apiKey) : undefined,
      apiSecret: data.apiSecret ? encrypt(data.apiSecret) : undefined,
      webhookSecret: data.webhookSecret ? encrypt(data.webhookSecret) : undefined,
    };

    const integration = await prisma.apiIntegration.create({ data: secureData as any });

    await logAudit({
      performedBy: createdBy,
      action: "CREATE",
      module: "integrations",
      entityType: "ApiIntegration",
      entityId: integration.id,
      newValues: { name: data.name, type: data.type, slug: data.slug },
    });

    return integration;
  }

  static async updateStatus(id: string, status: string, userId: string, error?: string) {
    const integration = await prisma.apiIntegration.update({
      where: { id },
      data: {
        status: status as any,
        ...(error && { lastError: error, lastErrorAt: new Date() }),
        ...(!error && status === "ACTIVE" && { lastError: null, lastErrorAt: null }),
      },
    });

    await logAudit({
      performedBy: userId,
      action: "UPDATE",
      module: "integrations",
      entityType: "ApiIntegration",
      entityId: id,
      newValues: { status },
    });

    return integration;
  }

  static async logSync(
    integrationId: string,
    type: string,
    status: "SUCCESS" | "FAILED" | "PARTIAL",
    stats: { recordsTotal: number; recordsSynced: number; errors?: unknown; duration?: number }
  ) {
    return prisma.apiSyncLog.create({
      data: {
        integrationId,
        type,
        status,
        recordsTotal: stats.recordsTotal,
        recordsSynced: stats.recordsSynced,
        errors: stats.errors as any,
        duration: stats.duration,
        startedAt: new Date(Date.now() - (stats.duration || 0)),
        completedAt: new Date(),
      },
    });
  }

  static async testConnection(id: string): Promise<{ success: boolean; latency: number; error?: string }> {
    const integration = await prisma.apiIntegration.findUnique({ where: { id } });
    if (!integration) throw new Error("Integration not found");

    const start = Date.now();
    try {
      const res = await fetch(integration.baseUrl, { signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      return { success: res.ok || res.status < 500, latency };
    } catch (err: any) {
      return { success: false, latency: Date.now() - start, error: err.message };
    }
  }

  static async getSyncLogs(integrationId: string, limit = 20) {
    return prisma.apiSyncLog.findMany({
      where: { integrationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
