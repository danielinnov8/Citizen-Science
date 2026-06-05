import { asc } from "drizzle-orm";
import { db, featuredProfilesTable } from "@workspace/db";

// A lightweight directory entry the copilot uses to recommend a specialist.
// Deliberately compact (no summary/quotes) so it can be injected into the
// system prompt without bloating the token budget.
export interface ScientistSummary {
  slug: string;
  name: string;
  field: string;
  era: string;
}

const TTL_MS = 5 * 60 * 1000;

let cache: { data: ScientistSummary[]; expires: number } | null = null;

// Fetch the compact directory of featured scientists/inventors for the chat
// route, cached in-process for a few minutes so a busy conversation doesn't
// re-query the DB on every message. Never throws — on failure it serves the
// last good cache (or an empty list), so the copilot degrades to no scientist
// recommendations rather than breaking the reply.
export async function getScientistDirectory(): Promise<ScientistSummary[]> {
  const now = Date.now();
  if (cache && cache.expires > now) {
    return cache.data;
  }

  try {
    const rows = await db
      .select({
        slug: featuredProfilesTable.slug,
        name: featuredProfilesTable.name,
        field: featuredProfilesTable.field,
        era: featuredProfilesTable.era,
      })
      .from(featuredProfilesTable)
      .orderBy(asc(featuredProfilesTable.name));

    cache = { data: rows, expires: now + TTL_MS };
    return rows;
  } catch {
    return cache?.data ?? [];
  }
}
