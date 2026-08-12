import { and, eq, isNotNull, sql } from "drizzle-orm";
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

export interface SelectedSendResult {
  id: string;
  name: string;
  ok: boolean;
  error?: string;
}

/** Injectable seams so the batch flow is testable without a database. */
export interface SelectedSendDeps {
  getSettings: () => Promise<{ fromEmail: string; fromName: string }>;
  prepareDefaults: () => Promise<void>;
  loadProspect: (id: string) => Promise<OutreachProspect | undefined>;
  /**
   * Atomic conditional approval: one UPDATE gated on the row still being
   * pending with a resolvable email. COALESCE keeps an admin-edited email and
   * only promotes the researched contact email when the column is empty; the
   * RETURNING email is the address we actually send to, so a concurrent edit
   * or unsubscribe always wins. Null = the row changed underneath us (the
   * item is reported, never overwritten). No timestamp equality — Postgres
   * microsecond precision makes JS-Date round-trip comparisons unreliable.
   */
  approveProspect: (id: string) => Promise<{ email: string } | null>;
  ensureDraft: (id: string) => Promise<unknown>;
  send: (
    prospect: OutreachProspect,
    settings: { fromEmail: string; fromName: string },
  ) => Promise<void>;
  /** Hard deadline per draft so a hung AI call bounds the batch. */
  draftDeadlineMs: number;
  /** Throttle between sends for the email provider's rate limits. */
  interSendDelayMs: number;
  /** Called after each prospect is processed (live progress for jobs). */
  onItem?: (result: SelectedSendResult) => void;
}

const defaultSelectedSendDeps: SelectedSendDeps = {
  getSettings: getOutreachSettings,
  prepareDefaults: ensureDefaultTemplates,
  loadProspect: async (id) => {
    const [row] = await db
      .select()
      .from(outreachProspectsTable)
      .where(eq(outreachProspectsTable.id, id))
      .limit(1);
    return row;
  },
  approveProspect: async (id) => {
    const [row] = await db
      .update(outreachProspectsTable)
      .set({
        email: sql`COALESCE(${outreachProspectsTable.email}, ${outreachProspectsTable.contactInfo} ->> 'email')`,
        reviewState: "approved",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(outreachProspectsTable.id, id),
          eq(outreachProspectsTable.status, "pending"),
          sql`COALESCE(${outreachProspectsTable.email}, ${outreachProspectsTable.contactInfo} ->> 'email') IS NOT NULL`,
        ),
      )
      .returning({ email: outreachProspectsTable.email });
    // The WHERE clause guarantees a resolvable email, so a null here means
    // something unexpected — treat it as a lost race (reported, not sent).
    return row?.email ? { email: row.email } : null;
  },
  ensureDraft: ensureProspectDraft,
  send: sendToProspect,
  draftDeadlineMs: 10_000,
  interSendDelayMs: 300,
};

/**
 * Batch "generate & send" for the admin campaigns UI. The admin's selection
 * acts as approval: each selected prospect that is still pending is approved
 * in place (promoting a researched contactInfo email onto the email column
 * when needed), then sent through the exact same claim-first pipeline as the
 * scheduler — draft generated once and persisted, claim before Resend, no
 * duplicates. Prospects that are not pending, have no email, changed under
 * us, or fail the send-time guards are skipped with a per-prospect reason.
 *
 * Timeout budget: drafts warm up in bounded-parallel groups (5) with a hard
 * per-draft deadline, and the send loop's Resend call carries its own fetch
 * deadline — a hung provider bounds the batch instead of hanging the request.
 */
export async function sendToSelectedProspects(
  ids: string[],
  deps: Partial<SelectedSendDeps> = {},
): Promise<{
  sent: number;
  failed: number;
  results: SelectedSendResult[];
}> {
  const d: SelectedSendDeps = { ...defaultSelectedSendDeps, ...deps };
  const settings = await d.getSettings();
  await d.prepareDefaults();

  const uniqueIds = [...new Set(ids)];

  const DRAFT_CONCURRENCY = 5;
  for (let i = 0; i < uniqueIds.length; i += DRAFT_CONCURRENCY) {
    await Promise.allSettled(
      uniqueIds.slice(i, i + DRAFT_CONCURRENCY).map((id) =>
        Promise.race([
          d.ensureDraft(id),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("draft generation timed out")),
              d.draftDeadlineMs,
            ),
          ),
        ]),
      ),
    );
  }

  const results: SelectedSendResult[] = [];
  let sent = 0;
  let failed = 0;
  const record = (r: SelectedSendResult) => {
    results.push(r);
    if (r.ok) sent++;
    else failed++;
    d.onItem?.(r);
  };

  for (const id of uniqueIds) {
    // Throttle between sends (not before the first) for Resend rate limits.
    if (results.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, d.interSendDelayMs));
    }

    // Every per-prospect step is inside the try — one bad row must never
    // abort the rest of the batch or hide the results already collected.
    let name = id;
    try {
      const prospect = await d.loadProspect(id);
      if (!prospect) {
        record({ id, name, ok: false, error: "Prospect not found." });
        continue;
      }
      name = prospect.name;

      if (prospect.status !== "pending") {
        record({
          id,
          name,
          ok: false,
          error: `Status is "${prospect.status}" — only pending prospects can be sent.`,
        });
        continue;
      }

      const email = prospect.email || prospect.contactInfo?.email || null;
      if (!email) {
        record({
          id,
          name,
          ok: false,
          error: "No email on file — research or add one first.",
        });
        continue;
      }

      // Selection = approval — one atomic UPDATE gated on still-pending with
      // a resolvable email; we send to the RETURNING (committed) address, so
      // a concurrent unsubscribe or email edit always wins.
      const approved = await d.approveProspect(id);
      if (!approved) {
        record({
          id,
          name,
          ok: false,
          error:
            "No longer sendable (status or details changed) — skipped to stay safe.",
        });
        continue;
      }

      await d.send(
        { ...prospect, email: approved.email, reviewState: "approved" },
        settings,
      );
      record({ id, name, ok: true });
    } catch (err) {
      logger.error({ err, prospectId: id }, "outreach: selected send failed");
      record({
        id,
        name,
        ok: false,
        error: (err as Error)?.message ?? "Send failed.",
      });
    }
  }

  logger.info({ sent, failed }, "outreach: selected-send batch complete");
  return { sent, failed, results };
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
  // transition lands only if the row is still eligible AND the address is
  // still exactly the one we read (and, for batch sends, approved). An admin
  // editing the email between our read and this claim makes the update match
  // zero rows — we never send to a stale address.
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
        eq(outreachProspectsTable.email, before.email!),
      ),
    )
    .returning({ id: outreachProspectsTable.id });

  if (!claim) {
    // Lost a race against a concurrent state change (status flip,
    // unsubscribe, email edit) between our read and the claim — fail loudly;
    // the caller can retry.
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
