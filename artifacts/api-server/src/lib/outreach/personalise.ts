import { isGeminiConfigured } from "@workspace/integrations-gemini-ai-server";
import { logger } from "../logger";

export interface PersonalisationInput {
  name: string;
  type: "researcher" | "scientist" | "investor" | "user";
  notes?: string;
  subjectTemplate: string;
}

export interface PersonalisationResult {
  subject: string;
  /** Short clause completing "…because {reason}." — why THIS person. */
  reason: string;
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
}

export function profileUrl(slug: string): string {
  // Strip trailing slashes so a PUBLIC_BASE_URL configured with one doesn't
  // produce a double-slash URL.
  const base = (
    process.env.PUBLIC_BASE_URL ?? "https://citizen-science.org"
  ).replace(/\/+$/, "");
  return `${base}/directory/${encodeURIComponent(slug)}`;
}

const FALLBACK_REASON =
  "your work is exactly the kind our community of curious minds loves to learn from";

function templateFallback(input: PersonalisationInput): PersonalisationResult {
  const subject = input.subjectTemplate.replace(/\{\{name\}\}/g, input.name);
  return { subject, reason: FALLBACK_REASON };
}

/**
 * Force the AI-written clause to be a single, short, sentence-safe clause:
 * one line, no internal sentence punctuation, ≤ 15 words. This is what
 * guarantees the "2-3 sentences max" promise no matter what the model returns.
 */
export function normalizeReason(raw: string): string {
  const oneLine = raw.replace(/\s+/g, " ").trim();
  const noSentencePunct = oneLine.replace(/[.!?]+/g, "");
  const words = noSentencePunct.split(" ").filter(Boolean).slice(0, 15);
  const clause = words.join(" ").trim();
  return clause.length >= 3 ? clause : FALLBACK_REASON;
}

export async function personaliseEmail(
  input: PersonalisationInput,
): Promise<PersonalisationResult> {
  if (!isGeminiConfigured()) {
    return templateFallback(input);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const typeLabel = TYPE_LABELS[input.type] ?? input.type;
    const notesClause = input.notes?.trim()
      ? `\nAdditional context about them: ${input.notes.trim()}`
      : "";

    const prompt = `You are writing a short, warm outreach email on behalf of Citizen Science, an AI-powered platform for science education and discovery.

Prospect details:
- Name: ${input.name}
- Role: ${typeLabel}${notesClause}

Subject line template (you may adapt it): ${input.subjectTemplate}

Write:
1. A compelling, personalised subject line (max 60 chars) for this specific person
2. "reason": ONE short clause (max 15 words, lowercase, no trailing period) completing the sentence "We are inviting you to be part of Citizen Science because …" — specific to this person's work and why our community would value them.

Respond in JSON with keys: "subject" (string) and "reason" (string).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object" as const,
          properties: {
            subject: { type: "string" as const },
            reason: { type: "string" as const },
          },
          required: ["subject", "reason"],
        },
        maxOutputTokens: 256,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text) as PersonalisationResult;

    if (!parsed.subject || !parsed.reason) {
      throw new Error("incomplete gemini response");
    }

    return {
      subject: parsed.subject.slice(0, 120),
      reason: normalizeReason(parsed.reason),
    };
  } catch (err) {
    logger.warn({ err }, "outreach personalise: gemini failed, using fallback");
    return templateFallback(input);
  }
}

/**
 * Assemble the final plain-text body — deliberately 2-3 sentences:
 *   1. the invitation, personalised with the AI-written "because" clause
 *   2. a link to the prospect's directory profile (when one is linked)
 *   3. the social-proof close
 * This is the admin-editable form of the email: the preview endpoint returns
 * it, the admin edits it, and sends store it verbatim as the prospect's draft.
 */
export function buildPlainBody(
  reason: string,
  prospect: { name: string },
  profile?: ProfileBlurb | null,
): string {
  const firstName = prospect.name.trim().split(/\s+/)[0] || prospect.name;
  const paragraphs = [
    `Hi ${firstName},`,
    `We are inviting you to be part of Citizen Science because ${reason}.`,
  ];
  if (profile?.slug) {
    paragraphs.push(
      `Here's a link to view your profile: ${profileUrl(profile.slug)}`,
    );
  }
  paragraphs.push(
    `You'd be joining thousands of leading scientists, researchers, and Nobel laureates already on Citizen Science — we'd be honoured to have you.`,
    `— Daniel\nCitizen Science`,
  );
  return paragraphs.join("\n\n");
}

export function buildEmailHtml(
  reason: string,
  prospect: { name: string },
  profile?: ProfileBlurb | null,
): string {
  return buildDraftEmailHtml(buildPlainBody(reason, prospect, profile));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap a final plain-text body (generated or an admin-edited draft) in the
 * standard outreach HTML shell. Body text is HTML-escaped before <br>
 * conversion: the draft editor is plain text, so what the admin sees is
 * exactly what recipients get — and AI- or prospect-sourced text can never
 * inject markup into an outbound email. */
export function buildDraftEmailHtml(body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#0F172A;max-width:600px;margin:0 auto;padding:32px 24px;">
${paragraphs}
<hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0;">
<p style="font-size:12px;color:#94A3B8;">
  You're receiving this because you were added to our outreach list.
  To unsubscribe reply with "unsubscribe" in the subject.
</p>
</body>
</html>`;
}
