import { logger } from "../logger";

const RESEND_API_URL = "https://api.resend.com/emails";

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
  /** Optional BCC copy address (e.g. the sender's own inbox for a paper trail —
   * Resend sends bypass Gmail entirely, so nothing lands in the Sent folder). */
  bcc?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  id: string;
}

export async function sendEmail(
  opts: SendEmailOptions,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const body = {
    from: `${opts.fromName} <${opts.fromEmail}>`,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    headers: {
      "List-Unsubscribe": `<mailto:${opts.fromEmail}?subject=unsubscribe>`,
    },
    ...(opts.bcc ? { bcc: [opts.bcc] } : {}),
    ...(opts.tags?.length ? { tags: opts.tags } : {}),
  };

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, body: text }, "Resend API error");
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
