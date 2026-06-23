import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  smallint,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const challengesTable = pgTable("challenges", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  urgency: text("urgency").notNull(),
  summary: text("summary").notNull(),
  whyItMatters: text("why_it_matters").notNull(),
  teamsJson: text("teams_json").notNull().default("[]"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const challengeMembersTable = pgTable(
  "challenge_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeSlug: text("challenge_slug")
      .notNull()
      .references(() => challengesTable.slug, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.challengeSlug, t.userId)],
);

export const challengeSolutionsTable = pgTable("challenge_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeSlug: text("challenge_slug")
    .notNull()
    .references(() => challengesTable.slug, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name"),
  authorSlug: text("author_slug"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  approach: text("approach").notNull(),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const challengeSolutionVotesTable = pgTable(
  "challenge_solution_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    solutionId: uuid("solution_id")
      .notNull()
      .references(() => challengeSolutionsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    direction: smallint("direction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.solutionId, t.userId),
    check("direction_valid", sql`${t.direction} IN (1, -1)`),
  ],
);

export type Challenge = typeof challengesTable.$inferSelect;
export type InsertChallenge = typeof challengesTable.$inferInsert;
export type ChallengeMember = typeof challengeMembersTable.$inferSelect;
export type InsertChallengeMember = typeof challengeMembersTable.$inferInsert;
export type ChallengeSolution = typeof challengeSolutionsTable.$inferSelect;
export type InsertChallengeSolution = typeof challengeSolutionsTable.$inferInsert;
export type ChallengeSolutionVote = typeof challengeSolutionVotesTable.$inferSelect;
export type InsertChallengeSolutionVote = typeof challengeSolutionVotesTable.$inferInsert;
