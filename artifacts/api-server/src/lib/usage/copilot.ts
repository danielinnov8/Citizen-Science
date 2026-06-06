import { sql } from "drizzle-orm";
import { db, copilotUsageTable } from "@workspace/db";

// Free (Explorer) accounts and anonymous guests may ask this many copilot
// questions per UTC day. Paid plans are unlimited. ~10 per the pricing page.
export const COPILOT_FREE_DAILY_LIMIT = 10;

// A plan is unlimited when it is anything other than the metered "free" tier.
export function isUnlimitedPlan(plan: string | null | undefined): boolean {
  return !!plan && plan !== "free";
}

// Today's date as a UTC YYYY-MM-DD string, used as the per-day bucket key so
// the quota resets at midnight UTC without any scheduled job.
export function currentUsageDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Atomically record one copilot question for `subjectKey` on the given UTC day
 * and return the resulting count. Race-safe via an upsert that increments in a
 * single statement, so concurrent requests can never double-spend the quota.
 */
export async function recordCopilotUsage(
  subjectKey: string,
  usageDate: string = currentUsageDate(),
): Promise<number> {
  const [row] = await db
    .insert(copilotUsageTable)
    .values({ subjectKey, usageDate, count: 1 })
    .onConflictDoUpdate({
      target: [copilotUsageTable.subjectKey, copilotUsageTable.usageDate],
      set: {
        count: sql`${copilotUsageTable.count} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ count: copilotUsageTable.count });

  return row?.count ?? 0;
}
