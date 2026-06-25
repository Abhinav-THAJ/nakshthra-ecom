import prisma from "@/lib/prisma";

interface LogActivityParams {
  userId?: string;
  customerId?: string;
  orderId?: string;
  action: string;
  module: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface LogAuditParams {
  performedBy: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        customerId: params.customerId,
        orderId: params.orderId,
        action: params.action,
        module: params.module,
        description: params.description,
        metadata: params.metadata as any,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Never crash the application due to logging failure
    console.error("[ActivityLog] Failed to write activity log:", error);
  }
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        performedBy: params.performedBy,
        action: params.action,
        module: params.module,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues as any,
        newValues: params.newValues as any,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}

export function createLogger(module: string) {
  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      console.log(`[${new Date().toISOString()}] [INFO] [${module}] ${message}`, meta || "");
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn(`[${new Date().toISOString()}] [WARN] [${module}] ${message}`, meta || "");
    },
    error: (message: string, error?: unknown) => {
      console.error(`[${new Date().toISOString()}] [ERROR] [${module}] ${message}`, error || "");
    },
  };
}
