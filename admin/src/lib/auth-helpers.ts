import { auth } from "@/lib/auth";
import { type Permission } from "@/types";

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "You must be logged in to perform this action") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError();
  }
  return session;
}

export async function requirePermission(
  userPermissions: string[],
  permission: Permission
): Promise<void> {
  const hasPermission =
    userPermissions.includes(permission) ||
    userPermissions.includes("*:*") ||
    userPermissions.includes(`${permission.split(":")[0]}:*`);

  if (!hasPermission) {
    throw new AuthorizationError(
      `Missing permission: ${permission}`
    );
  }
}

export async function requireAnyPermission(
  userPermissions: string[],
  permissions: Permission[]
): Promise<void> {
  const hasAny = permissions.some(
    (p) =>
      userPermissions.includes(p) ||
      userPermissions.includes("*:*") ||
      userPermissions.includes(`${p.split(":")[0]}:*`)
  );

  if (!hasAny) {
    throw new AuthorizationError();
  }
}

export function hasPermission(
  userPermissions: string[],
  permission: Permission
): boolean {
  return (
    userPermissions.includes(permission) ||
    userPermissions.includes("*:*") ||
    userPermissions.includes(`${permission.split(":")[0]}:*`)
  );
}

export function isSuperAdmin(roles: string[]): boolean {
  return roles.includes("super-admin");
}

export function isAdmin(roles: string[]): boolean {
  return roles.includes("super-admin") || roles.includes("admin");
}
