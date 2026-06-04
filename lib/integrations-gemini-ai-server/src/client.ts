import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY must be set. Add it in the Secrets tab to enable field-note analysis.",
  );
}

export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

  const response = await genai.models.generateContent({
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
