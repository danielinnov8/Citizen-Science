import { logger } from "../logger";

const RESEND_API_URL = "https://api.resend.com/emails";

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative sent alongside the HTML part (multipart email). */
  text?: string;
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

/**
 * Thrown when Resend DEFINITIVELY rejected the email (4xx response): the
 * message was never accepted, so callers may safely requeue the prospect.
 * Any other failure — network drop, truncated/unparseable response, 5xx — is
 * ambiguous (the email may have been accepted) and surfaces as a plain Error
 * so callers treat it as reconciliation-needed, never auto-retry. (Resend's
 * API has no idempotency-key support, so classification is the only guard.)
 */
export class ResendRejectedError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ResendRejectedError";
  }
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
    ...(opts.text ? { text: opts.text } : {}),
    headers: {
      "List-Unsubscribe": `<mailto:${opts.fromEmail}?subject=unsubscribe>`,
    },
    ...(opts.bcc ? { bcc: [opts.bcc] } : {}),
    ...(opts.tags?.length ? { tags: opts.tags } : {}),
  };

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    // Hard deadline so a hung Resend call bounds a batch instead of hanging
    // the request. An abort is an ambiguous post-attempt failure: callers
    // must treat it as possibly-sent (keep contacted), never auto-retry.
    signal: AbortSignal.timeout(10_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, body: text }, "Resend API error");
    // 4xx = definitive rejection (bad key, validation, rate limit): the email
    // was not accepted. 5xx is ambiguous — Resend may have accepted it before
    // failing — so it must not read as retryable to callers.
    if (res.status >= 400 && res.status < 500) {
      throw new ResendRejectedError(
        res.status,
        `Resend error ${res.status}: ${text}`,
      );
    }
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
