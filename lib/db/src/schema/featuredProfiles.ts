import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export interface ProfileSource {
  title: string;
  url: string;
}

// A patent attributed to a profile, linking to its verified public record
// (e.g. Google Patents). `number` is the human-readable patent number and
// `url` points to the authoritative source so claims stay verifiable.
export interface ProfilePatent {
  title: string;
  number: string;
  year?: string;
  url: string;
}

// Discriminates the kind of figure a profile represents so the directory can
// filter by it. Task #14 seeded mixed scientists/inventors; this dimension was
// added in Task #18 alongside ~300 living figures (defaults to "scientist" so
// pre-existing rows stay valid).
export type ProfileGroup =
  | "scientist"
  | "inventor"
  | "thought_leader"
  | "organization";

// A single Nobel Prize won by a profile. A laureate may win more than once
// (e.g. Marie Curie, Linus Pauling, John Bardeen), so this is stored as an
// array. `categoryCode` is the Nobel API short code (phy/che/med/lit/pea/eco)
// and `portion` is the share of the prize (e.g. "1", "1/2", "1/3"). Sourced
// from the public Nobel Prize API (api.nobelprize.org v2.1, CC0 data).
export interface ProfileNobelPrize {
  category: string;
  categoryCode: string;
  awardYear: string;
  motivation: string;
  portion: string;
}

// ---- Cinematic "story" fields (Task #44) ----
// Rich, long-form content that powers the cinematic `/directory/:slug` layout
// for deceased historical figures. These columns are OPTIONAL: a profile is
// only rendered with the cinematic layout once `biography` is populated, so
// living/lightly-seeded rows keep the standard profile layout. All of this is
// decoupled from the hand-authored frontend module (`greatMinds.ts`) — the page
// reads beautifully whether the content comes from the DB or from code.

// A single dated moment in a figure's life, shown on the story timeline.
export interface ProfileTimelineEntry {
  year: string;
  title: string;
  detail: string;
}

// A titled contribution card. Distinct from the flat `contributions` string[]
// (used by the standard layout); the cinematic layout renders title + detail.
export interface ProfileStoryContribution {
  title: string;
  detail: string;
}

// Per-person visual theme. Mirrors the frontend `StoryTheme` shape. When null,
// the frontend derives a sensible default from the figure's `field`, so storing
// a theme here is purely an optional override.
export interface ProfileStoryTheme {
  accent: string;
  accentSoft: string;
  accentDeep: string;
  heroFrom: string;
  heroTo: string;
  motif: string;
  heroVariant?: string;
}

export const featuredProfilesTable = pgTable("featured_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  group: text("group").$type<ProfileGroup>().notNull().default("scientist"),
  field: text("field").notNull(),
  era: text("era").notNull(),
  summary: text("summary").notNull(),
  contributions: jsonb("contributions")
    .$type<string[]>()
    .notNull()
    .default([]),
  quotes: jsonb("quotes").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  relatedCategorySlugs: jsonb("related_category_slugs")
    .$type<string[]>()
    .notNull()
    .default([]),
  sources: jsonb("sources").$type<ProfileSource[]>().notNull().default([]),
  patents: jsonb("patents").$type<ProfilePatent[]>().notNull().default([]),
  // Nobel Prize record (Task #101). Empty for non-laureates; supports multiple
  // wins. Populated by the Nobel import seeder from the public Nobel Prize API.
  nobelPrizes: jsonb("nobel_prizes")
    .$type<ProfileNobelPrize[]>()
    .notNull()
    .default([]),
  // ---- Cinematic story fields (Task #44) — optional, default-empty ----
  tagline: text("tagline"),
  lifespan: text("lifespan"),
  birthplace: text("birthplace"),
  biography: jsonb("biography").$type<string[]>().notNull().default([]),
  timeline: jsonb("timeline")
    .$type<ProfileTimelineEntry[]>()
    .notNull()
    .default([]),
  storyContributions: jsonb("story_contributions")
    .$type<ProfileStoryContribution[]>()
    .notNull()
    .default([]),
  legacy: jsonb("legacy").$type<string[]>().notNull().default([]),
  didYouKnow: jsonb("did_you_know").$type<string[]>().notNull().default([]),
  storyTheme: jsonb("story_theme").$type<ProfileStoryTheme | null>(),
  // The approved owner of this profile (Task #92). Set when a superadmin
  // approves a user's claim; a "Verified" badge and edit rights are derived
  // from it (verified === ownerUserId !== null). Null for unclaimed profiles.
  ownerUserId: uuid("owner_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FeaturedProfile = typeof featuredProfilesTable.$inferSelect;
export type InsertFeaturedProfile = typeof featuredProfilesTable.$inferInsert;
