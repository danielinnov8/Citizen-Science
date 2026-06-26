import {
  isGeminiConfigured,
  researchWithSearch,
} from "@workspace/integrations-gemini-ai-server";
import type { ProspectContactInfo } from "@workspace/db";
import { logger } from "../logger";

export interface ContactResearchInput {
  name: string;
  field?: string | null;
  era?: string | null;
}

const URL_RE = /^https?:\/\/\S+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pull the first balanced JSON object out of a model reply that may be wrapped
// in prose or ```json fences. The grounded research call can't use a strict
// responseSchema (Google Search tool + JSON mode are mutually exclusive), so we
// parse leniently and validate every field ourselves.
function extractJsonObject(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "```").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function cleanString(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || /^(null|n\/a|none|unknown)$/i.test(t)) return null;
  return t.slice(0, max);
}

function sanitizeContactInfo(raw: unknown): ProspectContactInfo {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;

  const email = cleanString(obj.email, 200);
  const website = cleanString(obj.website, 300);
  const contactPage = cleanString(obj.contactPage, 300);
  const notes = cleanString(obj.notes, 600);

  const socialsRaw = Array.isArray(obj.socials) ? obj.socials : [];
  const socials = socialsRaw
    .map((s) => cleanString(s, 200))
    .filter((s): s is string => !!s)
    .slice(0, 4);

  const result: ProspectContactInfo = {};
  // Only accept an email that actually looks like one — never fabricate.
  if (email && EMAIL_RE.test(email)) result.email = email;
  if (website && URL_RE.test(website)) result.website = website;
  if (contactPage && URL_RE.test(contactPage)) result.contactPage = contactPage;
  if (socials.length) result.socials = socials;
  if (notes) result.notes = notes;
  return result;
}

/**
 * Best-effort public contact research for a single living directory figure via
 * the app's built-in Gemini web search. Returns a sanitized, never-fabricated
 * contact-info object. Throws only on an actual model/transport failure so the
 * caller can leave the row unresearched and retry on a later batch; a legitimate
 * "nothing found" resolves to an empty object.
 */
export async function researchProspectContact(
  input: ContactResearchInput,
): Promise<ProspectContactInfo> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const descriptor = [input.field, input.era]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");

  const prompt = `Using web search, find PUBLICLY PUBLISHED professional contact channels for ${input.name}${
    descriptor ? ` (${descriptor})` : ""
  }.

Only report information that is genuinely publicly available (an official personal/lab/university website, a public professional or press/media email, a "contact" page, or public professional social profiles). Do NOT guess, infer, or fabricate any email address or URL.

Respond with ONLY a JSON object, no prose, in exactly this shape:
{
  "email": string | null,        // a clearly-published public professional/lab/press email, else null
  "website": string | null,      // official personal/lab/institution homepage URL, else null
  "contactPage": string | null,  // a dedicated public contact/booking page URL, else null
  "socials": string[],           // up to 4 public professional profile URLs (LinkedIn, X/Twitter, lab, etc.)
  "notes": string | null         // one short sentence on the best way to reach them publicly
}

If you cannot verify a field, use null (or [] for socials). Never invent an email.`;

  const { text } = await researchWithSearch(prompt, {
    systemInstruction:
      "You are a meticulous research assistant. You only report contact details that are publicly published and verifiable, and you never fabricate email addresses or URLs.",
    maxOutputTokens: 1024,
  });

  const parsed = extractJsonObject(text);
  const info = sanitizeContactInfo(parsed);
  logger.info(
    {
      name: input.name,
      foundEmail: !!info.email,
      foundWebsite: !!info.website,
      socials: info.socials?.length ?? 0,
    },
    "outreach: contact research complete",
  );
  return info;
}
