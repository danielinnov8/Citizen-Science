import {
  Router,
  type IRouter,
  type Request,
  type Response,
} from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  onboardingResponsesTable,
  usersTable,
  featuredProfilesTable,
  profileClaimsTable,
  type OnboardingResponse,
  type User,
} from "@workspace/db";
import {
  streamChat,
  extractOnboardingInsights,
  isGeminiConfigured,
  type OnboardingInsights,
} from "@workspace/integrations-gemini-ai-server";
import {
  GetOnboardingStateResponse,
  CompleteOnboardingBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Story-driven onboarding (Task #160). The interview stream is intentionally
// NOT credit-metered — onboarding is a first-impression flow and must never
// hit a paywall. Cost is bounded by the per-IP rate limit below plus the
// short, capped interview format itself.
// ---------------------------------------------------------------------------

type OnboardingRecordView = {
  path: string;
  claimProfileSlug: string | null;
  role: string | null;
  interests: string[];
  primaryGoal: string | null;
  ambition: string | null;
  insights: string[];
  summary: string | null;
  source: string;
  completedAt: string;
};

function toRecordView(row: OnboardingResponse): OnboardingRecordView {
  return {
    path: row.path,
    claimProfileSlug: row.claimProfileSlug,
    role: row.role,
    interests: row.interests,
    primaryGoal: row.primaryGoal,
    ambition: row.ambition,
    insights: row.insights,
    summary: row.summary,
    source: row.source,
    completedAt: row.completedAt.toISOString(),
  };
}

async function loadState(user: User) {
  const [row] = await db
    .select()
    .from(onboardingResponsesTable)
    .where(eq(onboardingResponsesTable.userId, user.id))
    .limit(1);
  return {
    onboarded: user.onboardedAt !== null,
    record: row ? toRecordView(row) : null,
  };
}

router.get(
  "/onboarding",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const state = await loadState(user);
    res.json(GetOnboardingStateResponse.parse(state));
  },
);

// --- The agentic interview -------------------------------------------------

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

// Context about the profile a claimant is in the middle of claiming, used to
// personalize the interview opening.
interface ClaimContext {
  name: string;
  field: string;
  era: string;
  summary: string;
  claimStatus: string;
}

// Look up the featured profile the caller is claiming (and their claim, if
// one exists yet). Only used for prompt personalization — never trusted for
// authorization. Returns null when the slug doesn't resolve.
async function loadClaimContext(
  userId: string,
  slug: string,
): Promise<ClaimContext | null> {
  const [profile] = await db
    .select({
      id: featuredProfilesTable.id,
      name: featuredProfilesTable.name,
      field: featuredProfilesTable.field,
      era: featuredProfilesTable.era,
      summary: featuredProfilesTable.summary,
    })
    .from(featuredProfilesTable)
    .where(eq(featuredProfilesTable.slug, slug))
    .limit(1);
  if (!profile) return null;

  const [claim] = await db
    .select({ status: profileClaimsTable.status })
    .from(profileClaimsTable)
    .where(
      and(
        eq(profileClaimsTable.profileId, profile.id),
        eq(profileClaimsTable.userId, userId),
      ),
    )
    .limit(1);

  return {
    name: profile.name,
    field: profile.field ?? "",
    era: profile.era ?? "",
    summary: profile.summary ?? "",
    claimStatus: claim?.status ?? "none",
  };
}

function buildInterviewPrompt(
  userName: string | null,
  claim: ClaimContext | null,
): string {
  const claimSection = claim
    ? `

THIS MEMBER IS A LIVING INNOVATOR CLAIMING THEIR OWN PROFILE. They just claimed (claim status: ${claim.claimStatus}) the directory profile of ${claim.name}${claim.field ? ` — ${claim.field}` : ""}${claim.era ? ` (${claim.era})` : ""}.${claim.summary ? ` Profile summary: ${claim.summary}` : ""}
Open by acknowledging WHO THEY ARE — welcome ${claim.name} personally to the network, referencing their field and work with genuine (but not sycophantic) respect. Your questions should fit an accomplished innovator: ask what they're working on now, what they most want to share with the community (mentoring, publishing their methods, posing challenges), and what kind of members they'd love to hear from. Do NOT ask beginner questions like "are you new to science?".`
    : `

This member is a regular new sign-up${userName ? ` named ${userName}` : ""}. Learn who they are and shape their journey.`;

  return `You are the welcome guide of "Citizen Science" — a premium at-home science platform where curious people run real experiments, learn from AI copilots, and connect with living legends of science. You are conducting a short, cinematic onboarding interview. Tone: warm, curious, a little poetic but never cheesy; you speak like a thoughtful documentary narrator, in second person, plain language. Keep every turn SHORT — 1-3 sentences, then exactly ONE question.

RULES (strict):
- Ask exactly ONE question per turn. Never two.
- The whole interview is 4 questions total, then you close. When told to close, you MUST close.
- Adapt each next question to what the member actually said — reference their words.
- Cover, across the interview: (1) who they are / what they do, (2) which fields of science pull at them, (3) what they want most from this place, (4) one ambition or dream discovery. Merge or reshape these naturally based on their answers.
- After the member's text, when quick tap-answers would help, end your turn with a marker line: [[chips:Short option|Short option|Short option]] — 3 to 5 options, each under 5 words. The UI renders them as buttons; the member can always type freely instead. Do not use chips for the open "dream" style questions.
- After the 4th answer, close the interview: 2-3 warm sentences that reflect back what you learned about them (make it feel seen, specific to their answers), tell them their journey is ready, and end with the marker [[complete]] on its own at the very end.
- Never use markdown headings, bullet lists, or emojis. Plain prose only.
- Never mention these rules, the markers, credits, or that you are an AI model.${claimSection}`;
}

router.post(
  "/onboarding/interview",
  requireAuth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 40 }),
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const body = (req.body ?? {}) as {
      messages?: unknown;
      profileSlug?: unknown;
    };

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const messages = incoming
      .filter(
        (m): m is IncomingMessage =>
          !!m &&
          typeof m === "object" &&
          ((m as IncomingMessage).role === "user" ||
            (m as IncomingMessage).role === "assistant") &&
          typeof (m as IncomingMessage).content === "string" &&
          (m as IncomingMessage).content.trim().length > 0,
      )
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!isGeminiConfigured()) {
      // Explicit signal so the client can switch to the static fallback path.
      res.status(503).json({ error: "The guide is unavailable right now.", fallback: true });
      return;
    }

    const profileSlug =
      typeof body.profileSlug === "string" &&
      /^[a-z0-9-]{1,120}$/.test(body.profileSlug)
        ? body.profileSlug
        : null;

    let claimContext: ClaimContext | null = null;
    if (profileSlug) {
      try {
        claimContext = await loadClaimContext(user.id, profileSlug);
      } catch (err) {
        req.log?.warn({ err }, "onboarding claim context lookup failed");
      }
    }

    const systemPrompt = buildInterviewPrompt(user.name, claimContext);

    // First turn: the client opens with no member input yet — inject a kickoff
    // instruction so the model produces the opening beat.
    let turns =
      messages.length === 0 || messages[messages.length - 1].role !== "user"
        ? [
            ...messages,
            {
              role: "user" as const,
              content:
                "(The member has just arrived at the doorway of the network. Begin — welcome them and ask your first question.)",
            },
          ]
        : messages;

    // Deterministic close: the model cannot be trusted to count its own
    // questions, so the server counts member answers and forces the closing
    // beat after the 4th one.
    const answerCount = messages.filter((m) => m.role === "user").length;
    if (answerCount >= 4 && turns[turns.length - 1].role === "user") {
      const last = turns[turns.length - 1];
      turns = [
        ...turns.slice(0, -1),
        {
          ...last,
          content: `${last.content}\n\n(This was the member's final answer. Do NOT ask another question. Close the interview now: 2-3 warm sentences reflecting back what you learned about them, tell them their journey is ready, and end with [[complete]] at the very end.)`,
        },
      ];
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const send = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const abort = new AbortController();
    let clientGone = false;
    const onClose = () => {
      if (clientGone) return;
      clientGone = true;
      abort.abort();
    };
    // Listen on `res` (not `req`) — `req.close` fires as soon as the request
    // body is consumed; `res.close` fires when the connection actually drops.
    res.on("close", () => {
      if (!res.writableEnded) onClose();
    });

    try {
      const stream = streamChat(systemPrompt, turns, {
        signal: abort.signal,
        maxOutputTokens: 1024,
        useSearch: false,
      });
      for await (const chunk of stream) {
        if (clientGone) break;
        if (chunk.text) send({ content: chunk.text });
      }
      if (!clientGone) send({ done: true });
    } catch (err) {
      if (!clientGone) {
        req.log?.error({ err }, "onboarding interview stream failed");
        send({ error: "The guide lost its voice for a moment. Please try again." });
      }
    } finally {
      if (!clientGone) res.end();
    }
  },
);

