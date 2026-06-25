import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/logger";

export class AuthService {
  static async createPasswordResetToken(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal if the email exists or not
      return null;
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // In a real application, send the email here using a mailer service.
    // For now, we'll log it to console to allow manual testing.
    console.log(`[Email Mock] Password reset link for ${email}: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);
    
    return token;
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      throw new Error("Invalid or expired token");
    }

    if (resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new Error("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await logAudit({
      performedBy: user.id,
      action: "RESET_PASSWORD",
      module: "auth",
      entityType: "User",
      entityId: user.id,
      oldValues: { status: "PASSWORD_CHANGED" },
    });

    return true;
  }
}
