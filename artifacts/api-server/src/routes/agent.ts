import { Router, type IRouter, type Request, type Response } from "express";
import {
  analyzeFieldNotes,
  streamChat,
  scoreVideoRelevance,
  isGeminiConfigured,
} from "@workspace/integrations-gemini-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import { LABS } from "../lib/labs";
import { searchTrustedVideos, isYouTubeConfigured } from "../lib/youtube/search";
import { VideoMarkerStripper } from "../lib/youtube/marker";

// A video must clear this strict relevance bar (0-100) before it is shown.
const VIDEO_RELEVANCE_THRESHOLD = 90;

interface VerifiedVideo {
  id: string;
  title: string;
  channel: string;
}

// Resolve a copilot video request: search YouTube (allowlist-filtered), then
// run the strict Gemini relevance gate. Returns a single verified video or
// null. Never throws — video lookup must never break the chat reply.
async function resolveVerifiedVideo(
  topic: string,
  signal: AbortSignal,
): Promise<VerifiedVideo | null> {
  if (!isYouTubeConfigured() || !isGeminiConfigured()) {
    return null;
  }

  const candidates = await searchTrustedVideos(topic, { signal, maxResults: 25 });
  if (candidates.length === 0) {
    return null;
  }

  const top = candidates.slice(0, 10);
  const result = await scoreVideoRelevance(
    topic,
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
}

const MODULES: { slug: string; name: string; description: string }[] = [
  { slug: "biology", name: "Biology", description: "Cells, organisms, life processes." },
  { slug: "plant-science", name: "Plant Science", description: "Photosynthesis, growth, soil and light effects." },
  { slug: "environmental-science", name: "Environmental Science", description: "Habitat surveys, biodiversity, pollution." },
  { slug: "water-quality", name: "Water Quality", description: "pH, turbidity, dissolved oxygen, samples." },
  { slug: "chemistry", name: "Chemistry", description: "Acids, bases, reactions, household chemistry." },
  { slug: "physics", name: "Physics", description: "Motion, force, energy, simple mechanics." },
  { slug: "human-health", name: "Human Health", description: "Sleep, heart rate, wellness tracking." },
  { slug: "microbiology", name: "Microbiology", description: "Yeast, bacteria, fermentation cultures." },
  { slug: "food-science", name: "Food Science", description: "Fermentation, baking chemistry, sourdough." },
  { slug: "agriculture", name: "Agriculture", description: "Soil, NPK, crop tracking." },
  { slug: "neuroscience", name: "Neuroscience", description: "Reaction time, attention, cognitive tests." },
  { slug: "climate-science", name: "Climate Science", description: "Temperature, humidity, weather logging." },
  { slug: "astronomy", name: "Astronomy", description: "Sky observation, moon phases, light pollution." },
  { slug: "materials-science", name: "Materials Science", description: "Stress, strain, material properties." },
];

const SYSTEM_PROMPT = `You are the science copilot inside the "Citizen Science" learning app — an at-home science platform that helps curious people run real experiments with tutorials, interactive simulators, and a personal notebook.

Your job: have a short, focused conversation with the user about their question or experiment idea, and help them choose the right learning module to start in.

Style:
- Friendly, concise, encouraging. No fluff, no emojis.
- Use plain text only. No markdown headings, no bold, no code fences.
- Default to 2–4 short sentences. When you recommend a lab, expand to 5–8 sentences so you can briefly walk through how the process works and what it typically costs.
- Ask at most one clarifying question per turn.
- When you are confident which module fits best, recommend it. You may recommend up to 2 modules.

To recommend a module, write the token [[module:SLUG]] inline in your reply. The UI will turn it into a clickable card.

Available modules:
${MODULES.map(m => `- ${m.slug} — ${m.name}: ${m.description}`).join("\n")}

You may also recommend a real-world laboratory or testing service when the user asks about something that requires equipment they don't have at home (DNA sequencing for humans or pets, microbiome analysis, water/soil/air testing, hormone or food-sensitivity panels, etc.). To recommend a lab, write the token [[lab:SLUG]] inline. The UI will turn it into a clickable card with the lab's website. Recommend at most 2 labs per turn, and only when the user's question genuinely calls for one — don't push labs for every message.

TOKEN RULES (follow these EXACTLY — the UI only renders a card when a token matches them; any token that breaks them is shown to the user as ugly raw text like "[[biology]]"):
- A token MUST have the form [[module:SLUG]] or [[lab:SLUG]]. The "module:" or "lab:" prefix is REQUIRED. Never write [[SLUG]] without a prefix.
- SLUG must be copied EXACTLY, character-for-character, from the "Available modules" or "Available labs" lists below. Slugs are always lowercase with hyphens and contain only letters, digits, and hyphens.
- Module slugs may only be used with the module: prefix; lab slugs may only be used with the lab: prefix.
- NEVER invent, guess, abbreviate, or shorten a slug. If a service or topic is not in the lists, do NOT wrap it in brackets — just name it in plain prose.
- The Cost benchmarks section below is reference text, NOT a source of slugs. Brand names that appear only there (e.g. "Nebula", "Dante") are not valid slugs. Only use a lab if it has its own entry in the "Available labs" list (Nebula → use the slug nebula-genomics; Dante → use the slug dante-labs).

When you recommend a lab, ALWAYS pair it with:
1. A short walkthrough of how the process actually works in 3–5 steps (e.g. "order a kit, collect a saliva or cheek-swab sample, mail it back in the prepaid envelope, wait 4–8 weeks, then explore your raw data online").
2. An approximate cost range in USD using a realistic ballpark (e.g. "around $99–$199 for breed-only kits, $200–$300 for kits that include health screening"). Be honest that prices change and shipping/processing fees may apply.

Cost benchmarks you can rely on (always present these as approximate, not guaranteed):
- 23andMe / AncestryDNA: ~$99 ancestry-only, ~$199 ancestry + health.
- Whole genome sequencing (Nebula, Dante): ~$300 for 30x coverage, $1,000+ for premium tiers.
- Embark / Wisdom Panel dog DNA: ~$99 for breed-only, ~$159–$229 for breed + health.
- Basepaws cat DNA: ~$99–$159.
- Viome gut microbiome: ~$199–$299.
- Thorne gut health: ~$199.
- Everlywell at-home panels: ~$49–$199 depending on the test.
- Mosaic Diagnostics organic acids panel: ~$300–$400 (often through a practitioner).
- Tap Score water tests: ~$100–$650 depending on the panel; Essential test ~$150.
- IDEXX water testing: variable, usually $30–$80 per microbial panel via a partner lab.
- Soil Savvy: ~$30 per kit.
- Ward Laboratories soil tests: ~$15–$50 per sample.
- University Cooperative Extension: typically $10–$30 per soil test.
- PurpleAir sensor: ~$229–$299 for the device.

Available labs:
${LABS.map(l => `- ${l.slug} — ${l.name} (${l.tier}): ${l.summary}`).join("\n")}

You can search the live web when a question needs current facts, recent research, real products, or details you are unsure about. When you draw on web results, weave the facts naturally into your reply — the UI shows the underlying source links automatically, so do not paste raw URLs.

VIDEO SUGGESTIONS (separate from the token rules above):
When — and only when — a short video would genuinely deepen the user's understanding of a specific concept they're exploring, you may request one by writing a hidden marker of the form [[video?:SEARCH TERMS]] on its own line at the very end of your reply. Replace SEARCH TERMS with a concise topic phrase to search for (e.g. [[video?:how mRNA vaccines work]] or [[video?:photosynthesis explained]]).
- This marker is a PRIVATE request to the system and is never shown to the user. The system independently searches a fixed allowlist of trusted science channels (NASA, Veritasium, Kurzgesagt, SciShow, Khan Academy, MIT, etc.) and runs its own strict relevance check. If nothing clears the bar, no video appears and your reply is unaffected — so never promise, name, or describe a specific video.
- NEVER write a YouTube link, video ID, thumbnail, or channel/video name yourself. The hidden marker is the ONLY way a video can reach the user.
- Use at MOST ONE marker per reply, and only for clearly video-worthy science concepts. Most replies should have none. Do not add a marker for greetings, simple clarifications, lab/cost questions, or off-topic messages.

Safety: Citizen Science is for safe, low-risk home experiments. If a request involves dangerous chemicals, biohazards, electricity, or anything risky, gently redirect to a safer version of the experiment. When recommending labs, remind the user that lab results are not medical advice.

Stay focused on science learning and experiment design. If asked something off-topic, briefly redirect.`;

router.post("/agent/chat", requireAuth, async (req: Request, res: Response) => {
  const body = req.body as ChatBody;
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
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
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
  let sentAny = false;
  const onClose = () => {
    if (clientGone) return;
    clientGone = true;
    abort.abort();
  };
  // Listen on `res` (not `req`) — in Node 16+, `req.close` fires when the
  // body stream is fully consumed, which happens immediately after body
  // parsing. `res.close` fires only when the underlying connection drops.
  res.on("close", () => {
    if (!res.writableEnded) onClose();
  });

  // The latest video search topic requested by the model via the hidden
  // [[video?:...]] marker. Resolved (search + verify) after the text stream.
  let videoTopic: string | null = null;

  // Run one streaming pass. `useSearch` enables Google Search grounding so
  // replies can cite live web sources; sources arrive as a trailing chunk.
  const runStream = async (useSearch: boolean) => {
    // Strip the hidden video marker from the user-visible text. A fresh
    // stripper per pass so a grounded->ungrounded fallback starts clean.
    const stripper = new VideoMarkerStripper();
    const stream = streamChat(SYSTEM_PROMPT, messages, {
      signal: abort.signal,
      // Grounded replies need a larger budget because thinking tokens (which
      // must stay enabled for search) count against maxOutputTokens.
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
    }

    const tail = stripper.flush();
    if (tail && !clientGone) {
      sentAny = true;
      send({ content: tail });
    }
    // Use the last requested topic (the marker is meant to be at the end).
    if (stripper.terms.length > 0) {
      videoTopic = stripper.terms[stripper.terms.length - 1];
    }
  };

  // Grounding needs a Gemini key. If none is configured, skip the grounded
  // pass entirely (it would only waste a doomed request) and run the plain
  // chat — which surfaces the existing "set GEMINI_API_KEY" error gracefully
  // instead of crashing. With a key, try grounded first and fall back to
  // ungrounded only on a grounding/tool-specific failure.
  const grounded = isGeminiConfigured();

  try {
    if (grounded) {
      try {
        await runStream(true);
      } catch (err) {
        // Don't retry if the client disconnected or we already streamed text.
        if (clientGone || abort.signal.aborted || sentAny) {
          throw err;
        }
        // Grounding gracefully degrades: a search-specific failure falls back
        // to the plain ungrounded chat so the user still gets a reply.
        req.log?.warn({ err }, "grounded agent chat failed, falling back to ungrounded");
        await runStream(false);
      }
    } else {
      req.log?.warn("GEMINI_API_KEY not set; serving ungrounded agent chat");
      await runStream(false);
    }

    // After the text reply is complete, resolve the (optional) video request.
    // This is best-effort: any failure or empty result leaves the reply intact
    // and simply shows no video card.
    if (!clientGone && videoTopic) {
      try {
        const video = await resolveVerifiedVideo(videoTopic, abort.signal);
        if (video && !clientGone) {
          send({ video });
        }
      } catch (err) {
        req.log?.warn({ err }, "verified video resolution failed");
      }
    }

    if (!clientGone) send({ done: true });
  } catch (err) {
    if (!clientGone) {
      req.log?.error({ err }, "agent chat stream failed");
      send({ error: "The science copilot is unavailable right now. Please try again." });
    }
  } finally {
    if (!clientGone) res.end();
  }
});

router.post("/agent/process-observation", requireAuth, async (req: Request, res: Response) => {
  const rawText =
    typeof (req.body as { rawText?: unknown })?.rawText === "string"
      ? (req.body as { rawText: string }).rawText
      : "";

  if (!rawText.trim()) {
    res.status(400).json({ error: "rawText is required" });
    return;
  }

  try {
    const data = await analyzeFieldNotes(rawText);
    res.json({ success: true, data });
  } catch (err) {
    req.log?.error({ err }, "field note analysis failed");
    res.status(500).json({ error: "Failed to analyze field notes." });
  }
});

export default router;