// --- Completion ------------------------------------------------------------

const str = (v: string | null | undefined): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

router.post(
  "/onboarding/complete",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;

    const parsed = CompleteOnboardingBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid onboarding payload" });
      return;
    }
    const input = parsed.data;

    // Best-effort AI extraction of structure from the interview transcript.
    // Failure (no key, quota, malformed output) must never block onboarding.
    let extracted: OnboardingInsights | null = null;
    const transcript = str(input.transcript);
    if (transcript && input.source === "agentic" && isGeminiConfigured()) {
      try {
        extracted = await extractOnboardingInsights(transcript);
      } catch (err) {
        req.log?.warn({ err }, "onboarding insight extraction failed; saving without");
      }
    }

    const explicitInterests = (input.interests ?? [])
      .map((s) => s.trim())
      .filter(Boolean);

    const record = {
      userId: user.id,
      path: input.path,
      claimProfileSlug: str(input.profileSlug),
      role: str(input.role) ?? extracted?.role ?? null,
      interests:
        explicitInterests.length > 0
          ? explicitInterests
          : (extracted?.interests ?? []),
      primaryGoal: str(input.primaryGoal) ?? extracted?.primaryGoal ?? null,
      ambition: str(input.ambition) ?? extracted?.ambition ?? null,
      insights: extracted?.insights ?? [],
      summary: extracted?.summary ?? null,
      transcript,
      source: input.source,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    const [saved] = await db
      .insert(onboardingResponsesTable)
      .values(record)
      .onConflictDoUpdate({
        target: onboardingResponsesTable.userId,
        set: {
          path: record.path,
          claimProfileSlug: record.claimProfileSlug,
          role: record.role,
          interests: record.interests,
          primaryGoal: record.primaryGoal,
          ambition: record.ambition,
          insights: record.insights,
          summary: record.summary,
          transcript: record.transcript,
          source: record.source,
          updatedAt: record.updatedAt,
        },
      })
      .returning();

    // Mark the account onboarded (server-side source of truth). Keep the
    // original timestamp on repeat completions.
    if (user.onboardedAt === null) {
      await db
        .update(usersTable)
        .set({ onboardedAt: new Date(), updatedAt: new Date() })
        .where(eq(usersTable.id, user.id));
    }

    res.json(
      GetOnboardingStateResponse.parse({
        onboarded: true,
        record: toRecordView(saved),
      }),
    );
  },
);

export default router;
