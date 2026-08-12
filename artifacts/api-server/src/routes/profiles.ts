import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  challengeSolutionsTable,
  challengeSolutionVotesTable,
  challengesTable,
  featuredProfilesTable,
  profileClaimsTable,
  type FeaturedProfile,
  type ProfileClaim,
  type User,
} from "@workspace/db";
import {
  ListFeaturedProfilesResponse,
  GetFeaturedProfileResponse,
  GetMyProfileClaimResponse,
  ListProfileSolutionsResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { isLivingProfile } from "../lib/profiles/eligibility";

const router: IRouter = Router();

// Attaches the derived `verified` flag (owner present) and strips the raw
// `ownerUserId` so a user id never leaks in the public profile payload.
function toProfileResponse(profile: FeaturedProfile) {
  const { ownerUserId, ...rest } = profile;
  return { ...rest, verified: ownerUserId !== null };
}

function toClaimState(claim: ProfileClaim) {
  return {
    id: claim.id,
    status: claim.status,
    email: claim.email,
    createdAt: claim.createdAt.toISOString(),
    reviewedAt: claim.reviewedAt ? claim.reviewedAt.toISOString() : null,
  };
}

router.get(
  "/profiles",
  async (_req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select({
        id: featuredProfilesTable.id,
        slug: featuredProfilesTable.slug,
        name: featuredProfilesTable.name,
        group: featuredProfilesTable.group,
        field: featuredProfilesTable.field,
        era: featuredProfilesTable.era,
        imageUrl: featuredProfilesTable.imageUrl,
        nobelPrizes: featuredProfilesTable.nobelPrizes,
      })
      .from(featuredProfilesTable)
      .orderBy(asc(featuredProfilesTable.name));

    res.json(ListFeaturedProfilesResponse.parse(rows));
  },
);

router.get(
  "/profiles/:slug",
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);

    const [profile] = await db
      .select()
      .from(featuredProfilesTable)
      .where(eq(featuredProfilesTable.slug, slug));

    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    res.json(GetFeaturedProfileResponse.parse(toProfileResponse(profile)));
  },
);

// The current user's claim relationship to a profile: whether it can be claimed
// at all (living innovator), whether they already own it, and the state of their
// own claim, if any.
router.get(
  "/profiles/:slug/claim",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const user = req.user as User;

    const [profile] = await db
      .select()
      .from(featuredProfilesTable)
      .where(eq(featuredProfilesTable.slug, slug));

    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    const [claim] = await db
      .select()
      .from(profileClaimsTable)
      .where(
        and(
          eq(profileClaimsTable.profileId, profile.id),
          eq(profileClaimsTable.userId, user.id),
        ),
      );

    res.json(
      GetMyProfileClaimResponse.parse({
        claimable: isLivingProfile(profile.era, profile.lifespan),
        isOwner: profile.ownerUserId === user.id,
        email: user.email,
        claim: claim ? toClaimState(claim) : null,
      }),
    );
  },
);

// Submit a claim for a profile using the caller's own account email. Rejected
// when the profile is not a living innovator, is already owned, or the caller
// already has a pending/approved claim.
router.post(
  "/profiles/:slug/claim",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const user = req.user as User;

    const [profile] = await db
      .select()
      .from(featuredProfilesTable)
      .where(eq(featuredProfilesTable.slug, slug));

    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    if (!isLivingProfile(profile.era, profile.lifespan)) {
      res.status(400).json({
        error: "Only living innovators' profiles can be claimed.",
      });
      return;
    }

    if (profile.ownerUserId) {
      if (profile.ownerUserId === user.id) {
        res.status(409).json({ error: "You already own this profile." });
      } else {
        res.status(409).json({ error: "This profile is already claimed." });
      }
      return;
    }

    const [existing] = await db
      .select()
      .from(profileClaimsTable)
      .where(
        and(
          eq(profileClaimsTable.profileId, profile.id),
          eq(profileClaimsTable.userId, user.id),
        ),
      );

    let claim: ProfileClaim;
    if (existing) {
      if (existing.status === "pending" || existing.status === "approved") {
        res.status(409).json({
          error:
            existing.status === "pending"
              ? "You already have a pending claim for this profile."
              : "You already own this profile.",
        });
        return;
      }
      // A previously denied claim can be re-submitted: reset it to pending.
      const [updated] = await db
        .update(profileClaimsTable)
        .set({
          status: "pending",
          email: user.email,
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(profileClaimsTable.id, existing.id))
        .returning();
      claim = updated;
    } else {
      const [created] = await db
        .insert(profileClaimsTable)
        .values({
          profileId: profile.id,
          userId: user.id,
          email: user.email,
          status: "pending",
        })
        .returning();
      claim = created;
    }

    res.status(201).json(
      GetMyProfileClaimResponse.parse({
        claimable: true,
        isOwner: false,
        email: user.email,
        claim: toClaimState(claim),
      }),
    );
  },
);

