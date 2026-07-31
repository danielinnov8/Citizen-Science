import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type CookieOptions,
} from "express";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
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
import { claimFoundingMemberships } from "../lib/stripe/foundingClaims";
import { createOauthState, consumeOauthState } from "../lib/auth/oauthState";

const router: IRouter = Router();

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_NONCE_COOKIE = "cs_oauth_nonce";
const OAUTH_NONCE_TTL_MS = 1000 * 60 * 10; // 10 minutes

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Constant-time comparison of two hex strings; false on any length mismatch.
function hexEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    isSuperAdmin: isSuperAdmin(user),
    isMentor: user.isMentor,
    foundingMember: user.foundingMember,
    // Server-side source of truth for the story-driven onboarding gate.
    onboarded: user.onboardedAt !== null,
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

  // A guest founding-member purchase made with this email is claimed on
  // first auth — refresh the row so the response reflects the grant.
  if (await claimFoundingMemberships(user.id, user.email)) {
    [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id));
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
  let [user] = await db
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

  // Claim any unclaimed guest founding purchase made with this email.
  if (await claimFoundingMemberships(user.id, user.email)) {
    [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id));
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

router.get("/auth/google", async (req: Request, res: Response): Promise<void> => {
  const config = getGoogleConfig();
  if (!config) {
    res.redirect("/login?error=google_unconfigured");
    return;
  }

  let redirectUri: string;
  try {
    redirectUri = getRedirectUri(req);
  } catch (err) {
    req.log.error({ err }, "google oauth start: cannot resolve redirect uri");
    res.redirect("/login?error=google");
    return;
  }

  const state = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const nonce = base64url(randomBytes(24));

  // Persist the handshake server-side (keyed by `state`) instead of in signed
  // browser cookies. Google echoes `state` back to the callback, which looks it
  // up in the shared DB — so the flow survives the cross-domain Google redirect
  // and works no matter which autoscale instance handles the callback. The exact
  // redirect_uri is stored too so token exchange reuses it byte-for-byte. We also
  // store the hash of a browser nonce: the raw nonce goes into a signed
  // SameSite=Lax cookie, and the callback must present a matching cookie. That
  // binds completion to the same browser that started the flow (login-CSRF
  // protection) without putting the security-critical verifier in a cookie.
  try {
    await createOauthState({
      state,
      verifier,
      nonceHash: sha256Hex(nonce),
      redirectUri,
    });
  } catch (err) {
    req.log.error({ err }, "google oauth start: failed to persist state");
    res.redirect("/login?error=google");
    return;
  }

  res.cookie(OAUTH_NONCE_COOKIE, nonce, {
    ...baseCookieOptions(req),
    maxAge: OAUTH_NONCE_TTL_MS,
  });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
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
    const cookieNonce = req.signedCookies?.[OAUTH_NONCE_COOKIE];

    // The nonce cookie is single-use; clear it regardless of outcome.
    res.clearCookie(OAUTH_NONCE_COOKIE, { ...baseCookieOptions(req) });

    if (!config || !code || !state) {
      req.log.warn(
        {
          hasConfig: Boolean(config),
          hasCode: Boolean(code),
          hasState: Boolean(state),
          host: req.get("host"),
        },
        "google oauth callback precondition failed",
      );
      res.redirect("/login?error=google");
      return;
    }

    // Look up (and single-use consume) the handshake by the state Google echoed
    // back. The stored verifier + redirect_uri come from the /authorize step, so
    // they are correct even if this callback landed on a different domain or
    // instance than the one that started the flow.
    let handshake: {
      verifier: string;
      redirectUri: string;
      nonceHash: string;
    } | null = null;
    try {
      handshake = await consumeOauthState(state);
    } catch (err) {
      req.log.error({ err }, "google oauth callback: state lookup failed");
      res.redirect("/login?error=google");
      return;
    }

    if (!handshake) {
      req.log.warn(
        { host: req.get("host") },
        "google oauth callback: unknown or expired state",
      );
      res.redirect("/login?error=google");
      return;
    }

    // Login-CSRF protection: the browser completing the flow must present the
    // signed nonce cookie set at /authorize, whose hash matches the stored one.
    if (
      typeof cookieNonce !== "string" ||
      !hexEquals(sha256Hex(cookieNonce), handshake.nonceHash)
    ) {
      req.log.warn(
        { host: req.get("host"), hasNonceCookie: typeof cookieNonce === "string" },
        "google oauth callback: nonce mismatch",
      );
      res.redirect("/login?error=google");
      return;
    }

    const { verifier, redirectUri } = handshake;

    try {
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
      });

      if (!tokenRes.ok) {
        const detail = await tokenRes.text().catch(() => "");
        req.log.error(
          { status: tokenRes.status, detail, redirectUri },
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

      // Claim any unclaimed guest founding purchase made with this email.
      if (await claimFoundingMemberships(user.id, user.email)) {
        [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, user.id));
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
