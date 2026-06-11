import type { Request, Response, NextFunction } from "express";
import type { User } from "@workspace/db";

// Superadmin allowlist. These two accounts get full visibility over the platform
// via the /admin portal. Extendable at runtime with a comma-separated
// SUPERADMIN_EMAILS env override (added on top of the built-in two) without a
// code change. There is intentionally no broader role system — this is a tiny
// hard-coded allowlist, nothing more.
const DEFAULT_SUPERADMIN_EMAILS = [
  "danielinnov8@gmail.com",
  "manu@tabulalingua.com",
];

export function superAdminEmails(): Set<string> {
  const fromEnv = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([
    ...DEFAULT_SUPERADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...fromEnv,
  ]);
}

// Whether a user (or anything carrying an email) is a superadmin. Case- and
// whitespace-insensitive on the email.
export function isSuperAdmin(
  user: { email?: string | null } | null | undefined,
): boolean {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return false;
  return superAdminEmails().has(email);
}

// Express middleware that gates a route to superadmins only. Must run AFTER
// `requireAuth` (which attaches req.user); a missing or non-allowlisted user
// gets a 403 so non-admins hitting the admin API directly are refused.
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = req.user as User | undefined;
  if (!isSuperAdmin(user)) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }
  next();
}