// Owner-only edit of a profile's content. Ownership is enforced server-side:
// the caller must be the profile's approved owner (ownerUserId).
router.patch(
  "/profiles/:slug",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const user = req.user as User;

    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [profile] = await db
      .select()
      .from(featuredProfilesTable)
      .where(eq(featuredProfilesTable.slug, slug));

    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    if (!profile.ownerUserId || profile.ownerUserId !== user.id) {
      res.status(403).json({ error: "You do not own this profile." });
      return;
    }

    // Only copy fields that were actually provided so a partial edit never
    // clobbers untouched columns.
    const data = parsed.data;
    const updates: Partial<typeof featuredProfilesTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (data.summary !== undefined) updates.summary = data.summary;
    if (data.tagline !== undefined) updates.tagline = data.tagline;
    if (data.field !== undefined) updates.field = data.field;
    if (data.era !== undefined) updates.era = data.era;
    if (data.birthplace !== undefined) updates.birthplace = data.birthplace;
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
    if (data.biography !== undefined) updates.biography = data.biography;
    if (data.contributions !== undefined)
      updates.contributions = data.contributions;
    if (data.quotes !== undefined) updates.quotes = data.quotes;
    if (data.storyContributions !== undefined)
      updates.storyContributions = data.storyContributions;
    if (data.timeline !== undefined) updates.timeline = data.timeline;
    if (data.legacy !== undefined) updates.legacy = data.legacy;
    if (data.didYouKnow !== undefined) updates.didYouKnow = data.didYouKnow;

    const [updated] = await db
      .update(featuredProfilesTable)
      .set(updates)
      .where(eq(featuredProfilesTable.id, profile.id))
      .returning();

    res.json(UpdateMyProfileResponse.parse(toProfileResponse(updated)));
  },
);

// ─── GET /api/profiles/:slug/solutions ──────────────────────────────────────
// Public. Returns all challenge solutions where author_slug = :slug, joined
// with the parent challenge for display context.

router.get(
  "/profiles/:slug/solutions",
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);

    const rows = await db
      .select({
        id: challengeSolutionsTable.id,
        title: challengeSolutionsTable.title,
        description: challengeSolutionsTable.description,
        approach: challengeSolutionsTable.approach,
        link: challengeSolutionsTable.link,
        createdAt: challengeSolutionsTable.createdAt,
        challengeSlug: challengesTable.slug,
        challengeTitle: challengesTable.title,
        challengeDomain: challengesTable.domain,
        challengeUrgency: challengesTable.urgency,
        voteScore: sql<number>`COALESCE(SUM(${challengeSolutionVotesTable.direction}), 0)`,
      })
      .from(challengeSolutionsTable)
      .innerJoin(
        challengesTable,
        eq(challengeSolutionsTable.challengeSlug, challengesTable.slug),
      )
      .leftJoin(
        challengeSolutionVotesTable,
        eq(challengeSolutionVotesTable.solutionId, challengeSolutionsTable.id),
      )
      .where(eq(challengeSolutionsTable.authorSlug, slug))
      .groupBy(
        challengeSolutionsTable.id,
        challengesTable.slug,
        challengesTable.title,
        challengesTable.domain,
        challengesTable.urgency,
      )
      .orderBy(challengeSolutionsTable.createdAt);

    res.json(
      ListProfileSolutionsResponse.parse(
        rows.map((r) => ({
          ...r,
          link: r.link ?? null,
          createdAt: r.createdAt.toISOString(),
          voteScore: Number(r.voteScore ?? 0),
        })),
      ),
    );
  },
);

export default router;
