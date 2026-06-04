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

export async function analyzeFieldNotes(rawText: string): Promise<FieldNoteAnalysis> {
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

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text) as FieldNoteAnalysis;
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
// single trailing chunk carrying the de-duplicated web sources.
export interface StreamChatChunk {
  text?: string;
  sources?: WebSource[];
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

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      yield { text };
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
}
