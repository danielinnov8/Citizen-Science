import { db, outreachProspectsTable } from "@workspace/db";
import { logger } from "../logger";

type ProspectType = NonNullable<
  (typeof outreachProspectsTable.$inferInsert)["type"]
>;

/**
 * Seeds real outreach prospects (people we want to contact) into the
 * `outreach_prospects` table so they appear in the Admin → Outreach list on
 * every environment, including production. Emails are real, supplied contacts.
 *
 * Idempotent: the `email` column is unique, so `onConflictDoNothing` makes this
 * safe to run on every boot and it never overwrites edits made later in the
 * admin UI. Failures are logged, never thrown into the boot sequence.
 *
 * Note: being a prospect does not by itself send anything — the outreach
 * scheduler only emails pending prospects when Resend is configured, at the
 * configured send hour, and when a template exists for the prospect's type.
 */
interface SeedProspect {
  name: string;
  email: string;
  type: ProspectType;
  notes: string;
}

const SEED_PROSPECTS: SeedProspect[] = [
  {
    name: "Manu Rehani",
    email: "manu@tabulalingua.com",
    type: "scientist",
    notes:
      "Featured directory figure (manu-rehani) — Austin-based inventor, engineer, and advisor in behavioral intelligence & dual-use technology.",
  },
];

export async function seedOutreachProspects(): Promise<void> {
  try {
    const result = await db
      .insert(outreachProspectsTable)
      .values(
        SEED_PROSPECTS.map((p) => ({
          name: p.name,
          email: p.email.toLowerCase(),
          type: p.type,
          notes: p.notes,
          updatedAt: new Date(),
        })),
      )
      .onConflictDoNothing({ target: outreachProspectsTable.email })
      .returning({ id: outreachProspectsTable.id });

    if (result.length === 0) {
      logger.info("Outreach prospects already seeded, skipping");
      return;
    }
    logger.info({ inserted: result.length }, "Seeded outreach prospects");
  } catch (err) {
    logger.error({ err }, "Failed to seed outreach prospects");
  }
}
