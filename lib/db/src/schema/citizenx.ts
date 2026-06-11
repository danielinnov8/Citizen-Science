import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// CitizenX — the community/program layer atop Citizen Science. Three core
// entities, all attributed to a user (the organizer/host/author) and exposed via
// public, shareable slugs. Statuses gate what is publicly listed: chapters and
// applications start "pending" review and become "active"; events are "upcoming"
// once created; experiments are "published" when authored. No moderation console
// ships here — status transitions are out of scope for this milestone, so newly
// created chapters surface in the organizer's own "my applications" view as
// pending while events/experiments are immediately public.

// A local CitizenX chapter. Created via the "apply to organize" flow, so a fresh
// row is "pending" review. `organizerName` is a denormalized display snapshot so
// public/owner listings never need to join the users table.
export const citizenxChaptersTable = pgTable("citizenx_chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  organizerName: text("organizer_name").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  focus: text("focus").notNull(),
  description: text("description").notNull(),
  status: text("status").$type<"pending" | "active">().notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A CitizenX event hosted by a member. Optionally tied to a chapter. Public as
// soon as it is created ("upcoming"); listed and individually shareable by slug.
export const citizenxEventsTable = pgTable("citizenx_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  organizerName: text("organizer_name").notNull(),
  chapterId: uuid("chapter_id"),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  status: text("status").$type<"upcoming">().notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// One authored step of a published experiment.
export interface CitizenxExperimentStep {
  title: string;
  body: string;
}

// A member-published experiment. Carries the author's self-branding
// (`authorName` + `authorTagline`) so each published page reads as the author's
// own work. Public + shareable by slug as soon as it is published.
export const citizenxExperimentsTable = pgTable("citizenx_experiments", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorTagline: text("author_tagline"),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  coverImageUrl: text("cover_image_url"),
  categorySlug: text("category_slug").notNull(),
  steps: jsonb("steps")
    .$type<CitizenxExperimentStep[]>()
    .notNull()
    .default([]),
  status: text("status").$type<"published">().notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CitizenxChapter = typeof citizenxChaptersTable.$inferSelect;
export type InsertCitizenxChapter = typeof citizenxChaptersTable.$inferInsert;
export type CitizenxEvent = typeof citizenxEventsTable.$inferSelect;
export type InsertCitizenxEvent = typeof citizenxEventsTable.$inferInsert;
export type CitizenxExperiment = typeof citizenxExperimentsTable.$inferSelect;
export type InsertCitizenxExperiment =
  typeof citizenxExperimentsTable.$inferInsert;
