import { and, eq, isNull } from "drizzle-orm";
import { db, usersTable, foundingClaimsTable } from "@workspace/db";

// Both the pool client and a transaction satisfy this shape — helpers accept
// either so webhook effects can run inside a single transaction.
export type DbExecutor = Pick<
  typeof db,
  "select" | "insert" | "update" | "delete"
>;

// Plan ranking so a founding grant (or claim) can never DOWNGRADE a user
// (e.g. a Pioneer who later buys a founding membership keeps Pioneer).
const PLAN_RANK: Record<string, number> = { free: 0, researcher: 1, pioneer: 2 };

export function planRank(plan: string | null | undefined): number {
  return PLAN_RANK[plan ?? "free"] ?? 0;
}

/**
 * Record a founding-member purchase that no account could be matched to.
 * The buyer claims it later by registering or logging in with the same email.
 * Idempotent per Stripe session (unique constraint on stripeSessionId).
 */
export async function recordUnclaimedFoundingPurchase(
  args: {
    email: string;
    planId: string;
    stripeCustomerId: string | null;
    stripeSessionId: string;
  },
  executor: DbExecutor = db,
): Promise<void> {
  await executor
    .insert(foundingClaimsTable)
    .values({
      email: args.email.trim().toLowerCase(),
      planId: args.planId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSessionId: args.stripeSessionId,
    })
    .onConflictDoNothing();
}

/**
 * Apply a founding grant to a user: raises their plan to at least `planId`
 * (never downgrades), flags them as a founding member, and links the Stripe
 * customer when the account doesn't have one yet.
 */
export async function grantFoundingToUser(
  userId: string,
  planId: string,
  stripeCustomerId: string | null,
  executor: DbExecutor = db,
): Promise<void> {
  const [user] = await executor
    .select({ plan: usersTable.plan })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) return;

  const newPlan =
    planRank(planId) > planRank(user.plan) ? planId : user.plan;

  await executor
    .update(usersTable)
    .set({ plan: newPlan, foundingMember: true })
    .where(eq(usersTable.id, userId));

  if (stripeCustomerId) {
    await executor
      .update(usersTable)
      .set({ stripeCustomerId })
      .where(
        and(
          eq(usersTable.id, userId),
          isNull(usersTable.stripeCustomerId),
        ),
      );
  }
}

/**
 * Claim any unclaimed guest founding purchases for this email. Called after
 * register, login, and Google OAuth sign-in. Returns true when a claim was
 * applied. Never throws — a claim hiccup must not break authentication.
 */
export async function claimFoundingMemberships(
  userId: string,
  email: string,
): Promise<boolean> {
  try {
    const normalized = email.trim().toLowerCase();

    return await db.transaction(async (tx) => {
      // Acquire the claims ATOMICALLY: only rows still unclaimed at this
      // moment flip to this user (a concurrent auth attempt for the same
      // email can never claim the same purchase twice). The conditional
      // UPDATE … RETURNING is the ownership acquisition.
      const claims = await tx
        .update(foundingClaimsTable)
        .set({ claimedAt: new Date(), claimedByUserId: userId })
        .where(
          and(
            eq(foundingClaimsTable.email, normalized),
            isNull(foundingClaimsTable.claimedAt),
          ),
        )
        .returning();

      if (claims.length === 0) return false;

      // Grant the HIGHEST-ranked plan across all claimed purchases (a buyer
      // could in theory have more than one).
      const best = claims.reduce((a, c) =>
        planRank(c.planId) > planRank(a.planId) ? c : a,
      );
      const anyCustomerId =
        best.stripeCustomerId ??
        claims.find((c) => c.stripeCustomerId)?.stripeCustomerId ??
        null;
      await grantFoundingToUser(userId, best.planId, anyCustomerId, tx);

      return true;
    });
  } catch {
    return false;
  }
}
