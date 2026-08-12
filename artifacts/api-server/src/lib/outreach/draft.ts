import { and, eq, isNull, or } from "drizzle-orm";
import { db, outreachProspectsTable, outreachTemplatesTable } from "@workspace/db";
import {
  personaliseEmail,
  buildPlainBody,
  normalizeField,
  FALLBACK_FIELD,
} from "./personalise";
import { ensureDefaultTemplates } from "./templates";
import { resolveProfileBlurb } from "./profileBlurb";
import { getOutreachSettings } from "./settings";
import { logger } from "../logger";

export interface ProspectDraft {
  subject: string;
  body: string;
}

/**
 * Return the prospect's ready-to-send email copy, generating AND storing it on
 * first use. The moment a prospect enters the send flow (approval, preview, or
 * an actual send) its personalised draft is persisted on the row, so the email
 * is queued ready to send — and what the admin reviews in the editor is
 * exactly what goes out. Sends never regenerate behind the admin's back.
 *
 * Concurrency contract: the row is always read fresh, generation is claimed
 * with a conditional UPDATE (lands only while no complete draft exists), and
 * the PERSISTED draft is returned — never a locally generated pair — so
 * concurrent preview/approve/send calls converge on a single winner. Throws a
 * retryable error if the draft can't be stored (concurrent edit mid-flight).
 */
export async function ensureProspectDraft(
  prospectId: string,
): Promise<ProspectDraft> {
  const [prospect] = await db
    .select()
    .from(outreachProspectsTable)
    .where(eq(outreachProspectsTable.id, prospectId))
    .limit(1);

  if (!prospect) {
    throw new Error("prospect no longer exists");
  }
  if (prospect.draftSubject && prospect.draftBody) {
    return { subject: prospect.draftSubject, body: prospect.draftBody };
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

  // Subject is deterministic: the admin-editable institutional template with
  // the prospect's name substituted. AI writes only the field phrase.
  const [settings, { field }, profileBlurb] = await Promise.all([
    getOutreachSettings(),
    personaliseEmail({
      name: prospect.name,
      type: prospect.type,
      notes: prospect.notes,
    }),
    resolveProfileBlurb(prospect.profileId),
  ]);
  const subject = template.subjectTemplate.replace(
    /\{\{name\}\}/g,
    prospect.name,
  );
  // Trusted-data fallback: when AI can't name their work, use the directory
  // profile's vetted field before the generic "your field" — the brief
  // requires every invitation to reference the recipient's real contribution.
  const resolvedField =
    field === FALLBACK_FIELD && profileBlurb?.field
      ? normalizeField(profileBlurb.field)
      : field;
  const body = buildPlainBody(
    resolvedField,
    { name: prospect.name },
    profileBlurb,
    settings.fromEmail,
  );

  // Claim the draft slots atomically: the update only lands while the row
  // still lacks a complete draft. A concurrent generate (or an admin edit)
  // that gets there first makes our update a no-op — exactly one persisted
  // winner. (READ COMMITTED re-checks the WHERE after waiting on the row
  // lock, so a blocked write can't overwrite a draft that appeared meanwhile.)
  await db
    .update(outreachProspectsTable)
    .set({ draftSubject: subject, draftBody: body, updatedAt: new Date() })
    .where(
      and(
        eq(outreachProspectsTable.id, prospectId),
        or(
          isNull(outreachProspectsTable.draftSubject),
          isNull(outreachProspectsTable.draftBody),
        ),
      ),
    );

  // Return the PERSISTED draft — ours if we won the claim, the other writer's
  // otherwise — never the locally generated pair, so preview and send can
  // never diverge under concurrency.
  const [stored] = await db
    .select({
      draftSubject: outreachProspectsTable.draftSubject,
      draftBody: outreachProspectsTable.draftBody,
    })
    .from(outreachProspectsTable)
    .where(eq(outreachProspectsTable.id, prospectId))
    .limit(1);

  if (!stored?.draftSubject || !stored?.draftBody) {
    // Prospect deleted mid-flight, or a concurrent edit/clear landed between
    // our claim and this read. Refuse rather than use unpersisted copy.
    throw new Error(
      "draft could not be stored — the prospect was edited concurrently; retry",
    );
  }

  logger.info({ prospectId }, "outreach: draft generated & queued");
  return { subject: stored.draftSubject, body: stored.draftBody };
}
