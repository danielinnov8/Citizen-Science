import { eq } from "drizzle-orm";
import {
  db,
  outreachProspectsTable,
  outreachTemplatesTable,
  outreachSendsTable,
  outreachSettingsTable,
} from "@workspace/db";
import { sendEmail, isResendConfigured } from "./resend";
import { personaliseEmail, buildEmailHtml } from "./personalise";
import { ensureDefaultTemplates } from "./templates";
import { logger } from "../logger";

// Default settings used when the DB row doesn't exist yet.
const DEFAULT_SEND_HOUR = 9;
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FROM_EMAIL = "outreach@citizenscience.app";
const DEFAULT_FROM_NAME = "Citizen Science";

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

  const prospects = await db
    .select()
    .from(outreachProspectsTable)
    .where(eq(outreachProspectsTable.status, "pending"))
    .orderBy(outreachProspectsTable.createdAt)
    .limit(batchSize);

  if (prospects.length === 0) {
    logger.info("outreach scheduler: no pending prospects");
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;

  for (const prospect of prospects) {
    try {
      const [template] = await db
        .select()
        .from(outreachTemplatesTable)
        .where(eq(outreachTemplatesTable.type, prospect.type))
        .limit(1);

      if (!template) {
        logger.warn({ prospectId: prospect.id, type: prospect.type }, "outreach: no template for type");
        errors++;
        continue;
      }

      const { subject, openingParagraph } = await personaliseEmail({
        name: prospect.name,
        type: prospect.type,
        notes: prospect.notes,
        subjectTemplate: template.subjectTemplate,
        bodyTemplate: template.bodyTemplate,
      });

      const html = buildEmailHtml(openingParagraph, template.bodyTemplate, {
        name: prospect.name,
      });

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

      sent++;
      logger.info({ email: prospect.email, resendId: result.id }, "outreach: email sent");
    } catch (err) {
      errors++;
      logger.error({ err, prospectId: prospect.id }, "outreach: failed to send email");
    }
  }

  logger.info({ sent, errors }, "outreach batch complete");
  return { sent, errors };
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
