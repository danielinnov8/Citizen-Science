import {
  Router,
  type IRouter,
  type Request,
  type Response,
} from "express";
import { eq } from "drizzle-orm";
import { db, featuredProfilesTable } from "@workspace/db";
import {
  streamChat,
  scoreVideoRelevance,
  isGeminiConfigured,
} from "@workspace/integrations-gemini-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { resolveBillingSubject } from "../lib/credits/subject";
import { consumeCredits, hasCreditsAvailable } from "../lib/credits/credits";
import { creditsForUsage } from "../lib/credits/plans";
import { isLivingEra } from "../lib/profiles/living";
import {
  searchFigureInterviews,
  isYouTubeConfigured,
} from "../lib/youtube/search";
import { VideoMarkerStripper } from "../lib/youtube/marker";

// A surfaced video must clear this strict relevance bar (0-100). The figure
// interview search is NOT allowlist-restricted, so the bar is held no lower
// than the science copilot's trusted-channel path.
const VIDEO_RELEVANCE_THRESHOLD = 90;

interface VerifiedVideo {
  id: string;
  title: string;
  channel: string;
}

// Resolve a request for a verified video featuring the figure: search YouTube
// for a genuine interview/talk, then run the strict Gemini relevance gate with
// an instruction that the clip must FEATURE the named figure (not be commentary
// about them). Returns one verified video or null. Never throws.
async function resolveFigureInterview(
  figureName: string,
  field: string,
  topic: string,
  signal: AbortSignal,
): Promise<VerifiedVideo | null> {
  if (!isYouTubeConfigured() || !isGeminiConfigured()) {
    return null;
  }

  const candidates = await searchFigureInterviews(figureName, topic, {
    signal,
    maxResults: 25,
  });
  if (candidates.length === 0) {
    return null;
  }

  const top = candidates.slice(0, 10);
  const gateTopic = `A genuine, real on-camera interview, talk, lecture, panel, or Q&A that prominently FEATURES ${figureName}${
    field ? ` (the ${field})` : ""
  } speaking in their own words.${
    topic ? ` It should relate to: ${topic}.` : ""
  } REJECT anything that is a documentary, biography, news segment, reenactment, impression, AI/synthetic recreation, tribute, or third-party commentary ABOUT ${figureName} rather than ${figureName} actually speaking.`;

  const result = await scoreVideoRelevance(
    gateTopic,
    top.map((c) => ({
      title: c.title,
      channelTitle: c.channelTitle,
      description: c.description,
    })),
    { signal },
  );

  if (result.bestIndex < 0 || result.score < VIDEO_RELEVANCE_THRESHOLD) {
    return null;
  }

  const v = top[result.bestIndex];
  return { id: v.id, title: v.title, channel: v.channelTitle };
}

const router: IRouter = Router();

type ChatRole = "user" | "assistant";

interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface ChatBody {
  messages?: IncomingMessage[];
  // Optional figure descriptor — used ONLY as a fallback when the slug has no
  // `featured_profiles` row yet (living-legend pages render from static
  // frontend data and may not be seeded in the DB). The DB row always wins.
  figureName?: string;
  field?: string;
  era?: string;
  bio?: string;
}

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

