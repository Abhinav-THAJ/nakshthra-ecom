import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/logger";

export class SettingsService {
  static async getByGroup(group: string) {
    const settings = await prisma.setting.findMany({
      where: { group },
      orderBy: { key: "asc" },
    });
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  static async getAll() {
    const settings = await prisma.setting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    const grouped: Record<string, any> = {};
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = {
        value: s.value,
        label: s.label,
        isPublic: s.isPublic,
      };
    }
    return grouped;
  }

  static async update(
    key: string,
    value: unknown,
    updatedBy: string
  ) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (!existing) throw new Error(`Setting "${key}" not found`);

    const updated = await prisma.setting.update({
      where: { key },
      data: { value: value as any },
    });

    await logAudit({
      performedBy: updatedBy,
      action: "UPDATE",
      module: "settings",
      entityType: "Setting",
      entityId: key,
      oldValues: { value: existing.value },
      newValues: { value },
    });

    return updated;
  }

  static async bulkUpdate(
    updates: Record<string, unknown>,
    updatedBy: string
  ) {
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        SettingsService.update(key, value, updatedBy).catch((err) => ({
          key,
          error: err.message,
        }))
      )
    );
    return results;
  }
}
