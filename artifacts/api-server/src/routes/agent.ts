import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
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
- 2–4 short sentences per turn unless the user asks for more depth.
- Ask at most one clarifying question per turn.
- When you are confident which module fits best, recommend it. You may recommend up to 2 modules.

To recommend a module, write the token [[module:SLUG]] inline in your reply. The UI will turn it into a clickable card. Use the slug exactly as listed below.

Available modules:
${MODULES.map(m => `- ${m.slug} — ${m.name}: ${m.description}`).join("\n")}

You may also recommend a real-world laboratory or testing service when the user asks about something that requires equipment they don't have at home (DNA sequencing, microbiome analysis, water/soil/air testing, hormone or food-sensitivity panels, etc.). To recommend a lab, write the token [[lab:SLUG]] inline. The UI will turn it into a clickable card with the lab's website. Recommend at most 2 labs per turn, and only when the user's question genuinely calls for one — don't push labs for every message. Use the slug exactly as listed below.

Available labs:
${LABS.map(l => `- ${l.slug} — ${l.name} (${l.tier}): ${l.summary}`).join("\n")}

Safety: Citizen Science is for safe, low-risk home experiments. If a request involves dangerous chemicals, biohazards, electricity, or anything risky, gently redirect to a safer version of the experiment. When recommending labs, remind the user that lab results are not medical advice.

Stay focused on science learning and experiment design. If asked something off-topic, briefly redirect.`;

router.post("/agent/chat", async (req: Request, res: Response) => {
  // Lightweight gate matching the app's client-side auth model (no real
  // backend sessions exist). The web client always sends this header after
  // sign-in. This deters casual direct API calls but is not real security.
  if (req.header("x-cs-auth") !== "1") {
    res.status(401).json({ error: "Sign in to use the science copilot." });
    return;
  }

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
    const stream = await openai.chat.completions.create(
      {
        model: "gpt-5.4",
        max_completion_tokens: 1024,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      },
      { signal: abort.signal },
    );

    for await (const chunk of stream) {
      if (clientGone) break;
      const content = chunk.choices[0]?.delta?.content;
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

export default router;
