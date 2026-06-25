import { NextRequest } from "next/server";
import { IntegrationService } from "@/server/services/integration.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(["courier", "payment", "product", "notification", "analytics"]).optional(),
  status: z.string().max(50).optional(),
});

const createIntegrationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  type: z.enum(["courier", "payment", "product", "notification", "analytics"]),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "integrations:read");

    const p = req.nextUrl.searchParams;
    const parsed = listQuerySchema.safeParse({
      page: p.get("page") ?? undefined,
      limit: p.get("limit") ?? undefined,
      type: p.get("type") ?? undefined,
      status: p.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten().fieldErrors as any);
    }

    const result = await IntegrationService.list(parsed.data);
    return successResponse(result.items, result.meta);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "integrations:manage");

    const body = await req.json();
    const data = createIntegrationSchema.parse(body);
    const integration = await IntegrationService.create(data, session.user.id);
    return successResponse(integration, undefined, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
      if (error.message.includes("already exists")) return errorResponse(error.message, 409);
    }
    return errorResponse("Internal server error", 500);
  }
}
