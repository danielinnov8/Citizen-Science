import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type CookieOptions,
} from "express";
import { randomBytes, createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
  GetCurrentUserResponse,
  LogoutResponse,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import {
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from "../lib/auth/session";
import { requireAuth } from "../middlewares/requireAuth";
import { isSuperAdmin } from "../lib/admin/superadmin";

const router: IRouter = Router();

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_COOKIE = "cs_oauth_state";
const OAUTH_VERIFIER_COOKIE = "cs_oauth_verifier";
const OAUTH_TTL_MS = 1000 * 60 * 10; // 10 minutes

function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    isSuperAdmin: isSuperAdmin(user),
  };
}

function baseCookieOptions(req: Request): CookieOptions {
  return {
    httpOnly: true,
    secure: req.secure,
    sameSite: "lax",
    signed: true,
    path: "/",
  };
}

function sessionCookieOptions(req: Request): CookieOptions {
  return { ...baseCookieOptions(req), maxAge: SESSION_TTL_MS };
}

function getGoogleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function isLocalHost(host: string): boolean {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

// The set of hosts we are willing to build a redirect URI for. `trust proxy`
// is enabled, so req.get("host") reflects a client-controllable header; we must
// only honor it when it matches a domain we actually own. REPLIT_DOMAINS lists
// every domain bound to the deployment (the .replit.app domain plus any custom
// domains), so it is the natural allowlist.
function getAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const configured = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (configured) {
    try {
      hosts.add(new URL(configured).host);
    } catch {
      // ignore a malformed PUBLIC_BASE_URL
    }
  }
  for (const domain of (process.env.REPLIT_DOMAINS ?? "").split(",")) {
    const trimmed = domain.trim();
    if (trimmed) hosts.add(trimmed);
  }
  return hosts;
}

function getRedirectUri(req: Request): string {
  // 1) Explicit override pins the redirect URI to exactly what is registered in
  //    the Google console.
  const configured = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (configured) return `${configured}/api/auth/google/callback`;

  // 2) Use the actual request origin so the entire OAuth round-trip stays on
  //    the domain the user started on — this keeps the signed state/verifier
  //    cookies in scope at the callback and guarantees the redirect_uri used at
  //    /authorize matches the one used at token exchange, even when the
  //    deployment is reachable via several domains. Only honored when the host
  //    is one we own (allowlist) or local, so a spoofed Host header can't
  //    redirect the flow to an attacker-controlled origin.
  const host = req.get("host");
  if (host && isLocalHost(host)) {
    return `${req.protocol}://${host}/api/auth/google/callback`;
  }
  if (host && getAllowedHosts().has(host)) {
    return `https://${host}/api/auth/google/callback`;
  }

  // 3) Fall back to the first configured Replit domain.
  const domain = (process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim();
  if (domain) return `https://${domain}/api/auth/google/callback`;

  throw new Error(
    "Unable to determine the OAuth redirect URI (set PUBLIC_BASE_URL).",
  );
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name?.trim() || null;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const passwordHash = await hashPassword(parsed.data.password);

  let user: User;
  if (existing) {
    // A user that signed up with Google first has no passwordHash. Allow them
    // to add email/password to the same account (link the two methods).
    if (existing.passwordHash) {
      res
        .status(409)
        .json({ error: "An account with this email already exists." });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ passwordHash, name: existing.name ?? name })
      .where(eq(usersTable.id, existing.id))
      .returning();
    user = updated;
  } else {
    const [created] = await db
      .insert(usersTable)
      .values({ email, name, passwordHash })
      .returning();
    user = created;
  }

  const sid = await createSession(user.id);
  res.cookie(SESSION_COOKIE, sid, sessionCookieOptions(req));
  res.status(201).json(GetCurrentUserResponse.parse(toAuthUser(user)));
});

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const sid = await createSession(user.id);
  res.cookie(SESSION_COOKIE, sid, sessionCookieOptions(req));
  res.json(GetCurrentUserResponse.parse(toAuthUser(user)));
});

