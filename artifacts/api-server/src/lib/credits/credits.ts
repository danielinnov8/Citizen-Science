import { eq, sql } from "drizzle-orm";
import { db, creditAccountsTable } from "@workspace/db";

// Current UTC "YYYY-MM" bucket. Used as the monthly grant key so the grant
// resets at the start of each month with no scheduled job.
export function currentPeriodKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

// First instant of next UTC month — when the monthly grant renews.
export function nextRenewalDate(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
}

export interface CreditState {
  monthlyGrant: number;
  monthlyRemaining: number;
  topupBalance: number;
  totalRemaining: number;
}

// Read the current credit state for a subject without mutating it. A stored
// period that doesn't match the current month is treated as a fresh grant
// (lazy reset), so callers see the correct remaining balance.
export async function getCreditState(
  subjectKey: string,
  monthlyGrant: number,
): Promise<CreditState> {
  const period = currentPeriodKey();
  const [row] = await db
    .select()
    .from(creditAccountsTable)
    .where(eq(creditAccountsTable.subjectKey, subjectKey));

  const periodUsed = row && row.periodKey === period ? row.periodUsed : 0;
  const topupBalance = row?.topupBalance ?? 0;
  const monthlyRemaining = Math.max(0, monthlyGrant - periodUsed);

  return {
    monthlyGrant,
    monthlyRemaining,
    topupBalance,
    totalRemaining: monthlyRemaining + topupBalance,
  };
}

// True when the subject has at least one credit available right now. Used as a
// pre-flight gate before doing expensive AI work.
export async function hasCreditsAvailable(
  subjectKey: string,
  monthlyGrant: number,
): Promise<boolean> {
  const state = await getCreditState(subjectKey, monthlyGrant);
  return state.totalRemaining > 0;
}

/**
 * Deduct `cost` credits from a subject, draining the monthly grant first and
 * the non-expiring top-up balance only once the grant is exhausted. Race-safe:
 * the read-modify-write runs inside a transaction with a row lock so concurrent
 * requests can't double-spend. Never lets the balance go negative (a request
 * can slightly overshoot a near-empty balance; the next pre-flight check then
 * blocks). Returns the post-deduction state.
 */
export async function consumeCredits(
  subjectKey: string,
  monthlyGrant: number,
  cost: number,
): Promise<CreditState> {
  if (cost <= 0) {
    return getCreditState(subjectKey, monthlyGrant);
  }

  const period = currentPeriodKey();

  return db.transaction(async (tx) => {
    // Ensure a row exists, then lock it for the read-modify-write.
    await tx
      .insert(creditAccountsTable)
      .values({ subjectKey, periodKey: period, periodUsed: 0, topupBalance: 0 })
      .onConflictDoNothing({ target: creditAccountsTable.subjectKey });

    const [row] = await tx
      .select()
      .from(creditAccountsTable)
      .where(eq(creditAccountsTable.subjectKey, subjectKey))
      .for("update");

    // Lazy monthly reset: a stale period means the grant has renewed.
    const periodUsed = row && row.periodKey === period ? row.periodUsed : 0;
    const topupBalance = row?.topupBalance ?? 0;

    const monthlyRemaining = Math.max(0, monthlyGrant - periodUsed);
    const fromMonthly = Math.min(cost, monthlyRemaining);
    const fromTopup = Math.min(topupBalance, cost - fromMonthly);

    const newPeriodUsed = periodUsed + fromMonthly;
    const newTopup = topupBalance - fromTopup;

    await tx
      .update(creditAccountsTable)
      .set({
        periodKey: period,
        periodUsed: newPeriodUsed,
        topupBalance: newTopup,
        updatedAt: new Date(),
      })
      .where(eq(creditAccountsTable.subjectKey, subjectKey));

    const newMonthlyRemaining = Math.max(0, monthlyGrant - newPeriodUsed);
    return {
      monthlyGrant,
      monthlyRemaining: newMonthlyRemaining,
      topupBalance: newTopup,
      totalRemaining: newMonthlyRemaining + newTopup,
    };
  });
}

/**
 * Add non-expiring top-up credits to a subject's balance. (Top-up purchases are
 * placeholders today — no real payment — but the ledger primitive exists so the
 * buy flow can be wired up later.) Atomic single-statement upsert.
 */
export async function addTopupCredits(
  subjectKey: string,
  credits: number,
): Promise<void> {
  if (credits <= 0) return;
  const period = currentPeriodKey();
  await db
    .insert(creditAccountsTable)
    .values({
      subjectKey,
      periodKey: period,
      periodUsed: 0,
      topupBalance: credits,
    })
    .onConflictDoUpdate({
      target: creditAccountsTable.subjectKey,
      set: {
        topupBalance: sql`${creditAccountsTable.topupBalance} + ${credits}`,
        updatedAt: new Date(),
      },
    });
}
