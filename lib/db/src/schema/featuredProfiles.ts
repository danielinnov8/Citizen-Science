import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface ProfileSource {
  title: string;
  url: string;
}

// Discriminates the kind of figure a profile represents so the directory can
// filter by it. Task #14 seeded mixed scientists/inventors; this dimension was
// added in Task #18 alongside ~300 living figures (defaults to "scientist" so
// pre-existing rows stay valid).
export type ProfileGroup = "scientist" | "inventor" | "thought_leader";

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FeaturedProfile = typeof featuredProfilesTable.$inferSelect;
export type InsertFeaturedProfile = typeof featuredProfilesTable.$inferInsert;
