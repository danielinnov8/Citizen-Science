import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// A mentor's public-facing profile. One row per mentor (a user the superadmin
// flagged via `users.is_mentor`). Created/edited by the mentor themselves.
export const mentorProfilesTable = pgTable("mentor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  headline: text("headline").notNull().default(""),
  bio: text("bio").notNull().default(""),
  // Areas of expertise shown as tags on the mentor's card and page.
  expertise: jsonb("expertise").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A mentoring course offered by a mentor. Members enroll as mentees by paying
// credits (pay-what-you-want, at least `minCredits`). Only `published` courses
// are visible publicly / enrollable.
export const mentorCoursesTable = pgTable("mentor_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  mentorUserId: uuid("mentor_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // Bullet-point learning outcomes shown on the course detail.
  outcomes: jsonb("outcomes").$type<string[]>().notNull().default([]),
  // Suggested credit price displayed to mentees.
  creditPrice: integer("credit_price").notNull().default(0),
  // Minimum credits a mentee must pay to enroll (the pay-what-you-want floor).
  minCredits: integer("min_credits").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A mentee's enrollment in a course. Records how many credits were paid (moved
// from the mentee to the mentor via the credit ledger). One enrollment per
// (course, mentee) pair.
export const mentorEnrollmentsTable = pgTable(
  "mentor_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => mentorCoursesTable.id, { onDelete: "cascade" }),
    menteeUserId: uuid("mentee_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    creditsPaid: integer("credits_paid").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.courseId, t.menteeUserId)],
);

export type MentorProfile = typeof mentorProfilesTable.$inferSelect;
export type InsertMentorProfile = typeof mentorProfilesTable.$inferInsert;
export type MentorCourse = typeof mentorCoursesTable.$inferSelect;
export type InsertMentorCourse = typeof mentorCoursesTable.$inferInsert;
export type MentorEnrollment = typeof mentorEnrollmentsTable.$inferSelect;
export type InsertMentorEnrollment = typeof mentorEnrollmentsTable.$inferInsert;
