import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators/auth.validator";
import { logAudit } from "@/lib/logger";

import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email, deletedAt: null },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const permissions = user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map(
            (rp) => `${rp.permission.module}:${rp.permission.action}`
          )
        );

        const roles = user.userRoles.map((ur) => ur.role.slug);

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          roles,
          permissions,
        };
      },
    }),
  ],

  /**
   * Audit login and logout events.
   * NextAuth's `events` callbacks are the only reliable hook for this.
   */
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      await logAudit({
        performedBy: user.id,
        action: "LOGIN",
        module: "auth",
        entityType: "User",
        entityId: user.id,
        newValues: { email: user.email, timestamp: new Date().toISOString() },
      });
    },
    async signOut(message) {
      // token is present for JWT strategy
      const token = (message as any).token;
      const userId = token?.id as string | undefined;
      if (!userId) return;
      await logAudit({
        performedBy: userId,
        action: "LOGOUT",
        module: "auth",
        entityType: "User",
        entityId: userId,
        newValues: { timestamp: new Date().toISOString() },
      });
    },
  },

  secret: process.env.AUTH_SECRET,
});
