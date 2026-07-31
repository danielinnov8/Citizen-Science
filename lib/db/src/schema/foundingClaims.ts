import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Founding-member purchases made by GUESTS (no account at checkout time).
 * Stripe collects the buyer's email during checkout; the webhook records the
 * purchase here when no user matches. The next time someone registers or logs
 * in with that email, the claim is applied (lifetime plan + founding badge)
 * and marked claimed. See claimFoundingMemberships in the api-server.
 */
export const foundingClaimsTable = pgTable("founding_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Buyer's email as collected by Stripe checkout (lowercased).
  email: text("email").notNull(),
  // The lifetime plan granted by the purchase (e.g. "researcher").
  planId: text("plan_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  // Unique so a duplicate webhook delivery can't double-insert.
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  claimedByUserId: uuid("claimed_by_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FoundingClaim = typeof foundingClaimsTable.$inferSelect;
