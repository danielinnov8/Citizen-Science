import {
  Router,
  type IRouter,
  type Request,
  type Response,
} from "express";
import { randomBytes } from "node:crypto";
import { streamChat, isGeminiConfigured } from "@workspace/integrations-gemini-ai-server";
import {
  getAvatarProvider,
  listAvatarProviders,
  isAnyAvatarProviderReady,
  DEFAULT_AVATAR_PROVIDER_ID,
  AvatarProviderUnavailableError,
  type AvatarProviderId,
  type VoiceProvider,
} from "@workspace/integrations-avatar-server";
import { rateLimit } from "../middlewares/rateLimit";
import { getAvatarPersona, isTalkable } from "../lib/avatar/personas";
import { resolveBillingSubject } from "../lib/credits/subject";
import { consumeCredits, getCreditState } from "../lib/credits/credits";
import { AVATAR_SESSION_CREDITS, AVATAR_MESSAGE_CREDITS } from "../lib/credits/plans";

// These are paid, per-minute third-party APIs, so we hard-cap every live
// conversation. The client also shows a countdown and ends gracefully, but the
// server is the source of truth: any operation on an expired session is refused
// and the upstream stream is torn down.
const SESSION_MAX_MS = 3 * 60 * 1000; // 3 minutes
// Keep replies short — both for cost (speech is billed per minute) and because
// a spoken answer of 2-4 sentences feels natural.
const REPLY_MAX_TOKENS = 320;
const MAX_USER_TEXT = 1000;
// How many prior turns to send to the model for context.
const HISTORY_TURNS = 12;

type ChatRole = "user" | "assistant";

interface AvatarConversationTurn {
  role: ChatRole;
  content: string;
}

interface AvatarSession {
  id: string;
  // Set when the caller is signed in; null for anonymous guests. The feature is
  // ungated, so ownership is enforced by possession of the unguessable session
  // id (a capability token), not by user identity.
  userId: string | null;
  // Billing subject resolved at session start, so each spoken turn meters
  // credits against the right account (user or guest browser) without re-reading
  // cookies on every /say.
  subjectKey: string;
  monthlyGrant: number;
  figureSlug: string;
  figureName: string;
  personaPrompt: string;
  voiceId: string;
  voiceProvider: VoiceProvider | undefined;
  providerId: AvatarProviderId;
  providerStreamId: string;
  providerSessionId: string;
  history: AvatarConversationTurn[];
  createdAt: number;
  expiresAt: number;
}

// In-memory session store. Live avatar sessions are short-lived (capped at a few
// minutes) and inherently single-process (tied to a live WebRTC peer), so an
// in-memory map is the right fit — there is nothing to persist.
const sessions = new Map<string, AvatarSession>();

function isExpired(s: AvatarSession): boolean {
  return Date.now() > s.expiresAt;
}

// Number of live (non-expired) avatar sessions right now. Used by the admin
// portal's usage board. Reaps expired sessions first so the count is accurate.
// This is ephemeral/in-memory state — it resets on restart and is per-process.
export function liveAvatarSessionCount(): number {
  reapExpired();
  return sessions.size;
}

// Best-effort teardown of the upstream provider stream. Never throws.
async function destroySession(s: AvatarSession): Promise<void> {
  sessions.delete(s.id);
  const provider = getAvatarProvider(s.providerId);
  if (!provider) return;
  try {
    await provider.closeStream({
      providerStreamId: s.providerStreamId,
      providerSessionId: s.providerSessionId,
    });
  } catch {
    /* ignore — the stream may already be gone */
  }
}

// Opportunistically reap expired sessions so abandoned streams don't linger and
// keep billing. Cheap because the map only ever holds a handful of entries.
function reapExpired(): void {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (now > s.expiresAt) {
      void destroySession(s);
    }
  }
}

// Resolve the caller's session and enforce the duration cap. The session id is
// an unguessable random token, so possession of it is the access check. On an
// expired session it tears down the upstream stream and responds 410. Returns
// null when a response has already been sent (caller should return).
async function resolveOwnedSession(
  req: Request,
  res: Response,
): Promise<AvatarSession | null> {
  const id = String(req.params.id);
  const s = sessions.get(id);
  if (!s) {
    res.status(404).json({ error: "Session not found." });
    return null;
  }
  if (isExpired(s)) {
    await destroySession(s);
    res.status(410).json({ error: "This conversation has ended.", expired: true });
    return null;
  }
  return s;
}

