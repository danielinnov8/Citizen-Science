import { isGeminiConfigured } from "@workspace/integrations-gemini-ai-server";
import { logger } from "../logger";

export interface PersonalisationInput {
  name: string;
  type: "researcher" | "scientist" | "investor" | "user";
  notes?: string;
}

export interface PersonalisationResult {
  /** Short noun phrase naming the person's field or specific contribution —
   * completes "…because of your work in {field}." */
  field: string;
}

const TYPE_LABELS: Record<string, string> = {
  researcher: "academic researcher",
  scientist: "scientist",
  investor: "investor",
  user: "prospective user",
};

/** The directory profile a prospect is linked to (if any). */
export interface ProfileBlurb {
  slug: string;
  /** True when the figure is living and can claim the page themselves. */
  claimable: boolean;
  /** The profile's vetted field/discipline — trusted fallback for the
   * AI-written field phrase when Gemini is unavailable. */
  field?: string | null;
}

export function profileUrl(slug: string): string {
  // Strip trailing slashes so a PUBLIC_BASE_URL configured with one doesn't
  // produce a double-slash URL.
  const base = (
    process.env.PUBLIC_BASE_URL ?? "https://citizen-science.org"
  ).replace(/\/+$/, "");
  return `${base}/directory/${encodeURIComponent(slug)}`;
}

export const FALLBACK_FIELD = "your field";

/**
 * Send-time gate enforcing the brief's first copy rule: every invitation must
 * name the recipient's actual field or contribution. A draft still containing
 * the generic fallback phrase was never personalised (AI unavailable AND no
 * vetted profile field) — refuse to send it; the admin edits the draft and
 * retries. Pure + DB-free so it's unit-testable and cheap at send time.
 */
export function assertDraftSendable(draft: { body: string }): void {
  if (draft.body.includes(`your work in ${FALLBACK_FIELD}`)) {
    throw new Error(
      "Draft has no specific research field — edit the email to name their work before sending.",
    );
  }
}

/**
 * Force the AI-written field phrase to be sentence-safe: one line, no
 * sentence punctuation, ≤ 10 words (the brief caps the whole email at ~120
 * words, so the personalised phrase must stay tight).
 */
export function normalizeField(raw: string): string {
  const oneLine = raw.replace(/\s+/g, " ").trim();
  const noSentencePunct = oneLine.replace(/[.!?]+/g, "");
  const words = noSentencePunct.split(" ").filter(Boolean).slice(0, 10);
  const phrase = words.join(" ").trim();
  return phrase.length >= 3 ? phrase : FALLBACK_FIELD;
}

/**
 * The ONLY thing AI writes in the invitation email: a factual noun phrase
 * naming the recipient's research field or specific contribution. Subjects
 * come deterministically from the admin-editable template (institutional
 * style, e.g. "Invitation to Citizen Science — {{name}}") and the body copy
 * is fixed by the design brief — AI variance is confined to one clause.
 */
export async function personaliseEmail(
  input: PersonalisationInput,
): Promise<PersonalisationResult> {
  if (!isGeminiConfigured()) {
    return { field: FALLBACK_FIELD };
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const typeLabel = TYPE_LABELS[input.type] ?? input.type;
    const notesClause = input.notes?.trim()
      ? `\nWhat we know about them: ${input.notes.trim()}`
      : "";

    const prompt = `You are helping write a short, personal, institutional invitation email from the founder of Citizen Science, an independent platform for discovering scientists and their work. The audience is Nobel laureates, professors, and prominent researchers — the tone is a respected scientific institution, never marketing.

Prospect:
- Name: ${input.name}
- Role: ${typeLabel}${notesClause}

Write ONE short noun phrase (max 10 words) naming this person's research field or specific scientific contribution — e.g. "quantum many-body physics" or "mRNA vaccine research". It completes the sentence: "I'm reaching out personally because of your work in {field}."

Rules: factual and specific to THIS person; no hype, no superlatives, no marketing language; no trailing period; lowercase except proper nouns and acronyms. If you don't know their work, answer exactly "your field".

Respond in JSON with one key: "field" (string).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object" as const,
          properties: {
            field: { type: "string" as const },
          },
          required: ["field"],
        },
        maxOutputTokens: 128,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const parsed = JSON.parse(response.text ?? "") as { field?: string };
    if (!parsed.field) {
      throw new Error("incomplete gemini response");
    }

    return { field: normalizeField(parsed.field) };
  } catch (err) {
    logger.warn({ err }, "outreach personalise: gemini failed, using fallback");
    return { field: FALLBACK_FIELD };
  }
}

/**
 * Assemble the final plain-text body per the institutional design brief:
 * short, personal, understated — a founder's letter, not a campaign. Fixed
 * copy; the only variable parts are the recipient's name, the AI-written
 * field phrase, the profile link (when linked), and the sender address.
 * This is the admin-editable form of the email: the preview returns it, the
 * admin edits it, and sends store it verbatim as the prospect's draft.
 */
export function buildPlainBody(
  field: string,
  prospect: { name: string },
  profile?: ProfileBlurb | null,
  senderEmail: string = "daniel@citizen-science.org",
): string {
  const firstName = prospect.name.trim().split(/\s+/)[0] || prospect.name;
  const paragraphs = [
    `Hi ${firstName},`,
    `I'm Daniel, founder of Citizen Science.`,
    `We're building a platform that connects the world's greatest minds to solve humanity's greatest challenges.`,
    `I'm reaching out personally because of your work in ${field}.`,
  ];
  if (profile?.slug) {
    paragraphs.push(
      `We've prepared a preliminary directory page for you here:`,
      `View your Citizen Science profile →\n${profileUrl(profile.slug)}`,
      `If you'd like to participate, you can claim the profile, update your work, and decide what information is displayed.`,
    );
  }
  paragraphs.push(
    `We would like to invite you to become an honorary member of our community.`,
    `Best,\n\nDaniel Innovaté\nFounder, Citizen Science\ncitizen-science.org\n${senderEmail}`,
  );
  return paragraphs.join("\n\n");
}

