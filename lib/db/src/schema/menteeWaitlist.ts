import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// A member's request to be mentored by a "living legend" directory figure. The
// figure is identified by its directory slug (figures are not real user rows, so
// this can't be a FK). Joining the waitlist surfaces aspiring-mentee demand to
// the figure (and to the verified owner of that profile, if claimed). One row
// per (figure, member) pair.
export const menteeWaitlistTable = pgTable(
  "mentee_waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    figureSlug: text("figure_slug").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.figureSlug, t.userId)],
);

export type MenteeWaitlistEntry = typeof menteeWaitlistTable.$inferSelect;
export type InsertMenteeWaitlistEntry = typeof menteeWaitlistTable.$inferInsert;