// Resolve a site-relative path to an absolute, publicly fetchable URL so the
// avatar provider (which downloads the portrait server-side) can reach it. The
// path is joined onto the public origin (PUBLIC_BASE_URL, falling back to the
// first REPLIT_DOMAINS host); absolute http(s) URLs pass through.
function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const configured = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  const domain = (process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim();
  const origin = configured ?? (domain ? `https://${domain}` : "");
  return origin ? `${origin}${path}` : path;
}

const router: IRouter = Router();

// Public: describe a figure's live-avatar capability so the profile page can
// decide whether to show the "Talk to {name}" button. Returns no secrets.
router.get("/avatar/figures/:slug", (req: Request, res: Response): void => {
  const slug = String(req.params.slug);
  const persona = getAvatarPersona(slug);
  const providers = listAvatarProviders();

  if (!persona) {
    res.json({ slug, talkable: false, available: false, providers });
    return;
  }

  // The feature can run only when a working provider is configured AND the
  // conversation brain (Gemini) is available to generate persona replies.
  const available = isAnyAvatarProviderReady() && isGeminiConfigured();
  const reason = available
    ? undefined
    : "The live avatar isn't configured yet. An admin needs to add the required API keys.";

  res.json({
    slug,
    talkable: true,
    available,
    name: persona.name,
    firstName: persona.firstName,
    reason,
    providers,
  });
});

// The live experience below is open to everyone (ungated). Cost is bounded by
// the per-IP rate limit on session creation and the hard per-session duration
// cap; ownership of an active session is enforced by its unguessable id.

// Provider catalog for the conversation UI's engine dropdown.
router.get("/avatar/providers", (_req: Request, res: Response): void => {
  res.json({ providers: listAvatarProviders(), defaultId: DEFAULT_AVATAR_PROVIDER_ID });
});

