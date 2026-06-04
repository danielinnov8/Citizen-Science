import { Router, type IRouter, type Request, type Response } from "express";
import { analyzeFieldNotes, streamChat } from "@workspace/integrations-gemini-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import { LABS } from "../lib/labs";

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

To recommend a module, write the token [[module:SLUG]] inline in your reply. The UI will turn it into a clickable card. Use the slug exactly as listed below.

Available modules:
${MODULES.map(m => `- ${m.slug} — ${m.name}: ${m.description}`).join("\n")}

You may also recommend a real-world laboratory or testing service when the user asks about something that requires equipment they don't have at home (DNA sequencing for humans or pets, microbiome analysis, water/soil/air testing, hormone or food-sensitivity panels, etc.). To recommend a lab, write the token [[lab:SLUG]] inline. The UI will turn it into a clickable card with the lab's website. Recommend at most 2 labs per turn, and only when the user's question genuinely calls for one — don't push labs for every message. Use the slug exactly as listed below.

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

  try {
    const stream = streamChat(SYSTEM_PROMPT, messages, {
      signal: abort.signal,
      maxOutputTokens: 1024,
    });

    for await (const content of stream) {
      if (clientGone) break;
      if (content) {
        send({ content });
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
