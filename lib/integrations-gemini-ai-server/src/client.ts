import { GoogleGenAI, Type, type GenerateContentResponse } from "@google/genai";

let client: GoogleGenAI | null = null;

// Lazily construct the Gemini client on first use rather than at import time,
// so the server boots even when GEMINI_API_KEY is absent — only the field-note
// route fails, not the whole process. Callers should handle the thrown error.
function getGenAI(): GoogleGenAI {
  if (client) {
    return client;
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY must be set. Add it in the Secrets tab to enable field-note analysis.",
    );
  }

  client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

// Whether a Gemini API key is configured. Lets callers decide how to degrade
// (e.g. skip grounding, surface a clear message) before triggering a throw
// from getGenAI(). Does not validate the key, only its presence.
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Token usage reported by Gemini for a single call, surfaced so callers can
// meter consumption (e.g. convert tokens to billing credits). `totalTokens`
// includes prompt + response + thinking + tool tokens when available.
export interface UsageInfo {
  totalTokens: number;
  promptTokens: number;
  candidatesTokens: number;
}

// Normalize the SDK's usageMetadata into a flat UsageInfo, or null when the
// response didn't report any usage (callers then apply a fixed fallback cost).
function toUsageInfo(
  meta:
    | {
        totalTokenCount?: number;
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      }
    | undefined,
): UsageInfo | null {
  if (!meta) return null;
  const totalTokens = meta.totalTokenCount ?? 0;
  if (totalTokens <= 0) return null;
  return {
    totalTokens,
    promptTokens: meta.promptTokenCount ?? 0,
    candidatesTokens: meta.candidatesTokenCount ?? 0,
  };
}

export interface Measurement {
  name: string;
  value: string;
  unit: string | null;
}

export interface FieldNoteAnalysis {
  summary: string;
  category: string;
  species: string | null;
  location: string | null;
  observedAt: string | null;
  measurements: Measurement[];
  observations: string[];
  tags: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    category: { type: Type.STRING },
    species: { type: Type.STRING, nullable: true },
    location: { type: Type.STRING, nullable: true },
    observedAt: { type: Type.STRING, nullable: true },
    measurements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING, nullable: true },
        },
        required: ["name", "value"],
      },
    },
    observations: { type: Type.ARRAY, items: { type: Type.STRING } },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "category", "observations", "tags"],
};

const SYSTEM_INSTRUCTION = `You convert a citizen scientist's raw, free-form field notes into one structured observation record.

Rules:
- summary: one concise plain-text sentence describing what was observed.
- category: the single best-fit science area as a lowercase slug (e.g. biology, plant-science, environmental-science, water-quality, chemistry, physics, human-health, microbiology, food-science, agriculture, neuroscience, climate-science, astronomy, materials-science).
- species: the organism observed, or null if none.
- location: where the observation took place, or null if not stated.
- observedAt: the date/time of the observation as written by the user, or null if not stated. Do not invent a date.
- measurements: any quantitative readings the user recorded (name, value, and unit when given). Empty array if none.
- observations: short bullet-style factual notes extracted from the text.
- tags: a few short lowercase keywords.

Only use information present in the notes. Never fabricate values. Respond with JSON only.`;

export interface AnalyzeFieldNotesOptions {
  // Invoked with the call's token usage when Gemini reports it, so the caller
  // can meter consumption. Never called when usage is unavailable.
  onUsage?: (usage: UsageInfo) => void;
}

export async function analyzeFieldNotes(
  rawText: string,
  options: AnalyzeFieldNotesOptions = {},
): Promise<FieldNoteAnalysis> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("rawText must not be empty");
  }

  const response = await getGenAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: trimmed.slice(0, 8000),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 8192,
    },
  });

  const usage = toUsageInfo(response.usageMetadata);
  if (usage) options.onUsage?.(usage);

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text) as FieldNoteAnalysis;
}

export interface MentoringCourseDraft {
  title: string;
  description: string;
  outcomes: string[];
}

const COURSE_DRAFT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "description", "outcomes"],
};