export function buildEmailHtml(
  field: string,
  prospect: { name: string },
  profile?: ProfileBlurb | null,
  senderEmail?: string,
): string {
  return buildDraftEmailHtml(buildPlainBody(field, prospect, profile, senderEmail));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Line-level patterns for the HTML renderer. Applied AFTER escaping, on whole
// lines only, so admin-edited drafts render predictably and prose can never
// accidentally turn into a link.
const CTA_LINE = /^View your Citizen Science profile\s*→?\s*$/;
const URL_LINE = /^https?:\/\/\S+$/;
const DOMAIN_LINE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const EMAIL_LINE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function renderParagraph(paragraph: string): string {
  const lines = escapeHtml(paragraph)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const next = lines[i + 1];
    if (CTA_LINE.test(line) && next && URL_LINE.test(next)) {
      // The one primary link: descriptive anchor (per the brief), followed by
      // the raw URL in muted type so the destination is visibly verifiable.
      out.push(`<a href="${next}" style="color:#111827;">${line}</a>`);
      out.push(`<a href="${next}" style="color:#9CA3AF;font-size:13px;">${next}</a>`);
      i++;
    } else if (URL_LINE.test(line)) {
      out.push(`<a href="${line}" style="color:#111827;">${line}</a>`);
    } else if (EMAIL_LINE.test(line)) {
      out.push(`<a href="mailto:${line}" style="color:#111827;">${line}</a>`);
    } else if (DOMAIN_LINE.test(line)) {
      // Signature domain — linked so the destination visibly resolves to the
      // real citizen-science.org.
      out.push(`<a href="https://${line}" style="color:#111827;">${line}</a>`);
    } else {
      out.push(line);
    }
  }
  return `<p style="margin:0 0 20px 0;">${out.join("<br>")}</p>`;
}

/**
 * Wrap a final plain-text body (generated or an admin-edited draft) in the
 * institutional HTML shell: white background, dark serif typography, small
 * text wordmark + hairline divider, no buttons/cards/graphics, and a muted
 * footer with the about line and opt-out language. Body text is HTML-escaped
 * before markup conversion: the draft editor is plain text, so what the admin
 * sees is exactly what recipients get — and AI- or prospect-sourced text can
 * never inject markup into an outbound email.
 */
export function buildDraftEmailHtml(body: string): string {
  const raw = body.split(/\n\n+/);
  // Reunite a CTA line and its URL even when an admin edit split them across
  // paragraphs with a blank line — the descriptive anchor must remain the one
  // primary link regardless of how the draft was edited.
  const merged: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = raw[i]!.trim();
    const next = raw[i + 1]?.trim();
    if (CTA_LINE.test(p) && next && URL_LINE.test(next)) {
      merged.push(`${p}\n${next}`);
      i++;
    } else {
      merged.push(raw[i]!);
    }
  }
  const paragraphs = merged.map(renderParagraph).join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFFFF;">
<div style="font-family:Georgia,'Times New Roman',serif;color:#111827;max-width:560px;margin:0 auto;padding:40px 24px;font-size:16px;line-height:1.65;">
  <div style="font-size:15px;letter-spacing:0.08em;">Citizen&nbsp;Science</div>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:14px 0 32px 0;">
${paragraphs}
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:36px 0 16px 0;">
  <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0 0 8px 0;">Citizen Science is an independent platform for discovering scientists, research, institutions, and scientific ideas.</p>
  <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0;">Citizen Science &middot; citizen-science.org<br>You received this message because we are inviting researchers whose work is represented in the Citizen Science directory. To opt out, reply with &ldquo;unsubscribe&rdquo; in the subject line.</p>
</div>
</body>
</html>`;
}
