import type { Request, Response, NextFunction } from "express";
import { getUserBySession, SESSION_COOKIE } from "../lib/auth/session";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const sid = req.signedCookies?.[SESSION_COOKIE];
  if (!sid || typeof sid !== "string") {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = await getUserBySession(sid);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  req.user = user;
  next();
}