const COURSE_DRAFT_INSTRUCTION = `You help a mentor on the "Citizen Science" learning platform draft a single mentoring course from a short brief about who they are and what they want to teach.

Produce:
- title: a concise, compelling course title (max ~70 characters). No quotes, no emojis.
- description: 2-4 plain-text sentences describing what the course covers, who it is for, and what a mentee will get from working with this mentor. Encouraging and specific, no fluff, no markdown.
- outcomes: 3-6 short, concrete learning outcomes, each a single phrase starting with a verb (e.g. "Design a controlled home experiment"). No numbering, no trailing punctuation needed.

Stay grounded in the mentor's brief — do not invent credentials or claims not implied by it. Respond with JSON only.`;

export interface DraftMentoringCourseOptions {
  // Invoked with the call's token usage when Gemini reports it, so the caller
  // can meter consumption. Never called when usage is unavailable.
  onUsage?: (usage: UsageInfo) => void;
}

// Draft a mentoring course (title, description, learning outcomes) from a
// free-form mentor brief. Structured JSON output; uses the user's own
// GEMINI_API_KEY so it works on Cloud Run too. Callers gate on
// isGeminiConfigured() to degrade gracefully when no key is set.
export async function draftMentoringCourse(
  brief: string,
  options: DraftMentoringCourseOptions = {},
): Promise<MentoringCourseDraft> {
  const trimmed = brief.trim();
  if (!trimmed) {
    throw new Error("brief must not be empty");
  }

  const response = await getGenAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: trimmed.slice(0, 4000),
    config: {
      systemInstruction: COURSE_DRAFT_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: COURSE_DRAFT_SCHEMA,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const usage = toUsageInfo(response.usageMetadata);
  if (usage) options.onUsage?.(usage);

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text) as MentoringCourseDraft;
  return {
    title: typeof parsed.title === "string" ? parsed.title : "",
    description: typeof parsed.description === "string" ? parsed.description : "",
    outcomes: Array.isArray(parsed.outcomes)
      ? parsed.outcomes.filter((o): o is string => typeof o === "string")
      : [],
  };
}

export interface WebSource {
  title: string;
  url: string;
}

export interface ResearchResult {
  text: string;
  sources: WebSource[];
}

export interface ResearchOptions {
  systemInstruction?: string;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

// Pull the de-duplicated list of web sources Gemini cited from the grounding
// metadata. Search grounding returns these as `groundingChunks[].web`.
function extractWebSources(response: GenerateContentResponse): WebSource[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: WebSource[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    const url = chunk.web?.uri;
    if (!url || seen.has(url)) {
      continue;
    }
    seen.add(url);
    sources.push({ title: chunk.web?.title?.trim() || url, url });
  }

  return sources;
}

// Run a one-shot Gemini call with the built-in Google Search tool enabled and
// return both the synthesized answer and the web sources it grounded on. This
// is the reusable "research agent" foundation (Perplexity-style). Uses the
// user's own GEMINI_API_KEY so it works on Cloud Run too.
export async function researchWithSearch(
  prompt: string,
  options: ResearchOptions = {},
): Promise<ResearchResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error("prompt must not be empty");
  }

  const response = await getGenAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: trimmed.slice(0, 8000),
    config: {
      systemInstruction: options.systemInstruction,
      tools: [{ googleSearch: {} }],
      maxOutputTokens: options.maxOutputTokens ?? 2048,
      abortSignal: options.signal,
    },
  });

  return { text: response.text ?? "", sources: extractWebSources(response) };
}

export interface VideoCandidate {
  title: string;
  channelTitle: string;
  description: string;
}

export interface VideoRelevanceResult {
  // Index into the candidates array of the single best video, or -1 when none
  // clear the bar.
  bestIndex: number;
  // 0-100 confidence that the chosen video is a near-perfect match for the
  // topic. Callers apply their own high threshold.
  score: number;
  reason: string;
}

const VIDEO_RELEVANCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    bestIndex: { type: Type.INTEGER },
    score: { type: Type.INTEGER },
    reason: { type: Type.STRING },
  },
  required: ["bestIndex", "score", "reason"],
};

