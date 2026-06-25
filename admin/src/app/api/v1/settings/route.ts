import { NextRequest } from "next/server";
import { SettingsService } from "@/server/services/settings.service";
import { getAuthSession, requirePermission } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

/** Only these setting keys are writable via the API.
 *  Add new keys here when you add them to the seed. */
const ALLOWED_SETTING_KEYS = [
  "store_name",
  "store_currency",
  "store_timezone",
  "email_notifications",
  "order_auto_confirm",
  "require_2fa",
  "session_timeout",
] as const;

const patchBodySchema = z
  .record(z.string(), z.unknown())
  .refine(
    (obj) => {
      const keys = Object.keys(obj);
      return keys.length > 0 && keys.every((k) => (ALLOWED_SETTING_KEYS as readonly string[]).includes(k));
    },
    {
      message: `Body must contain only valid setting keys: ${ALLOWED_SETTING_KEYS.join(", ")}`,
    }
  );

const groupQuerySchema = z.object({
  group: z.enum(["general", "notifications", "security"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "settings:read");

    const p = req.nextUrl.searchParams;
    const group = p.get("group") || undefined;

    // If ?group= is provided, return only that group
    if (group) {
      const parsed = groupQuerySchema.safeParse({ group });
      if (!parsed.success) {
        return errorResponse("Invalid group parameter", 400);
      }
      const settings = await SettingsService.getByGroup(parsed.data.group!);
      return successResponse(settings);
    }

    const settings = await SettingsService.getAll();
    return successResponse(settings);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    await requirePermission(session.user.permissions, "settings:manage");

    const body = await req.json();
    const parsed = patchBodySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message || "Invalid request body",
        400
      );
    }

    const results = await SettingsService.bulkUpdate(parsed.data, session.user.id);
    return successResponse(results);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AuthenticationError") return errorResponse(error.message, 401);
      if (error.name === "AuthorizationError") return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }
}
