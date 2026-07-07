import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Structured record of a member's story-driven onboarding (Task #160). One row
// per user. Captures both directly-chosen answers (quick-reply chips in the
// static fallback) and AI-extracted structure from the free-form agentic
// interview, plus the raw transcript for future re-analysis.
export const onboardingResponsesTable = pgTable(
  "onboarding_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // "member" (regular sign-up) or "claimant" (arrived by claiming their own
    // living-innovator profile).
    path: text("path").notNull().default("member"),
    // The featured-profile slug the claimant was claiming, when applicable.
    claimProfileSlug: text("claim_profile_slug"),
    // Structured fields — chosen directly or AI-extracted from the interview.
    role: text("role"),
    interests: text("interests").array().notNull().default([]),
    primaryGoal: text("primary_goal"),
    ambition: text("ambition"),
    // AI-extracted free-text insights (short bullet observations about the
    // member: motivations, background, what they want from the community).
    insights: text("insights").array().notNull().default([]),
    // One-sentence AI summary of who this member is and what they're here for.
    summary: text("summary"),
    // The raw interview transcript ("guide:"/"member:"-prefixed lines) so the
    // conversation itself is never lost.
    transcript: text("transcript"),
    // How the record was produced: "agentic" (AI interview), "fallback"
    // (static question path), or "legacy" (backfilled from the old wizard's
    // localStorage flag).
    source: text("source").notNull().default("agentic"),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("onboarding_responses_user_id_unique").on(table.userId)],
);

export type OnboardingResponse = typeof onboardingResponsesTable.$inferSelect;
export type InsertOnboardingResponse =
  typeof onboardingResponsesTable.$inferInsert;
