import { isGeminiConfigured } from "@workspace/integrations-gemini-ai-server";
import { logger } from "../logger";

export interface PersonalisationInput {
  name: string;
  type: "researcher" | "scientist" | "investor" | "user";
  notes?: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface PersonalisationResult {
  subject: string;
  openingParagraph: string;
}

const TYPE_LABELS: Record<string, string> = {
  researcher: "academic researcher",
  scientist: "scientist",
  investor: "investor",
  user: "prospective user",
};

function templateFallback(input: PersonalisationInput): PersonalisationResult {
  const subject = input.subjectTemplate.replace(/\{\{name\}\}/g, input.name);
  const openingParagraph = `Hi ${input.name}, I wanted to reach out personally because I think you'd find Citizen Science particularly valuable.`;
  return { subject, openingParagraph };
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

    const prompt = `You are writing a personalised outreach email on behalf of Citizen Science, an AI-powered platform for science education and discovery.

Prospect details:
- Name: ${input.name}
- Role: ${typeLabel}${notesClause}

Subject line template (you may adapt it): ${input.subjectTemplate}

Write:
1. A compelling, personalised subject line (max 60 chars) for this specific person
2. A warm, personalised 1-2 sentence opening paragraph that addresses them by name and speaks to their role/interests

Respond in JSON with keys: "subject" (string) and "openingParagraph" (string).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object" as const,
          properties: {
            subject: { type: "string" as const },
            openingParagraph: { type: "string" as const },
          },
          required: ["subject", "openingParagraph"],
        },
        maxOutputTokens: 256,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text) as PersonalisationResult;

    if (!parsed.subject || !parsed.openingParagraph) {
      throw new Error("incomplete gemini response");
    }

    return {
      subject: parsed.subject.slice(0, 120),
      openingParagraph: parsed.openingParagraph.slice(0, 500),
    };
  } catch (err) {
    logger.warn({ err }, "outreach personalise: gemini failed, using fallback");
    return templateFallback(input);
  }
}

/**
 * Assemble the final plain-text body (template with {{name}} + {{opening}}
 * merged). This is the admin-editable form of the email: the preview endpoint
 * returns it, the admin edits it, and sends store it as the prospect's draft.
 */
export function buildPlainBody(
  openingParagraph: string,
  bodyTemplate: string,
  prospect: { name: string },
): string {
  return bodyTemplate
    .replace(/\{\{name\}\}/g, prospect.name)
    .replace(/\{\{opening\}\}/g, openingParagraph);
}

export function buildEmailHtml(
  openingParagraph: string,
  bodyTemplate: string,
  prospect: { name: string },
): string {
  return buildDraftEmailHtml(
    buildPlainBody(openingParagraph, bodyTemplate, prospect),
  );
}

/** Wrap a final plain-text body (template output or an admin-edited draft) in
 * the standard outreach HTML shell. */
export function buildDraftEmailHtml(body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px 0;">${p.replace(/\n/g, "<br>")}</p>`)
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
