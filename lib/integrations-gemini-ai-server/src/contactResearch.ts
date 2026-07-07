import { researchWithSearch } from "./client";

/**
 * Best-effort public contact channels gathered by a Google-Search-grounded
 * Gemini pass. All fields are optional — nothing is ever fabricated, so a
 * sparsely-populated (or empty) object is normal. Structurally identical to
 * the DB-side `ProspectContactInfo` in `@workspace/db`; kept separate so this
 * lib does not depend on the DB package.
 */
export interface PublicContactInfo {
  email?: string | null;
  website?: string | null;
  contactPage?: string | null;
  socials?: string[];
  notes?: string | null;
}

export interface ContactResearchInput {
  name: string;
  field?: string | null;
  era?: string | null;
}

export interface DeepContactResearchInput extends ContactResearchInput {
  /** Official site found by the first pass, if any — the deep pass starts here. */
  knownWebsite?: string | null;
  /** Contact page found by the first pass, if any. */
  knownContactPage?: string | null;
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

function sanitizeContactInfo(raw: unknown): PublicContactInfo {
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

  const result: PublicContactInfo = {};
  // Only accept an email that actually looks like one — never fabricate.
  if (email && EMAIL_RE.test(email)) result.email = email;
  if (website && URL_RE.test(website)) result.website = website;
  if (contactPage && URL_RE.test(contactPage)) result.contactPage = contactPage;
  if (socials.length) result.socials = socials;
  if (notes) result.notes = notes;
  return result;
}

/**
 * Best-effort public contact research for a single living figure via the
 * Google-Search-grounded Gemini pass. Returns a sanitized, never-fabricated
 * contact-info object. Throws only on an actual model/transport failure so the
 * caller can leave the row unresearched and retry on a later batch; a
 * legitimate "nothing found" resolves to an empty object.
 *
 * Callers must check `isGeminiConfigured()` first if they want a friendly
 * error path — this function assumes a configured key.
 */
export async function researchPublicContact(
  input: ContactResearchInput,
): Promise<PublicContactInfo> {
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
  return sanitizeContactInfo(parsed);
}

/**
 * Second, deeper email-hunting pass for figures whose first research pass found
 * no public email. Digs through the channels where academics' and public
 * figures' addresses are actually published — faculty/lab profile pages,
 * university directories, CVs, paper correspondence lines, press offices,
 * speaker bureaus — and, unlike the first pass, accepts an INSTITUTIONAL
 * fallback (department office, press/media contact, agent/assistant) as long
 * as `notes` says exactly whose address it is. Still never fabricates: every
 * email must be genuinely published somewhere findable.
 */
export async function researchDeepContact(
  input: DeepContactResearchInput,
): Promise<PublicContactInfo> {
  const descriptor = [input.field, input.era]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");

  const known: string[] = [];
  if (input.knownWebsite) known.push(`- Official website: ${input.knownWebsite}`);
  if (input.knownContactPage)
    known.push(`- Contact page: ${input.knownContactPage}`);

  const prompt = `Using web search, do a DEEP hunt for a publicly published email address to reach ${input.name}${
    descriptor ? ` (${descriptor})` : ""
  }.
${known.length ? `\nAlready known from earlier research:\n${known.join("\n")}\n` : ""}
Search hard in the places where such addresses are actually published:
1. Their current university/institute FACULTY or LAB PROFILE page (search "site:university-domain ${input.name} email", "${input.name} faculty profile", "${input.name} lab contact").
2. Their institution's public STAFF DIRECTORY.
3. A recent CV, homepage, or course page listing an address.
4. The CORRESPONDING-AUTHOR line of a recent paper (publisher pages often show it).
5. Their institution's PRESS/MEDIA OFFICE, department office, or official agent/speaker bureau — an institutional route is an acceptable FALLBACK if no personal address is published, but "notes" MUST then state exactly whose address it is (e.g. "department office email; forward requests to her assistant").

Rules:
- Report an email ONLY if it is genuinely published on a real page you found. NEVER guess or construct an address from a name pattern.
- Prefer the person's own published address; otherwise the closest official institutional route.
- Also fill website/contactPage/socials if you find better ones than already known.

Respond with ONLY a JSON object, no prose, in exactly this shape:
{
  "email": string | null,        // published personal OR institutional-route email, else null
  "website": string | null,
  "contactPage": string | null,
  "socials": string[],           // up to 4 public professional profile URLs
  "notes": string | null         // REQUIRED when email is set: whose address it is + where it was published
}

If nothing verifiable is found, use null (or [] for socials).`;

  const { text } = await researchWithSearch(prompt, {
    systemInstruction:
      "You are a meticulous research assistant. You only report contact details that are publicly published and verifiable, and you never fabricate email addresses or URLs. When you report an institutional or intermediary email, your notes always state exactly whose address it is.",
    maxOutputTokens: 1536,
  });

  const parsed = extractJsonObject(text);
  return sanitizeContactInfo(parsed);
}
