import { and, eq, isNotNull } from "drizzle-orm";
import type { OutreachProspect } from "@workspace/db";
import {
  db,
  outreachProspectsTable,
  outreachTemplatesTable,
  outreachSendsTable,
  outreachSettingsTable,
} from "@workspace/db";
import { sendEmail, isResendConfigured } from "./resend";
import {
  personaliseEmail,
  buildEmailHtml,
  buildDraftEmailHtml,
} from "./personalise";
import { ensureDefaultTemplates } from "./templates";
import { logger } from "../logger";

// Default settings used when the DB row doesn't exist yet. The from-address must
// live on the verified Resend domain (citizen-science.org) or sends are rejected.
// daniel@ is the founder's real Google Workspace mailbox, so prospect replies
// reach a human and unsubscribe mailtos land somewhere watched.
const DEFAULT_SEND_HOUR = 9;
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FROM_EMAIL = "daniel@citizen-science.org";
const DEFAULT_FROM_NAME = "Daniel (Citizen Science)";

// Check every minute whether it's time to fire the daily batch.
const TICK_INTERVAL_MS = 60_000;

// Track the last date+hour slot that fired so each calendar day fires exactly
// once at the configured hour. Format: "YYYY-MM-DD:HH" (UTC).
let lastFiredSlot: string | null = null;
let schedulerHandle: NodeJS.Timeout | null = null;

async function getSettings() {
  try {
    const [row] = await db.select().from(outreachSettingsTable).limit(1);
    return {
      sendHour: row?.sendHour ?? DEFAULT_SEND_HOUR,
      batchSize: row?.batchSize ?? DEFAULT_BATCH_SIZE,
      fromEmail: row?.fromEmail ?? DEFAULT_FROM_EMAIL,
      fromName: row?.fromName ?? DEFAULT_FROM_NAME,
    };
  } catch {
    return {
      sendHour: DEFAULT_SEND_HOUR,
      batchSize: DEFAULT_BATCH_SIZE,
      fromEmail: DEFAULT_FROM_EMAIL,
      fromName: DEFAULT_FROM_NAME,
    };
  }
}

export async function runOutreachBatch(overrideBatchSize?: number): Promise<{
  sent: number;
  errors: number;
}> {
  if (!isResendConfigured()) {
    logger.info("outreach scheduler: RESEND_API_KEY not set, skipping batch");
    return { sent: 0, errors: 0 };
  }

  const settings = await getSettings();
  const batchSize = overrideBatchSize ?? settings.batchSize;

  // Ensure default templates exist so scheduled/manual runs never fail with
  // "no template for type" even before the admin has visited the templates tab.
  await ensureDefaultTemplates();

  // Only ever send to prospects that are: pending, admin-APPROVED, and have a
  // confirmed (non-null) email. Directory-queued figures and AI-researched rows
  // sit in `needs_review` until an admin approves them, so they are never blasted
  // by the daily batch.
  const prospects = await db
    .select()
    .from(outreachProspectsTable)
    .where(
      and(
        eq(outreachProspectsTable.status, "pending"),
        eq(outreachProspectsTable.reviewState, "approved"),
        isNotNull(outreachProspectsTable.email),
      ),
    )
    .orderBy(outreachProspectsTable.createdAt)
    .limit(batchSize);

  if (prospects.length === 0) {
    logger.info("outreach scheduler: no sendable prospects");
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;

  for (const prospect of prospects) {
    try {
      await sendToProspect(prospect, settings);
      sent++;
    } catch (err) {
      errors++;
      logger.error({ err, prospectId: prospect.id }, "outreach: failed to send email");
    }
  }

  logger.info({ sent, errors }, "outreach batch complete");
  return { sent, errors };
}

/**
 * Send a single personalised outreach email to one prospect, recording the send
 * and marking the prospect contacted. Throws on any failure so callers can
 * surface it. Used by both the daily batch and the admin "send now" action.
 *
 * The caller is responsible for the send gate (approved + confirmed email); this
 * function refuses an email-less prospect defensively but does not re-check the
 * review state.
 */
export async function sendToProspect(
  prospect: OutreachProspect,
  settings: {
    fromEmail: string;
    fromName: string;
  },
): Promise<void> {
  if (!prospect.email) {
    throw new Error("prospect has no confirmed email");
  }

  await ensureDefaultTemplates();

  const [template] = await db
    .select()
    .from(outreachTemplatesTable)
    .where(eq(outreachTemplatesTable.type, prospect.type))
    .limit(1);

  if (!template) {
    throw new Error(`no outreach template for type "${prospect.type}"`);
  }

  // An admin-edited draft (both halves set) wins over template + AI
  // personalisation — what the admin reviewed is exactly what gets sent.
  // Either half alone is ignored so a half-cleared draft can't produce a
  // malformed send.
  let subject: string;
  let html: string;
  if (prospect.draftSubject && prospect.draftBody) {
    subject = prospect.draftSubject;
    html = buildDraftEmailHtml(prospect.draftBody);
  } else {
    const personal = await personaliseEmail({
      name: prospect.name,
      type: prospect.type,
      notes: prospect.notes,
      subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate,
    });
    subject = personal.subject;
    html = buildEmailHtml(personal.openingParagraph, template.bodyTemplate, {
      name: prospect.name,
    });
  }

  const result = await sendEmail({
    to: prospect.email,
    subject,
    html,
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
    tags: [
      { name: "prospect_type", value: prospect.type },
      { name: "prospect_id", value: prospect.id },
    ],
  });

  const now = new Date();

  await db.insert(outreachSendsTable).values({
    prospectId: prospect.id,
    templateId: template.id,
    resendMessageId: result.id,
    subject,
    status: "pending",
    sentAt: now,
    updatedAt: now,
  });

  await db
    .update(outreachProspectsTable)
    .set({ status: "contacted", lastContactedAt: now, updatedAt: now })
    .where(eq(outreachProspectsTable.id, prospect.id));

  logger.info({ email: prospect.email, resendId: result.id }, "outreach: email sent");
}

/**
 * Resolve the effective scheduler settings (DB row or defaults). Exported so the
 * admin "send now" route can reuse the same from-address resolution.
 */
export async function getOutreachSettings(): Promise<{
  sendHour: number;
  batchSize: number;
  fromEmail: string;
  fromName: string;
}> {
  return getSettings();
}

async function tick() {
  const now = new Date();
  const nowHour = now.getUTCHours();
  const settings = await getSettings();

  if (nowHour === settings.sendHour) {
    // Build a unique slot key per calendar day + hour (UTC) so the batch fires
    // exactly once per day even after a sendHour change mid-day.
    const dateStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const slot = `${dateStr}:${String(nowHour).padStart(2, "0")}`;

    if (lastFiredSlot !== slot) {
      lastFiredSlot = slot;
      logger.info({ hour: nowHour, slot }, "outreach scheduler: daily trigger fired");
      await runOutreachBatch().catch((err) =>
        logger.error({ err }, "outreach scheduler: batch failed"),
      );
    }
  }
}

export function startOutreachScheduler(): void {
  if (schedulerHandle) return;
  schedulerHandle = setInterval(() => {
    void tick();
  }, TICK_INTERVAL_MS);
  logger.info("outreach scheduler: started");
}

export function stopOutreachScheduler(): void {
  if (schedulerHandle) {
    clearInterval(schedulerHandle);
    schedulerHandle = null;
  }
}