router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  const sid = req.signedCookies?.[SESSION_COOKIE];
  if (sid && typeof sid === "string") {
    await deleteSession(sid);
  }
  res.clearCookie(SESSION_COOKIE, { ...baseCookieOptions(req) });
  res.json(LogoutResponse.parse({ success: true }));
});

router.get("/auth/me", requireAuth, (req: Request, res: Response): void => {
  res.json(GetCurrentUserResponse.parse(toAuthUser(req.user as User)));
});

router.get("/auth/google", (req: Request, res: Response): void => {
  const config = getGoogleConfig();
  if (!config) {
    res.redirect("/login?error=google_unconfigured");
    return;
  }

  const state = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(
    createHash("sha256").update(verifier).digest(),
  );

  const oauthCookie: CookieOptions = {
    ...baseCookieOptions(req),
    maxAge: OAUTH_TTL_MS,
  };
  res.cookie(OAUTH_STATE_COOKIE, state, oauthCookie);
  res.cookie(OAUTH_VERIFIER_COOKIE, verifier, oauthCookie);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: getRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

router.get(
  "/auth/google/callback",
  async (req: Request, res: Response): Promise<void> => {
    const config = getGoogleConfig();
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const cookieState = req.signedCookies?.[OAUTH_STATE_COOKIE];
    const verifier = req.signedCookies?.[OAUTH_VERIFIER_COOKIE];

    res.clearCookie(OAUTH_STATE_COOKIE, { ...baseCookieOptions(req) });
    res.clearCookie(OAUTH_VERIFIER_COOKIE, { ...baseCookieOptions(req) });

    if (
      !config ||
      !code ||
      !state ||
      !cookieState ||
      state !== cookieState ||
      !verifier ||
      typeof verifier !== "string"
    ) {
      req.log.warn(
        {
          hasConfig: Boolean(config),
          hasCode: Boolean(code),
          hasState: Boolean(state),
          hasCookieState: Boolean(cookieState),
          stateMatches: Boolean(state && cookieState && state === cookieState),
          hasVerifier: Boolean(verifier),
          host: req.get("host"),
        },
        "google oauth callback precondition failed",
      );
      res.redirect("/login?error=google");
      return;
    }

    try {
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: getRedirectUri(req),
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
      });

      if (!tokenRes.ok) {
        const detail = await tokenRes.text().catch(() => "");
        req.log.error(
          { status: tokenRes.status, detail, redirectUri: getRedirectUri(req) },
          "google token exchange failed",
        );
        res.redirect("/login?error=google");
        return;
      }

      const tokens = (await tokenRes.json()) as { access_token?: string };
      if (!tokens.access_token) {
        res.redirect("/login?error=google");
        return;
      }

      const userinfoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!userinfoRes.ok) {
        res.redirect("/login?error=google");
        return;
      }

      const profile = (await userinfoRes.json()) as {
        sub: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      if (!profile.sub || !profile.email) {
        res.redirect("/login?error=google");
        return;
      }

      const email = profile.email.trim().toLowerCase();
      const googleId = profile.sub;

      let [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.googleId, googleId));

      if (!user) {
        [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email));

        if (user) {
          [user] = await db
            .update(usersTable)
            .set({
              googleId,
              image: user.image ?? profile.picture ?? null,
              name: user.name ?? profile.name ?? null,
              updatedAt: new Date(),
            })
            .where(eq(usersTable.id, user.id))
            .returning();
        } else {
          [user] = await db
            .insert(usersTable)
            .values({
              email,
              name: profile.name ?? null,
              googleId,
              image: profile.picture ?? null,
            })
            .returning();
        }
      }

      const sid = await createSession(user.id);
      res.cookie(SESSION_COOKIE, sid, sessionCookieOptions(req));
      res.redirect("/login");
    } catch (err) {
      req.log.error({ err }, "google oauth callback failed");
      res.redirect("/login?error=google");
    }
  },
);

export default router;