const VIDEO_RELEVANCE_INSTRUCTION = `You are a strict quality gate that decides whether ONE of several candidate YouTube videos is a near-perfect match for a learner's topic.

You are given a topic and a numbered list of candidate videos (title, channel, description). All candidates already come from reputable, trusted science/education channels — do not second-guess the channel's credibility.

Your only job is relevance. Pick the single candidate that most directly and specifically teaches or explains the exact topic. Be extremely strict:
- Score 90-100 only when a video is clearly, specifically about the topic and would genuinely help the learner right now.
- Score below 90 for anything tangential, overly broad, only loosely related, or where you are unsure.
- If no candidate is a strong, specific match, set bestIndex to -1 and score to 0.

bestIndex is the 0-based index of the chosen candidate (or -1 for none). score is 0-100. reason is one short sentence. Respond with JSON only.`;

// Score a small set of candidate videos against a topic and return the single
// best match (or none). Used as the strict relevance gate before a verified
// video is shown to the user. Uses the user's own GEMINI_API_KEY.
export async function scoreVideoRelevance(
  topic: string,
  candidates: VideoCandidate[],
  options: { signal?: AbortSignal } = {},
): Promise<VideoRelevanceResult> {
  const cleanTopic = topic.trim();
  if (!cleanTopic || candidates.length === 0) {
    return { bestIndex: -1, score: 0, reason: "No topic or candidates." };
  }

  const list = candidates
    .map(
      (c, i) =>
        `[${i}] title: ${c.title}\n    channel: ${c.channelTitle}\n    description: ${c.description.slice(0, 400)}`,
    )
    .join("\n");

  const prompt = `Topic: ${cleanTopic.slice(0, 600)}\n\nCandidate videos:\n${list}`;

  const response = await getGenAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: VIDEO_RELEVANCE_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: VIDEO_RELEVANCE_SCHEMA,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
      abortSignal: options.signal,
    },
  });

  const text = response.text;
  if (!text) {
    return { bestIndex: -1, score: 0, reason: "Empty relevance response." };
  }

  const parsed = JSON.parse(text) as VideoRelevanceResult;
  const bestIndex =
    Number.isInteger(parsed.bestIndex) &&
    parsed.bestIndex >= 0 &&
    parsed.bestIndex < candidates.length
      ? parsed.bestIndex
      : -1;
  const score = typeof parsed.score === "number" ? parsed.score : 0;

  return { bestIndex, score, reason: parsed.reason ?? "" };
}

export interface OnboardingInsights {
  role: string | null;
  interests: string[];
  primaryGoal: string | null;
  ambition: string | null;
  insights: string[];
  summary: string | null;
}

const ONBOARDING_INSIGHTS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    role: { type: Type.STRING, nullable: true },
    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
    primaryGoal: { type: Type.STRING, nullable: true },
    ambition: { type: Type.STRING, nullable: true },
    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING, nullable: true },
  },
  required: ["interests", "insights"],
};

const ONBOARDING_INSIGHTS_INSTRUCTION = `You convert a short onboarding interview transcript from the "Citizen Science" learning platform into one structured member record. Lines are prefixed "guide:" (the AI interviewer) and "member:" (the new member's answers).

Produce:
- role: the single best-fit role slug from exactly this list, or null if truly unclear: student, researcher, professional, educator, founder, explorer, innovator.
- interests: 1-5 short science interest phrases the member expressed (e.g. "astronomy", "marine biology", "AI & computing"). Lowercase. Empty array if none.
- primaryGoal: the single best-fit goal slug from exactly this list, or null: great-minds, ai-tools, experiments, mentor, expertise, connect, share-knowledge.
- ambition: the single best-fit ambition slug from exactly this list, or null: curiosity, career, contribute, discovery, transition, inspire.
- insights: 2-5 short factual bullet observations about the member drawn only from what they said (their background, current work, motivations, what they want to share or get from the community). No speculation.
- summary: one plain-text sentence describing who this member is and what they are here for.

Only use information the member actually gave. Never fabricate. Respond with JSON only.`;

export interface ExtractOnboardingInsightsOptions {
  signal?: AbortSignal;
  onUsage?: (usage: UsageInfo) => void;
}

