import { and, eq, isNotNull } from "drizzle-orm";
import type { OutreachProspect } from "@workspace/db";
import {
  db,
  outreachProspectsTable,
  outreachTemplatesTable,
  outreachSendsTable,
} from "@workspace/db";
import { sendEmail, isResendConfigured, ResendRejectedError } from "./resend";
import { buildDraftEmailHtml, assertDraftSendable } from "./personalise";
import { ensureDefaultTemplates } from "./templates";
import { ensureProspectDraft } from "./draft";
import { getOutreachSettings } from "./settings";
import { logger } from "../logger";

// Re-exported so the admin "send now" route can reuse the same from-address
// resolution without importing the settings module directly.
export { getOutreachSettings } from "./settings";

// Check every minute whether it's time to fire the daily batch.
const TICK_INTERVAL_MS = 60_000;

// Track the last date+hour slot that fired so each calendar day fires exactly
// once at the configured hour. Format: "YYYY-MM-DD:HH" (UTC).
let lastFiredSlot: string | null = null;
let schedulerHandle: NodeJS.Timeout | null = null;

export async function runOutreachBatch(overrideBatchSize?: number): Promise<{
  sent: number;
  errors: number;
}> {
  if (!isResendConfigured()) {
    logger.info("outreach scheduler: RESEND_API_KEY not set, skipping batch");
    return { sent: 0, errors: 0 };
  }

  const settings = await getOutreachSettings();
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

// In-process per-prospect send locks: serialize sends of the same prospect so
// a "send now" double-click or a manual send overlapping the daily batch runs
// one after another and gets a clean "already contacted" error instead of
// racing. The DB-level claim in deliverToProspect is the actual
// duplicate-delivery guard — the lock just keeps the loser from burning work
// before it sees the claim was lost.
const inFlightSends = new Map<string, Promise<void>>();

/**
 * Send a single personalised outreach email to one prospect, recording the send
 * and marking the prospect contacted. Throws on any failure so callers can
 * surface it. Used by both the daily batch and the admin "send now" action.
 *
 * The full send gate — pending status, approved review state, confirmed
 * email — is enforced atomically by the claim inside, so this is safe to call
 * from anywhere. Deliberate resends go through the admin editor: set the
 * prospect's status back to pending, then send.
 */
export async function sendToProspect(
  prospect: OutreachProspect,
  settings: {
    fromEmail: string;
    fromName: string;
  },
): Promise<void> {
  const id = prospect.id;
  const tail = inFlightSends.get(id) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const next = tail.then(() => gate);
  inFlightSends.set(id, next);

  await tail;
  try {
    await deliverToProspect(id, settings);
  } finally {
    release();
    // Drop the lock only if nobody queued behind us, so the map can't grow.
    if (inFlightSends.get(id) === next) inFlightSends.delete(id);
  }
}

async function deliverToProspect(
  prospectId: string,
  settings: {
    fromEmail: string;
    fromName: string;
  },
): Promise<void> {
  // Read the row fresh: the caller's copy can be stale (an admin edit, or a
  // concurrent preview/approve that stored a newer draft). Also captures the
  // pre-claim state the rollback restores if the send fails after claiming.
  const [before] = await db
    .select()
    .from(outreachProspectsTable)
    .where(eq(outreachProspectsTable.id, prospectId))
    .limit(1);

  if (!before) {
    throw new Error("prospect no longer exists");
  }
  if (before.reviewState !== "approved") {
    throw new Error("prospect is not approved for sending");
  }
  if (!before.email) {
    throw new Error("prospect has no confirmed email");
  }
  if (before.status !== "pending") {
    throw new Error(
      `prospect status is "${before.status}", not pending — set status back to pending to resend`,
    );
  }

  // Claim the send atomically BEFORE calling Resend: the pending -> contacted
  // transition lands only if the row is still eligible, so overlapping sends
  // (manual vs batch, double-click) can never deliver the same person twice —
  // the loser's update matches zero rows.
  const claimedAt = new Date();
  const [claim] = await db
    .update(outreachProspectsTable)
    .set({
      status: "contacted",
      lastContactedAt: claimedAt,
      updatedAt: claimedAt,
    })
    .where(
      and(
        eq(outreachProspectsTable.id, prospectId),
        eq(outreachProspectsTable.status, "pending"),
        eq(outreachProspectsTable.reviewState, "approved"),
        isNotNull(outreachProspectsTable.email),
      ),
    )
    .returning({ id: outreachProspectsTable.id });

  if (!claim) {
    // Lost a race against a concurrent state change between our read and the
    // claim — fail loudly; the caller can retry.
    throw new Error("prospect state changed concurrently — retry the send");
  }

  // Outcome tracking: `attempted` flips just before the Resend API call,
  // `accepted` just after it resolves. A failure is safe to requeue ONLY when
  // the email definitely never left us — pre-attempt (template/draft) or a
  // definitive 4xx rejection. An ambiguous failure after an attempt (network
  // drop, 5xx, unparseable response) may mean Resend accepted it, so the
  // prospect keeps the claim; requeuing would risk a duplicate delivery.
  let attempted = false;
  let accepted = false;
  try {
    await ensureDefaultTemplates();

    const [template] = await db
      .select()
      .from(outreachTemplatesTable)
      .where(eq(outreachTemplatesTable.type, before.type))
      .limit(1);

    if (!template) {
      throw new Error(`no outreach template for type "${before.type}"`);
    }

    // The queued draft is the source of truth: generated and stored at approve
    // or preview time (just-in-time here for older approved rows), so what the
    // admin reviewed is exactly what gets sent — never regenerated at send time.
    const draft = await ensureProspectDraft(prospectId);
    // Brief rule 1: never send an invitation that couldn't name the
    // recipient's actual work — the admin must edit the draft first. Throws
    // pre-attempt, so the claim rolls back and the prospect stays retryable.
    assertDraftSendable(draft);
    const subject = draft.subject;
    const html = buildDraftEmailHtml(draft.body);

    attempted = true;
    const result = await sendEmail({
      to: before.email,
      subject,
      html,
      // Multipart: the stored plain-text draft goes along as the text/plain
      // alternative — institutional emails should render cleanly everywhere.
      text: draft.body,
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      // BCC the sender's mailbox: Resend sends bypass Gmail, so this copy is
      // the founder's paper trail of every outreach email that goes out.
      bcc: settings.fromEmail,
      tags: [
        { name: "prospect_type", value: before.type },
        { name: "prospect_id", value: prospectId },
      ],
    });
    accepted = true;

    await db.insert(outreachSendsTable).values({
      prospectId,
      templateId: template.id,
      resendMessageId: result.id,
      subject,
      status: "pending",
      sentAt: claimedAt,
      updatedAt: claimedAt,
    });

    logger.info(
      { email: before.email, prospectId, resendId: result.id },
      "outreach: email sent",
    );
  } catch (err) {
    const definiteNoSend = !attempted || err instanceof ResendRejectedError;
    if (!definiteNoSend) {
      // Ambiguous attempt (or post-acceptance bookkeeping failure): the email
      // may be on its way. Keep the claim (contacted) so no batch retries
      // delivery, and log loudly for manual reconciliation — the Resend
      // dashboard and the BCC copy show whether it actually went out.
      logger.error(
        { err, prospectId, accepted },
        "outreach: send outcome uncertain — prospect stays contacted; check the Resend dashboard or BCC copy before flipping status back to pending",
      );
    } else {
      // The email never reached Resend: release the claim so the prospect
      // stays retryable by the next batch or a manual send. The rollback is
      // conditional on the row still holding THIS attempt's claim
      // (status=contacted + our claimedAt marker), so a concurrent admin
      // change (e.g. unsubscribe) is never overwritten.
      await db
        .update(outreachProspectsTable)
        .set({
          status: before.status,
          lastContactedAt: before.lastContactedAt,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(outreachProspectsTable.id, prospectId),
            eq(outreachProspectsTable.status, "contacted"),
            eq(outreachProspectsTable.lastContactedAt, claimedAt),
          ),
        )
        .catch((rollbackErr) =>
          logger.error(
            { err: rollbackErr, prospectId },
            "outreach: failed to roll back prospect status after send failure",
          ),
        );
    }
    throw err;
  }
}

async function tick() {
  const now = new Date();
  const nowHour = now.getUTCHours();
  const settings = await getOutreachSettings();

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