function capped(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

interface Figure {
  name: string;
  field: string;
  era: string;
  summary: string;
}

// Build the digital-mentor system prompt: a knowledgeable guide who helps the
// learner grow by drawing on the figure's life and work, speaking ABOUT the
// figure in the THIRD person (never impersonating them).
function buildSystemPrompt(figure: Figure): string {
  const { name, field, era, summary } = figure;
  const backgroundBlock = summary
    ? `\nBackground on ${name} (for your reference — weave it in naturally, do not recite it):\n${summary}\n`
    : "";
  return `You are a "Digital Mentor" inside the "Citizen Science" learning app — a knowledgeable, encouraging guide who helps a learner grow by drawing on the life, work, methods, and philosophy of ${name}, a ${field} (${era}).

PERSPECTIVE — THIS IS CRITICAL:
- You speak ABOUT ${name} in the THIRD person. You are a guide who deeply understands their work — you are NOT ${name}.
- Never impersonate ${name}, never write in their first-person voice, never invent quotes, and never claim to be them.
- Refer to them by name or as "they"/"them".
- If the user talks to you as if you were ${name}, gently clarify that you're a guide who can help them learn from ${name}'s approach, then continue helping.

YOUR JOB:
Help the learner understand how ${name} thought and worked — the questions they pursued, the methods and mindset they used, how they overcame obstacles — and how the learner can apply those lessons to their own curiosity, projects, and experiments. Be specific to ${name}'s real contributions and field; avoid generic life-coaching.
${backgroundBlock}
STYLE:
- Warm, concrete, motivating. No fluff, no emojis.
- Plain text only. No markdown headings, no bold, no code fences.
- Default to 3–6 short sentences. Ask at most one focused question per turn.

You can search the live web for current, accurate facts about ${name} and their field. Weave facts in naturally — the UI shows the source links automatically, so never paste raw URLs.

VERIFIED VIDEO (optional):
When — and only when — a real recorded interview, talk, or lecture featuring ${name} would genuinely help the learner, you may request one by writing a hidden marker of the form [[video?:SEARCH TERMS]] on its own line at the very END of your reply.
- Put ONLY the topic or theme in SEARCH TERMS (e.g. [[video?:curiosity and lifelong learning]] or [[video?:their key breakthrough]]). Do NOT put ${name}'s name in the marker — the system adds it automatically and searches for a genuine clip of ${name} speaking.
- This marker is a PRIVATE request to the system and is never shown to the user. The system runs its own strict check; if nothing clears the bar, no video appears and your reply is unaffected — so never promise, name, or describe a specific video, and never write a YouTube link, ID, thumbnail, or title yourself.
- Use at MOST ONE marker per reply, and only when a clip would clearly help. Most replies should have none.

Stay focused on helping the learner grow through ${name}'s example and on science learning. If asked something off-topic, briefly redirect.`;
}

// POST /mentorship/legends/:slug/chat — SSE. A figure-scoped digital-mentor
// chat. Auth-only (the /mentor/:slug page is gated and the funnel sends guests
// to /login). Mirrors the science copilot's streaming + credit-metering shape.
router.post(
  "/mentorship/legends/:slug/chat",
  rateLimit({ windowMs: 10 * 60 * 1000, max: 40 }),
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    if (!SLUG_RE.test(slug)) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    const body = req.body as ChatBody;

    // Resolve the figure. The DB row (when present) always wins — it's the
    // trusted persona source. Living-legend pages, however, render from static
    // frontend data and may have no `featured_profiles` row yet, so we accept a
    // capped descriptor from the body as a fallback. Either way the figure must
    // read as LIVING (this feature is scoped to living legends).
    const [row] = await db
      .select({
        name: featuredProfilesTable.name,
        field: featuredProfilesTable.field,
        era: featuredProfilesTable.era,
        summary: featuredProfilesTable.summary,
      })
      .from(featuredProfilesTable)
      .where(eq(featuredProfilesTable.slug, slug));

    let figure: Figure | null = null;
    if (row && isLivingEra(row.era)) {
      figure = {
        name: row.name,
        field: row.field,
        era: row.era,
        summary: row.summary,
      };
    } else if (!row) {
      const name = capped(body?.figureName, 120);
      const era = capped(body?.era, 120);
      if (name && isLivingEra(era)) {
        figure = {
          name,
          field: capped(body?.field, 120) || "scientist",
          era,
          summary: capped(body?.bio, 1200),
        };
      }
    }

    if (!figure) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    const messages = incoming
      .filter(
        (m): m is IncomingMessage =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Gate on credits before SSE headers are flushed (auth-only, so the subject
    // is always a real user). Actual token usage is deducted after the stream.
    const subject = await resolveBillingSubject(req, res);
    try {
      const ok = await hasCreditsAvailable(
        subject.subjectKey,
        subject.monthlyGrant,
      );
      if (!ok) {
        res.status(402).json({
          error:
            "You're out of credits. Top up your credits or upgrade your plan to keep going.",
          outOfCredits: true,
          isGuest: false,
          upgradeHref: "/pricing",
        });
        return;
      }
    } catch (err) {
      req.log?.warn(
        { err },
        "credit pre-check failed; allowing digital-mentor request",
      );
    }

    const systemPrompt = buildSystemPrompt(figure);

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
    let sentAny = false;
    const onClose = () => {
      if (clientGone) return;
      clientGone = true;
      abort.abort();
    };
    res.on("close", () => {
      if (!res.writableEnded) onClose();
    });

    let videoTopic: string | null = null;
    let usageTokens = 0;

    const runStream = async (useSearch: boolean) => {
      const stripper = new VideoMarkerStripper();
      const stream = streamChat(systemPrompt, messages, {
        signal: abort.signal,
        maxOutputTokens: useSearch ? 4096 : 1024,
        useSearch,
      });

      for await (const chunk of stream) {
        if (clientGone) break;
        if (chunk.text) {
          const safe = stripper.push(chunk.text);
          if (safe) {
            sentAny = true;
            send({ content: safe });
          }
        }
        if (chunk.sources && chunk.sources.length > 0) {
          send({ sources: chunk.sources });
        }
        if (chunk.usage) {
          usageTokens = chunk.usage.totalTokens;
        }
      }

      const tail = stripper.flush();
      if (tail && !clientGone) {
        sentAny = true;
        send({ content: tail });
      }
      if (stripper.terms.length > 0) {
        videoTopic = stripper.terms[stripper.terms.length - 1];
      }
    };

    const grounded = isGeminiConfigured();

    try {
      if (grounded) {
        try {
          await runStream(true);
        } catch (err) {
          if (clientGone || abort.signal.aborted || sentAny) {
            throw err;
          }
          req.log?.warn(
            { err },
            "grounded digital-mentor chat failed, falling back to ungrounded",
          );
          await runStream(false);
        }
      } else {
        req.log?.warn(
          "GEMINI_API_KEY not set; serving ungrounded digital-mentor chat",
        );
        await runStream(false);
      }

      // After the text reply, resolve the (optional) figure-interview video.
      // The marker carries only a topic; the figure name/field come from the DB.
      if (!clientGone && videoTopic !== null) {
        try {
          const video = await resolveFigureInterview(
            figure.name,
            figure.field,
            videoTopic,
            abort.signal,
          );
          if (video && !clientGone) {
            send({ video });
          }
        } catch (err) {
          req.log?.warn({ err }, "figure interview resolution failed");
        }
      }

      if (!clientGone) send({ done: true });
    } catch (err) {
      if (!clientGone) {
        req.log?.error({ err }, "digital-mentor chat stream failed");
        send({
          error:
            "The digital mentor is unavailable right now. Please try again.",
        });
      }
    } finally {
      if (sentAny) {
        const cost = creditsForUsage("chat", usageTokens);
        try {
          await consumeCredits(
            subject.subjectKey,
            subject.monthlyGrant,
            cost,
          );
        } catch (meterErr) {
          req.log?.warn(
            { err: meterErr },
            "credit deduction failed after digital-mentor chat",
          );
        }
      }
      if (!clientGone) res.end();
    }
  },
);

export default router;