// Start a live avatar session: create the upstream WebRTC stream and return the
// SDP offer + ICE servers the browser must answer. Rate-limited to bound cost.
router.post(
  "/avatar/sessions",
  rateLimit({ windowMs: 10 * 60 * 1000, max: 15 }),
  async (req: Request, res: Response): Promise<void> => {
    reapExpired();

    const body = req.body as { slug?: unknown; providerId?: unknown };
    const slug = typeof body.slug === "string" ? body.slug : "";
    const requestedProviderId =
      typeof body.providerId === "string"
        ? (body.providerId as AvatarProviderId)
        : DEFAULT_AVATAR_PROVIDER_ID;

    const persona = getAvatarPersona(slug);
    if (!persona) {
      res.status(404).json({ error: "This figure can't be talked to." });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({
        error: "The conversation engine isn't configured. Please try again later.",
      });
      return;
    }

    // Gate on credits before starting a (paid) live session. The session open
    // itself costs AVATAR_SESSION_CREDITS (250); verify the balance covers that
    // before spinning up the expensive D-ID stream. Fail-open on lookup error.
    const subject = await resolveBillingSubject(req, res);
    try {
      const state = await getCreditState(subject.subjectKey, subject.monthlyGrant);
      if (state.totalRemaining < AVATAR_SESSION_CREDITS) {
        res.status(402).json({
          error: subject.isGuest
            ? `Starting a live avatar requires ${AVATAR_SESSION_CREDITS} credits. Create a free account to get more.`
            : `Starting a live avatar requires ${AVATAR_SESSION_CREDITS} credits. Top up or upgrade your plan.`,
          outOfCredits: true,
          isGuest: subject.isGuest,
          upgradeHref: subject.isGuest ? "/login" : "/pricing",
        });
        return;
      }
    } catch (err) {
      req.log?.warn({ err }, "credit pre-check failed; allowing avatar session");
    }

    const provider = getAvatarProvider(requestedProviderId);
    if (!provider) {
      res.status(400).json({ error: "Unknown avatar provider." });
      return;
    }
    if (provider.status !== "available") {
      res.status(400).json({
        error: `${provider.label} is coming soon and isn't available yet. Please choose D-ID.`,
      });
      return;
    }
    if (!provider.isConfigured()) {
      res.status(503).json({
        error: `${provider.label} isn't configured yet. An admin needs to add the required API keys.`,
      });
      return;
    }

    try {
      const stream = await provider.createStream({
        sourceUrl: toAbsoluteUrl(persona.portraitUrl),
      });

      const id = randomBytes(18).toString("base64url");
      const now = Date.now();
      const session: AvatarSession = {
        id,
        userId: req.user?.id ?? null,
        subjectKey: subject.subjectKey,
        monthlyGrant: subject.monthlyGrant,
        figureSlug: persona.slug,
        figureName: persona.name,
        personaPrompt: persona.personaPrompt,
        voiceId: persona.voiceId,
        voiceProvider: persona.voiceProvider,
        providerId: provider.id,
        providerStreamId: stream.providerStreamId,
        providerSessionId: stream.providerSessionId,
        history: [],
        createdAt: now,
        expiresAt: now + SESSION_MAX_MS,
      };
      sessions.set(id, session);

      // Charge the session-open fee now that the stream is live. Fail-open so
      // a billing hiccup doesn't strand the user mid-session.
      try {
        await consumeCredits(subject.subjectKey, subject.monthlyGrant, AVATAR_SESSION_CREDITS);
      } catch (meterErr) {
        req.log?.warn({ err: meterErr }, "avatar session credit deduction failed");
      }

      res.json({
        sessionId: id,
        providerId: provider.id,
        offer: stream.offer,
        iceServers: stream.iceServers,
        maxDurationMs: SESSION_MAX_MS,
        expiresAt: session.expiresAt,
      });
    } catch (err) {
      if (err instanceof AvatarProviderUnavailableError) {
        res.status(503).json({ error: err.message });
        return;
      }
      req.log?.error({ err }, "avatar session start failed");
      res.status(502).json({
        error: "Couldn't start the live avatar. Please try again in a moment.",
      });
    }
  },
);

// Relay the browser's SDP answer to the provider.
router.post(
  "/avatar/sessions/:id/sdp",
  async (req: Request, res: Response): Promise<void> => {
    const s = await resolveOwnedSession(req, res);
    if (!s) return;

    const body = req.body as { answer?: { type?: string; sdp?: string } };
    const answer = body.answer;
    if (!answer || typeof answer.sdp !== "string" || typeof answer.type !== "string") {
      res.status(400).json({ error: "A valid SDP answer is required." });
      return;
    }

    const provider = getAvatarProvider(s.providerId);
    if (!provider) {
      res.status(500).json({ error: "Provider unavailable." });
      return;
    }

    try {
      await provider.submitSdpAnswer(
        { providerStreamId: s.providerStreamId, providerSessionId: s.providerSessionId },
        { type: answer.type, sdp: answer.sdp },
      );
      res.json({ ok: true });
    } catch (err) {
      req.log?.error({ err }, "avatar sdp relay failed");
      res.status(502).json({ error: "Signaling failed." });
    }
  },
);

// Relay a browser ICE candidate to the provider. Null/empty candidates (the
// end-of-gathering signal) are accepted and ignored.
router.post(
  "/avatar/sessions/:id/ice",
  async (req: Request, res: Response): Promise<void> => {
    const s = await resolveOwnedSession(req, res);
    if (!s) return;

    const body = req.body as {
      candidate?: string;
      sdpMid?: string | null;
      sdpMLineIndex?: number | null;
    };

    if (!body.candidate) {
      res.json({ ok: true });
      return;
    }

    const provider = getAvatarProvider(s.providerId);
    if (!provider) {
      res.status(500).json({ error: "Provider unavailable." });
      return;
    }

    try {
      await provider.submitIceCandidate(
        { providerStreamId: s.providerStreamId, providerSessionId: s.providerSessionId },
        {
          candidate: body.candidate,
          sdpMid: body.sdpMid ?? null,
          sdpMLineIndex: body.sdpMLineIndex ?? null,
        },
      );
      res.json({ ok: true });
    } catch (err) {
      req.log?.warn({ err }, "avatar ice relay failed");
      // ICE failures are common and non-fatal; don't surface as an error.
      res.json({ ok: true });
    }
  },
);

