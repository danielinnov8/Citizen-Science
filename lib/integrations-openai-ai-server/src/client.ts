import OpenAI from "openai";

let client: OpenAI | null = null;

// Lazily construct the OpenAI client on first use rather than at import time.
// This keeps the server bootable in environments where the OpenAI AI
// integration is not provisioned (e.g. Google Cloud Run, where Replit's AI
// proxy env vars are absent) — only the chat route fails, not the whole
// process. Callers should handle the thrown error.
export function getOpenAI(): OpenAI {
  if (client) {
    return client;
  }

  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  client = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  return client;
}
