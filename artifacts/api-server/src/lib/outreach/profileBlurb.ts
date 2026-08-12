import { eq } from "drizzle-orm";
import { db, featuredProfilesTable } from "@workspace/db";
import { isProfileClaimable } from "../profiles/living";
import type { ProfileBlurb } from "./personalise";

/**
 * Resolve the directory profile linked to an outreach prospect (if any) into
 * the blurb the email builders use to append the profile P.S. block. Returns
 * undefined when the prospect isn't linked to a profile (e.g. manually added
 * investor leads) or the profile row is gone.
 */
export async function resolveProfileBlurb(
  profileId: string | null | undefined,
): Promise<ProfileBlurb | undefined> {
  if (!profileId) return undefined;
  const [profile] = await db
    .select({
      slug: featuredProfilesTable.slug,
      era: featuredProfilesTable.era,
      lifespan: featuredProfilesTable.lifespan,
    })
    .from(featuredProfilesTable)
    .where(eq(featuredProfilesTable.id, profileId))
    .limit(1);
  if (!profile) return undefined;
  return {
    slug: profile.slug,
    claimable: isProfileClaimable(profile.era, profile.lifespan),
  };
}