// Convert a free-form onboarding interview transcript into the structured
// fields the app stores (role/interests/goal/ambition + insight bullets).
// Structured JSON output, thinking off for low latency. Uses the user's own
// GEMINI_API_KEY. Callers treat failures as best-effort (save without
// extraction rather than failing onboarding).
export async function extractOnboardingInsights(
  transcript: string,
  options: ExtractOnboardingInsightsOptions = {},
): Promise<OnboardingInsights> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    throw new Error("transcript must not be empty");
  }

  const response = await getGenAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: trimmed.slice(0, 12000),
    config: {
      systemInstruction: ONBOARDING_INSIGHTS_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: ONBOARDING_INSIGHTS_SCHEMA,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
      abortSignal: options.signal,
    },
  });

  const usage = toUsageInfo(response.usageMetadata);
  if (usage) options.onUsage?.(usage);

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text) as Partial<OnboardingInsights>;
  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  const strArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.filter((s): s is string => typeof s === "string" && !!s.trim()).slice(0, 8)
      : [];
  return {
    role: str(parsed.role),
    interests: strArr(parsed.interests),
    primaryGoal: str(parsed.primaryGoal),
    ambition: str(parsed.ambition),
    insights: strArr(parsed.insights),
    summary: str(parsed.summary),
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  signal?: AbortSignal;
  maxOutputTokens?: number;
  // When true, enable Google Search grounding so replies can cite live web
  // sources. Sources are emitted as a final chunk once the stream completes.
  useSearch?: boolean;
}

// A streamed chat yields incremental text deltas and, when grounding is on, a
// single trailing chunk carrying the de-duplicated web sources. The very last
// chunk also carries the call's token usage when Gemini reports it, so callers
// can meter consumption after the stream completes.
export interface StreamChatChunk {
  text?: string;
  sources?: WebSource[];
  usage?: UsageInfo;
}

// Stream a multi-turn chat completion from Gemini, yielding text deltas.
// Uses the user's own GEMINI_API_KEY so it works anywhere (including Google
// Cloud Run), unlike the Replit AI proxy. Thinking is disabled so the token
// budget goes to the actual reply and latency stays low for this routing chat.
export async function* streamChat(
  systemPrompt: string,
  messages: ChatMessage[],
  options: StreamChatOptions = {},
): AsyncGenerator<StreamChatChunk> {
  // Gemini requires the conversation to start with a user turn and uses the
  // role name "model" instead of "assistant".
  const trimmed = [...messages];
  while (trimmed.length > 0 && trimmed[0].role !== "user") {
    trimmed.shift();
  }

  if (trimmed.length === 0) {
    throw new Error("streamChat requires at least one user message");
  }

  const contents = trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const stream = await getGenAI().models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: options.maxOutputTokens ?? 1024,
      abortSignal: options.signal,
      // Enabling the built-in Google Search tool lets the model ground its
      // reply in live web results; grounding metadata arrives across chunks.
      // Thinking must stay on for grounding — with thinkingBudget 0 the model
      // never decides to invoke the Search tool and just answers from memory.
      // For the ungrounded path we disable thinking to keep latency low.
      ...(options.useSearch
        ? { tools: [{ googleSearch: {} }] }
        : { thinkingConfig: { thinkingBudget: 0 } }),
    },
  });

  const sources: WebSource[] = [];
  const seen = new Set<string>();
  let usage: UsageInfo | null = null;

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      yield { text };
    }

    // usageMetadata is reported cumulatively; the final chunk carries the
    // call's full token count. Keep the latest non-empty value.
    const chunkUsage = toUsageInfo(chunk.usageMetadata);
    if (chunkUsage) {
      usage = chunkUsage;
    }

    if (options.useSearch) {
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        for (const gc of groundingChunks) {
          const url = gc.web?.uri;
          if (!url || seen.has(url)) {
            continue;
          }
          seen.add(url);
          sources.push({ title: gc.web?.title?.trim() || url, url });
        }
      }
    }
  }

  if (sources.length > 0) {
    yield { sources };
  }

  if (usage) {
    yield { usage };
  }
}
