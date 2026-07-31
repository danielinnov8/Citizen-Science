import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  image: text("image"),
  // Subscription tier. "free" (Explorer) is metered; any other value is treated
  // as an unlimited/paid plan. Defaults to "free" for every new account.
  plan: text("plan").notNull().default("free"),
  // Lifetime founding member (one-time $2,500 purchase). Set by the Stripe
  // webhook or when a guest purchase is claimed on sign-up/sign-in.
  foundingMember: boolean("founding_member").notNull().default(false),
  // Whether a superadmin has flagged this account as a mentor. Mentors can set
  // up a mentor profile and publish mentoring courses others enroll in. Set by
  // the admin portal only (Task #83 mentorship marketplace).
  isMentor: boolean("is_mentor").notNull().default(false),
  // Stripe billing identifiers. Populated when the user first initiates a
  // checkout session (customer) or completes a subscription (subscription).
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // When the user completed the story-driven onboarding (Task #160). Null =
  // not yet onboarded. Server-side source of truth; the old localStorage flag
  // is only a compat fallback that gets backfilled here.
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
