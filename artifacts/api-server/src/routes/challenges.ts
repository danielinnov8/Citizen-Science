import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  challengesTable,
  challengeMembersTable,
  challengeSolutionsTable,
  challengeSolutionVotesTable,
  usersTable,
} from "@workspace/db";
import {
  ListChallengesResponse,
  GetChallengeResponse,
  JoinChallengeResponse,
  ListChallengeSolutionsResponse,
  ListChallengeSolutionsResponseItem,
  CreateChallengeSolutionBody,
  VoteSolutionBody,
  VoteSolutionResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { getUserBySession, SESSION_COOKIE } from "../lib/auth/session";

const router: IRouter = Router();

async function optionalUserId(req: import("express").Request): Promise<string | null> {
  const token = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) return null;
  try {
    const user = await getUserBySession(token);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── GET /api/challenges ─────────────────────────────────────────────────────

router.get("/challenges", async (req, res) => {
  try {
    const userId = await optionalUserId(req);
    const rows = await db.select().from(challengesTable).orderBy(challengesTable.slug);

    // "People working on it" = formal members + distinct solution authors
    // (implicit contributors). Kept consistent with GET /challenges/:slug.
    const memberCounts = await db
      .select({
        challengeSlug: challengeMembersTable.challengeSlug,
        cnt: count(challengeMembersTable.id),
      })
      .from(challengeMembersTable)
      .groupBy(challengeMembersTable.challengeSlug);

    const authorCounts = await db
      .select({
        challengeSlug: challengeSolutionsTable.challengeSlug,
        cnt: sql<number>`COUNT(DISTINCT ${challengeSolutionsTable.authorSlug})`,
      })
      .from(challengeSolutionsTable)
      .where(sql`${challengeSolutionsTable.authorSlug} IS NOT NULL`)
      .groupBy(challengeSolutionsTable.challengeSlug);

    const countMap: Record<string, number> = {};
    for (const { challengeSlug, cnt } of memberCounts) {
      countMap[challengeSlug] = cnt;
    }
    for (const { challengeSlug, cnt } of authorCounts) {
      countMap[challengeSlug] = (countMap[challengeSlug] ?? 0) + Number(cnt);
    }

    let joinedSlugs = new Set<string>();
    if (userId) {
      const joined = await db
        .select({ challengeSlug: challengeMembersTable.challengeSlug })
        .from(challengeMembersTable)
        .where(eq(challengeMembersTable.userId, userId));
      joinedSlugs = new Set(joined.map((j) => j.challengeSlug));
    }

    const result = rows.map((ch) => ({
      slug: ch.slug,
      title: ch.title,
      domain: ch.domain,
      urgency: ch.urgency,
      summary: ch.summary,
      imageUrl: ch.imageUrl ?? null,
      memberCount: countMap[ch.slug] ?? 0,
      isJoined: joinedSlugs.has(ch.slug),
    }));

    res.json(ListChallengesResponse.parse(result));
  } catch (err) {
    req.log.error({ err }, "Failed to list challenges");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/challenges/:slug ───────────────────────────────────────────────

router.get("/challenges/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const userId = await optionalUserId(req);

    const [challenge] = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.slug, slug));

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    // Count formal members + distinct solution authors (implicit contributors).
    const [{ memberCnt }] = await db
      .select({ memberCnt: count(challengeMembersTable.id) })
      .from(challengeMembersTable)
      .where(eq(challengeMembersTable.challengeSlug, slug));

    const [{ solutionAuthorCnt }] = await db
      .select({
        solutionAuthorCnt: sql<number>`COUNT(DISTINCT ${challengeSolutionsTable.authorSlug})`,
      })
      .from(challengeSolutionsTable)
      .where(
        and(
          eq(challengeSolutionsTable.challengeSlug, slug),
          sql`${challengeSolutionsTable.authorSlug} IS NOT NULL`,
        ),
      );

    const cnt = memberCnt + Number(solutionAuthorCnt);

    let isJoined = false;
    if (userId) {
      const [existing] = await db
        .select()
        .from(challengeMembersTable)
        .where(
          and(
            eq(challengeMembersTable.challengeSlug, slug),
            eq(challengeMembersTable.userId, userId),
          ),
        );
      isJoined = !!existing;
    }

    let teams: Array<{ name: string; description: string; url: string }> = [];
    try {
      teams = JSON.parse(challenge.teamsJson) as typeof teams;
    } catch {
      teams = [];
    }

    res.json(
      GetChallengeResponse.parse({
        slug: challenge.slug,
        title: challenge.title,
        domain: challenge.domain,
        urgency: challenge.urgency,
        summary: challenge.summary,
        whyItMatters: challenge.whyItMatters,
        imageUrl: challenge.imageUrl ?? null,
        teams,
        memberCount: cnt,
        isJoined,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get challenge");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/challenges/:slug/join ────────────────────────────────────────

router.post("/challenges/:slug/join", requireAuth, async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const userId = req.user!.id;

    const [challenge] = await db
      .select({ slug: challengesTable.slug })
      .from(challengesTable)
      .where(eq(challengesTable.slug, slug));

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const [existing] = await db
      .select()
      .from(challengeMembersTable)
      .where(
        and(
          eq(challengeMembersTable.challengeSlug, slug),
          eq(challengeMembersTable.userId, userId),
        ),
      );

    let joined: boolean;
    if (existing) {
      await db
        .delete(challengeMembersTable)
        .where(eq(challengeMembersTable.id, existing.id));
      joined = false;
    } else {
      await db
        .insert(challengeMembersTable)
        .values({ challengeSlug: slug, userId })
        .onConflictDoNothing();
      joined = true;
    }

    const [{ cnt }] = await db
      .select({ cnt: count(challengeMembersTable.id) })
      .from(challengeMembersTable)
      .where(eq(challengeMembersTable.challengeSlug, slug));

    res.json(JoinChallengeResponse.parse({ joined, count: cnt }));
  } catch (err) {
    req.log.error({ err }, "Failed to toggle challenge membership");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/challenges/:slug/solutions ────────────────────────────────────

router.get("/challenges/:slug/solutions", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const userId = await optionalUserId(req);

    const [challenge] = await db
      .select({ slug: challengesTable.slug })
      .from(challengesTable)
      .where(eq(challengesTable.slug, slug));

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    // Fetch solutions with vote score aggregated via subquery
    const solutions = await db
      .select({
        id: challengeSolutionsTable.id,
        challengeSlug: challengeSolutionsTable.challengeSlug,
        userId: challengeSolutionsTable.userId,
        authorName: challengeSolutionsTable.authorName,
        authorSlug: challengeSolutionsTable.authorSlug,
        userName: usersTable.name,
        title: challengeSolutionsTable.title,
        description: challengeSolutionsTable.description,
        approach: challengeSolutionsTable.approach,
        link: challengeSolutionsTable.link,
        createdAt: challengeSolutionsTable.createdAt,
        voteScore: sql<number>`coalesce(sum(${challengeSolutionVotesTable.direction}), 0)`,
      })
      .from(challengeSolutionsTable)
      .leftJoin(usersTable, eq(challengeSolutionsTable.userId, usersTable.id))
      .leftJoin(
        challengeSolutionVotesTable,
        eq(challengeSolutionVotesTable.solutionId, challengeSolutionsTable.id),
      )
      .where(eq(challengeSolutionsTable.challengeSlug, slug))
      .groupBy(
        challengeSolutionsTable.id,
        challengeSolutionsTable.challengeSlug,
        challengeSolutionsTable.userId,
        challengeSolutionsTable.authorName,
        challengeSolutionsTable.authorSlug,
        challengeSolutionsTable.title,
        challengeSolutionsTable.description,
        challengeSolutionsTable.approach,
        challengeSolutionsTable.link,
        challengeSolutionsTable.createdAt,
        usersTable.name,
      )
      .orderBy(desc(challengeSolutionsTable.createdAt));

    // Fetch current user's votes for these solutions
    let userVoteMap: Record<string, number> = {};
    if (userId && solutions.length > 0) {
      const solutionIds = solutions.map((s) => s.id);
      const userVotes = await db
        .select({
          solutionId: challengeSolutionVotesTable.solutionId,
          direction: challengeSolutionVotesTable.direction,
        })
        .from(challengeSolutionVotesTable)
        .where(
          and(
            eq(challengeSolutionVotesTable.userId, userId),
            inArray(challengeSolutionVotesTable.solutionId, solutionIds),
          ),
        );
      for (const v of userVotes) {
        userVoteMap[v.solutionId] = v.direction;
      }
    }

    res.json(
      ListChallengeSolutionsResponse.parse(
        solutions.map((s) => ({
          id: s.id,
          challengeSlug: s.challengeSlug,
          userId: s.userId ?? null,
          authorName: s.authorName ?? s.userName ?? "Anonymous",
          authorSlug: s.authorSlug ?? null,
          title: s.title,
          description: s.description,
          approach: s.approach,
          link: s.link ?? null,
          createdAt: s.createdAt.toISOString(),
          voteScore: Number(s.voteScore),
          userVote: userVoteMap[s.id] ?? null,
        })),
      ),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list challenge solutions");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/challenges/:slug/solutions ───────────────────────────────────

router.post("/challenges/:slug/solutions", requireAuth, async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const userId = req.user!.id;

    const bodyResult = CreateChallengeSolutionBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [challenge] = await db
      .select({ slug: challengesTable.slug })
      .from(challengesTable)
      .where(eq(challengesTable.slug, slug));

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const { title, description, approach, link } = bodyResult.data;

    const [inserted] = await db
      .insert(challengeSolutionsTable)
      .values({
        challengeSlug: slug,
        userId,
        title,
        description,
        approach,
        link: link ?? null,
      })
      .returning();

    if (!inserted) {
      res.status(500).json({ error: "Failed to insert solution" });
      return;
    }

    const [userRow] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const authorName = userRow?.name ?? "Anonymous";

    res.status(201).json(
      ListChallengeSolutionsResponseItem.parse({
        id: inserted.id,
        challengeSlug: inserted.challengeSlug,
        userId: inserted.userId ?? null,
        authorName,
        authorSlug: null,
        title: inserted.title,
        description: inserted.description,
        approach: inserted.approach,
        link: inserted.link ?? null,
        createdAt: inserted.createdAt.toISOString(),
        voteScore: 0,
        userVote: null,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to create challenge solution");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/challenges/:slug/solutions/:solutionId ────────────────────────

router.get("/challenges/:slug/solutions/:solutionId", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const solutionId = String(req.params.solutionId);
    const userId = await optionalUserId(req);

    const [row] = await db
      .select({
        id: challengeSolutionsTable.id,
        title: challengeSolutionsTable.title,
        description: challengeSolutionsTable.description,
        approach: challengeSolutionsTable.approach,
        link: challengeSolutionsTable.link,
        createdAt: challengeSolutionsTable.createdAt,
        authorName: challengeSolutionsTable.authorName,
        authorSlug: challengeSolutionsTable.authorSlug,
        userName: usersTable.name,
        voteScore: sql<number>`COALESCE(SUM(${challengeSolutionVotesTable.direction}), 0)`,
        challengeSlug: challengesTable.slug,
        challengeTitle: challengesTable.title,
        challengeSummary: challengesTable.summary,
        challengeWhyItMatters: challengesTable.whyItMatters,
        challengeDomain: challengesTable.domain,
        challengeUrgency: challengesTable.urgency,
        challengeImageUrl: challengesTable.imageUrl,
      })
      .from(challengeSolutionsTable)
      .innerJoin(
        challengesTable,
        eq(challengeSolutionsTable.challengeSlug, challengesTable.slug),
      )
      .leftJoin(usersTable, eq(challengeSolutionsTable.userId, usersTable.id))
      .leftJoin(
        challengeSolutionVotesTable,
        eq(challengeSolutionVotesTable.solutionId, challengeSolutionsTable.id),
      )
      .where(
        and(
          eq(challengeSolutionsTable.id, solutionId),
          eq(challengeSolutionsTable.challengeSlug, slug),
        ),
      )
      .groupBy(
        challengeSolutionsTable.id,
        challengesTable.slug,
        challengesTable.title,
        challengesTable.summary,
        challengesTable.whyItMatters,
        challengesTable.domain,
        challengesTable.urgency,
        challengesTable.imageUrl,
        usersTable.name,
      );

    if (!row) {
      res.status(404).json({ error: "Solution not found" });
      return;
    }

    let userVote: number | null = null;
    if (userId) {
      const [vote] = await db
        .select({ direction: challengeSolutionVotesTable.direction })
        .from(challengeSolutionVotesTable)
        .where(
          and(
            eq(challengeSolutionVotesTable.solutionId, solutionId),
            eq(challengeSolutionVotesTable.userId, userId),
          ),
        );
      userVote = vote?.direction ?? null;
    }

    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      approach: row.approach,
      link: row.link ?? null,
      createdAt: row.createdAt.toISOString(),
      voteScore: Number(row.voteScore),
      userVote,
      authorName: row.authorName ?? row.userName ?? "Anonymous",
      authorSlug: row.authorSlug ?? null,
      challengeSlug: row.challengeSlug,
      challengeTitle: row.challengeTitle,
      challengeSummary: row.challengeSummary,
      challengeWhyItMatters: row.challengeWhyItMatters,
      challengeDomain: row.challengeDomain,
      challengeUrgency: row.challengeUrgency,
      challengeImageUrl: row.challengeImageUrl ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get challenge solution");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/challenges/:slug/solutions/:solutionId/vote ──────────────────

router.post(
  "/challenges/:slug/solutions/:solutionId/vote",
  requireAuth,
  async (req, res) => {
    try {
      const solutionId = String(req.params.solutionId);
      const userId = req.user!.id;

      const bodyResult = VoteSolutionBody.safeParse(req.body);
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid input" });
        return;
      }

      const slug = String(req.params.slug);

      const [solution] = await db
        .select({ id: challengeSolutionsTable.id })
        .from(challengeSolutionsTable)
        .where(
          and(
            eq(challengeSolutionsTable.id, solutionId),
            eq(challengeSolutionsTable.challengeSlug, slug),
          ),
        );

      if (!solution) {
        res.status(404).json({ error: "Solution not found" });
        return;
      }

      const { direction } = bodyResult.data;

      if (direction === 0) {
        // Remove any existing vote
        await db
          .delete(challengeSolutionVotesTable)
          .where(
            and(
              eq(challengeSolutionVotesTable.solutionId, solutionId),
              eq(challengeSolutionVotesTable.userId, userId),
            ),
          );
      } else {
        // Check for existing vote to implement toggle
        const [existing] = await db
          .select({ direction: challengeSolutionVotesTable.direction })
          .from(challengeSolutionVotesTable)
          .where(
            and(
              eq(challengeSolutionVotesTable.solutionId, solutionId),
              eq(challengeSolutionVotesTable.userId, userId),
            ),
          );

        if (existing && existing.direction === direction) {
          // Same direction clicked again → toggle off (remove)
          await db
            .delete(challengeSolutionVotesTable)
            .where(
              and(
                eq(challengeSolutionVotesTable.solutionId, solutionId),
                eq(challengeSolutionVotesTable.userId, userId),
              ),
            );
        } else {
          // Upsert: insert or update direction
          await db
            .insert(challengeSolutionVotesTable)
            .values({ solutionId, userId, direction })
            .onConflictDoUpdate({
              target: [
                challengeSolutionVotesTable.solutionId,
                challengeSolutionVotesTable.userId,
              ],
              set: { direction },
            });
        }
      }

      // Compute updated score and user vote
      const [{ score }] = await db
        .select({
          score: sql<number>`coalesce(sum(${challengeSolutionVotesTable.direction}), 0)`,
        })
        .from(challengeSolutionVotesTable)
        .where(eq(challengeSolutionVotesTable.solutionId, solutionId));

      const [userVoteRow] = await db
        .select({ direction: challengeSolutionVotesTable.direction })
        .from(challengeSolutionVotesTable)
        .where(
          and(
            eq(challengeSolutionVotesTable.solutionId, solutionId),
            eq(challengeSolutionVotesTable.userId, userId),
          ),
        );

      res.json(
        VoteSolutionResponse.parse({
          voteScore: Number(score),
          userVote: userVoteRow?.direction ?? null,
        }),
      );
    } catch (err) {
      req.log.error({ err }, "Failed to vote on solution");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
