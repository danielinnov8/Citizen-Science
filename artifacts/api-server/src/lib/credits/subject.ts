import { randomBytes } from "node:crypto";
import type { Request, Response, CookieOptions } from "express";
import type { User } from "@workspace/db";
import { getUserBySession, SESSION_COOKIE } from "../auth/session";
import {
  GUEST_MONTHLY_CREDITS,
  monthlyCreditsForPlan,
  normalizePlan,
  type PlanId,
} from "./plans";

// Signed cookie used to meter anonymous (logged-out) visitors per browser, so
// credit limits can't be sidestepped simply by chatting as a guest.
const ANON_COOKIE = "cs_anon";
const ANON_COOKIE_TTL_MS = 1000 * 60 * 60 * 24 * 400; // ~13 months

// Resolve a stable per-browser anonymous id, issuing a signed cookie the first
// time we see a guest. Must be called before SSE headers are flushed.
export function ensureAnonId(req: Request, res: Response): string {
  const existing = req.signedCookies?.[ANON_COOKIE];
  if (typeof existing === "string" && existing.length > 0) return existing;

  const id = randomBytes(16).toString("base64url");
  const opts: CookieOptions = {
    httpOnly: true,
    secure: req.secure,
    sameSite: "lax",
    signed: true,
    path: "/",
    maxAge: ANON_COOKIE_TTL_MS,
  };
  res.cookie(ANON_COOKIE, id, opts);
  return id;
}

// The billable subject behind a request: either a signed-in user or an
// anonymous guest. `subjectKey` is the stable ledger key; `monthlyGrant` is the
// plan's monthly credit allotment.
export interface BillingSubject {
  subjectKey: string;
  isGuest: boolean;
  plan: PlanId | "guest";
  monthlyGrant: number;
  user: User | null;
}

// Resolve the billable subject for a request. Reads the session cookie to
// identify a user; otherwise issues/reads the anon cookie for a guest. Issuing
// the guest cookie means this must run before SSE headers are flushed.
export async function resolveBillingSubject(
  req: Request,
  res: Response,
): Promise<BillingSubject> {
  let user: User | null = null;
  const sid = req.signedCookies?.[SESSION_COOKIE];
  if (typeof sid === "string" && sid.length > 0) {
    try {
      user = await getUserBySession(sid);
    } catch (err) {
      req.log?.warn({ err }, "billing subject: session lookup failed");
    }
  }

  if (user) {
    return {
      subjectKey: `user:${user.id}`,
      isGuest: false,
      plan: normalizePlan(user.plan),
      monthlyGrant: monthlyCreditsForPlan(user.plan),
      user,
    };
  }

  return {
    subjectKey: `guest:${ensureAnonId(req, res)}`,
    isGuest: true,
    plan: "guest",
    monthlyGrant: GUEST_MONTHLY_CREDITS,
    user: null,
  };
}