// Generate the figure's in-character reply (via Gemini, persona-prompted) and
// drive the avatar to speak it. Returns the reply text for the transcript.
router.post(
  "/avatar/sessions/:id/say",
  async (req: Request, res: Response): Promise<void> => {
    const s = await resolveOwnedSession(req, res);
    if (!s) return;

    const body = req.body as { text?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      res.status(400).json({ error: "A message is required." });
      return;
    }

    const provider = getAvatarProvider(s.providerId);
    if (!provider) {
      res.status(500).json({ error: "Provider unavailable." });
      return;
    }

    // Gate each spoken turn on the session subject's credit balance.
    // Each message costs AVATAR_MESSAGE_CREDITS (50) — verify that upfront.
    try {
      const state = await getCreditState(s.subjectKey, s.monthlyGrant);
      if (state.totalRemaining < AVATAR_MESSAGE_CREDITS) {
        res.status(402).json({
          error: `Each message costs ${AVATAR_MESSAGE_CREDITS} credits. Top up or upgrade your plan to keep the conversation going.`,
          outOfCredits: true,
          upgradeHref: "/pricing",
        });
        return;
      }
    } catch (err) {
      req.log?.warn({ err }, "credit pre-check failed; allowing avatar say");
    }

    const userTurn: AvatarConversationTurn = {
      role: "user",
      content: text.slice(0, MAX_USER_TEXT),
    };
    const promptMessages = [...s.history, userTurn].slice(-HISTORY_TURNS);

    // 1) Generate the persona reply. streamChat is a generator; accumulate the
    // full text server-side (the avatar speaks the whole line at once).
    let reply = "";
    let usageTokens = 0;
    try {
      for await (const chunk of streamChat(s.personaPrompt, promptMessages, {
        maxOutputTokens: REPLY_MAX_TOKENS,
      })) {
        if (chunk.text) reply += chunk.text;
        if (chunk.usage) usageTokens = chunk.usage.totalTokens;
      }
    } catch (err) {
      req.log?.error({ err }, "avatar persona reply failed");
      res.status(502).json({ error: "Couldn't think of a reply. Please try again." });
      return;
    }

    reply = reply.trim();
    if (!reply) {
      res.status(502).json({ error: "Couldn't think of a reply. Please try again." });
      return;
    }

    // 2) Drive the avatar to speak the reply. D-ID synthesizes the voice
    // server-side over the live stream using the persona's configured voice
    // (Einstein uses his cloned "elevenlabs" voice).
    try {
      await provider.speak({
        providerStreamId: s.providerStreamId,
        providerSessionId: s.providerSessionId,
        text: reply,
        voiceId: s.voiceId,
        voiceProvider: s.voiceProvider,
      });
    } catch (err) {
      if (err instanceof AvatarProviderUnavailableError) {
        res.status(503).json({ error: err.message });
        return;
      }
      req.log?.error({ err }, "avatar speak failed");
      res.status(502).json({ error: "The avatar couldn't speak right now." });
      return;
    }

    // Persist the turn only after a successful speak.
    s.history.push(userTurn, { role: "assistant", content: reply });
    if (s.history.length > HISTORY_TURNS * 2) {
      s.history = s.history.slice(-HISTORY_TURNS * 2);
    }

    // Deduct the fixed per-message cost. Fail-open.
    try {
      await consumeCredits(s.subjectKey, s.monthlyGrant, AVATAR_MESSAGE_CREDITS);
    } catch (meterErr) {
      req.log?.warn({ err: meterErr }, "credit deduction failed after avatar say");
    }

    res.json({ reply, expiresAt: s.expiresAt });
  },
);

// End a session and tear down the upstream stream.
router.delete(
  "/avatar/sessions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const s = sessions.get(id);
    if (!s) {
      // Idempotent: treat unknown/already-closed sessions as success.
      res.json({ ok: true });
      return;
    }
    await destroySession(s);
    res.json({ ok: true });
  },
);

export default router;
