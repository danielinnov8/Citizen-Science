import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  mentorProfilesTable,
  mentorCoursesTable,
  mentorEnrollmentsTable,
  featuredProfilesTable,
  menteeWaitlistTable,
} from "@workspace/db";
import {
  ListMentorsResponse,
  GetMentorResponse,
  GetMyMentorWorkspaceResponse,
  UpdateMyMentorProfileBody,
  UpdateMyMentorProfileResponse,
  CreateMyCourseBody,
  UpdateMyCourseBody,
  UpdateMyCourseResponse,
  DeleteMyCourseResponse,
  DraftMyCourseBody,
  DraftMyCourseResponse,
  GetMyEnrollmentsResponse,
  EnrollInCourseBody,
  EnrollInCourseResponse,
  GetLegendWaitlistResponse,
  JoinLegendWaitlistResponse,
} from "@workspace/api-zod";
import {
  draftMentoringCourse,
  isGeminiConfigured,
} from "@workspace/integrations-gemini-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import { getUserBySession, SESSION_COOKIE } from "../lib/auth/session";
import { isLivingEra } from "../lib/profiles/living";
import {
  creditsForUsage,
  monthlyCreditsForPlan,
  MENTORSHIP_MIN_COURSE_CREDITS,
} from "../lib/credits/plans";
import {
  getCreditState,
  consumeCredits,
  addTopupCredits,
} from "../lib/credits/credits";

const router: IRouter = Router();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Gate for mentor-only routes. Runs after requireAuth so req.user is populated;
// a non-mentor (the superadmin hasn't flagged them) gets 403.
function requireMentor(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.isMentor) {
    res.status(403).json({ error: "Mentor access required." });
    return;
  }
  next();
}

// Ensure a mentor has a profile row, returning it. Profiles are created lazily
// the first time a flagged mentor opens their workspace or saves anything.
async function ensureProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(mentorProfilesTable)
    .where(eq(mentorProfilesTable.userId, userId));
  if (existing) return existing;

  const [created] = await db
    .insert(mentorProfilesTable)
    .values({ userId })
    .onConflictDoNothing({ target: mentorProfilesTable.userId })
    .returning();
  if (created) return created;

  const [row] = await db
    .select()
    .from(mentorProfilesTable)
    .where(eq(mentorProfilesTable.userId, userId));
  return row;
}

// Shape a course row plus its enrollment count for API responses.
function toCourse(
  row: typeof mentorCoursesTable.$inferSelect,
  enrollmentCount: number,
) {
  return {
    id: row.id,
    mentorUserId: row.mentorUserId,
    title: row.title,
    description: row.description,
    outcomes: row.outcomes,
    creditPrice: row.creditPrice,
    minCredits: row.minCredits,
    published: row.published,
    enrollmentCount,
    createdAt: row.createdAt.toISOString(),
  };
}

// Load a mentor's courses with their enrollment counts. When ownerView is false
// only published courses are returned (public listing).
async function coursesForMentor(mentorUserId: string, ownerView: boolean) {
  const where = ownerView
    ? eq(mentorCoursesTable.mentorUserId, mentorUserId)
    : and(
        eq(mentorCoursesTable.mentorUserId, mentorUserId),
        eq(mentorCoursesTable.published, true),
      );

  const rows = await db
    .select({
      course: mentorCoursesTable,
      enrollmentCount: count(mentorEnrollmentsTable.id),
    })
    .from(mentorCoursesTable)
    .leftJoin(
      mentorEnrollmentsTable,
      eq(mentorEnrollmentsTable.courseId, mentorCoursesTable.id),
    )
    .where(where)
    .groupBy(mentorCoursesTable.id)
    .orderBy(desc(mentorCoursesTable.createdAt));

  return rows.map((r) => toCourse(r.course, Number(r.enrollmentCount)));
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

// GET /mentors — every flagged mentor who has a profile, with a published-course
// count. Mentors with zero published courses still appear (they're available).
router.get(
  "/mentors",
  async (_req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        image: usersTable.image,
        headline: mentorProfilesTable.headline,
        expertise: mentorProfilesTable.expertise,
      })
      .from(usersTable)
      .innerJoin(
        mentorProfilesTable,
        eq(mentorProfilesTable.userId, usersTable.id),
      )
      .where(eq(usersTable.isMentor, true))
      .orderBy(desc(mentorProfilesTable.updatedAt));

    const counts = await db
      .select({
        mentorUserId: mentorCoursesTable.mentorUserId,
        c: count(),
      })
      .from(mentorCoursesTable)
      .where(eq(mentorCoursesTable.published, true))
      .groupBy(mentorCoursesTable.mentorUserId);

    const countByMentor = new Map(
      counts.map((r) => [r.mentorUserId, Number(r.c)]),
    );

    const mentors = rows.map((r) => ({
      userId: r.userId,
      name: r.name,
      image: r.image,
      headline: r.headline,
      expertise: r.expertise,
      courseCount: countByMentor.get(r.userId) ?? 0,
    }));

    res.json(ListMentorsResponse.parse(mentors));
  },
);

// GET /mentors/:id — one mentor's public profile and published courses.
router.get(
  "/mentors/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    if (!UUID_RE.test(id)) {
      res.status(404).json({ error: "Mentor not found." });
      return;
    }

    const [row] = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        image: usersTable.image,
        isMentor: usersTable.isMentor,
        headline: mentorProfilesTable.headline,
        bio: mentorProfilesTable.bio,
        expertise: mentorProfilesTable.expertise,
      })
      .from(usersTable)
      .innerJoin(
        mentorProfilesTable,
        eq(mentorProfilesTable.userId, usersTable.id),
      )
      .where(eq(usersTable.id, id));

    if (!row || !row.isMentor) {
      res.status(404).json({ error: "Mentor not found." });
      return;
    }

    const courses = await coursesForMentor(id, false);

    res.json(
      GetMentorResponse.parse({
        userId: row.userId,
        name: row.name,
        image: row.image,
        headline: row.headline,
        bio: row.bio,
        expertise: row.expertise,
        courses,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// Mentor workspace (mentor-only)
// ---------------------------------------------------------------------------

// Assemble the full mentor workspace: profile, courses (incl. unpublished), and
// the list of mentees enrolled across all of the mentor's courses.
async function buildWorkspace(userId: string) {
  const profile = await ensureProfile(userId);
  const courses = await coursesForMentor(userId, true);

  const menteeRows = await db
    .select({
      enrollmentId: mentorEnrollmentsTable.id,
      courseId: mentorEnrollmentsTable.courseId,
      courseTitle: mentorCoursesTable.title,
      menteeName: usersTable.name,
      creditsPaid: mentorEnrollmentsTable.creditsPaid,
      enrolledAt: mentorEnrollmentsTable.createdAt,
    })
    .from(mentorEnrollmentsTable)
    .innerJoin(
      mentorCoursesTable,
      eq(mentorCoursesTable.id, mentorEnrollmentsTable.courseId),
    )
    .innerJoin(
      usersTable,
      eq(usersTable.id, mentorEnrollmentsTable.menteeUserId),
    )
    .where(eq(mentorCoursesTable.mentorUserId, userId))
    .orderBy(desc(mentorEnrollmentsTable.createdAt));

  const mentees = menteeRows.map((r) => ({
    enrollmentId: r.enrollmentId,
    courseId: r.courseId,
    courseTitle: r.courseTitle,
    menteeName: r.menteeName,
    creditsPaid: r.creditsPaid,
    enrolledAt: r.enrolledAt.toISOString(),
  }));

  return {
    headline: profile.headline,
    bio: profile.bio,
    expertise: profile.expertise,
    courses,
    mentees,
  };
}

router.get(
  "/mentorship/me",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const workspace = await buildWorkspace(req.user!.id);
    res.json(GetMyMentorWorkspaceResponse.parse(workspace));
  },
);

router.patch(
  "/mentorship/me/profile",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = UpdateMyMentorProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid profile input." });
      return;
    }
    const userId = req.user!.id;
    await ensureProfile(userId);
    await db
      .update(mentorProfilesTable)
      .set({
        headline: parsed.data.headline,
        bio: parsed.data.bio,
        expertise: parsed.data.expertise,
        updatedAt: new Date(),
      })
      .where(eq(mentorProfilesTable.userId, userId));

    const workspace = await buildWorkspace(userId);
    res.json(UpdateMyMentorProfileResponse.parse(workspace));
  },
);

router.post(
  "/mentorship/me/courses",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreateMyCourseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid course input." });
      return;
    }
    const minCredits = Math.max(
      MENTORSHIP_MIN_COURSE_CREDITS,
      parsed.data.minCredits,
    );
    const creditPrice = Math.max(minCredits, parsed.data.creditPrice);

    const [created] = await db
      .insert(mentorCoursesTable)
      .values({
        mentorUserId: req.user!.id,
        title: parsed.data.title,
        description: parsed.data.description,
        outcomes: parsed.data.outcomes,
        creditPrice,
        minCredits,
        published: parsed.data.published,
      })
      .returning();

    res.status(201).json(UpdateMyCourseResponse.parse(toCourse(created, 0)));
  },
);

router.patch(
  "/mentorship/me/courses/:courseId",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const courseId = String(req.params.courseId);
    if (!UUID_RE.test(courseId)) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    const parsed = UpdateMyCourseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid course input." });
      return;
    }

    const [existing] = await db
      .select()
      .from(mentorCoursesTable)
      .where(
        and(
          eq(mentorCoursesTable.id, courseId),
          eq(mentorCoursesTable.mentorUserId, req.user!.id),
        ),
      );
    if (!existing) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    const minCredits = Math.max(
      MENTORSHIP_MIN_COURSE_CREDITS,
      parsed.data.minCredits,
    );
    const creditPrice = Math.max(minCredits, parsed.data.creditPrice);

    await db
      .update(mentorCoursesTable)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        outcomes: parsed.data.outcomes,
        creditPrice,
        minCredits,
        published: parsed.data.published,
        updatedAt: new Date(),
      })
      .where(eq(mentorCoursesTable.id, courseId));

    const [enrollCount] = await db
      .select({ c: count() })
      .from(mentorEnrollmentsTable)
      .where(eq(mentorEnrollmentsTable.courseId, courseId));

    const [updated] = await db
      .select()
      .from(mentorCoursesTable)
      .where(eq(mentorCoursesTable.id, courseId));

    res.json(
      UpdateMyCourseResponse.parse(toCourse(updated, Number(enrollCount?.c ?? 0))),
    );
  },
);

router.delete(
  "/mentorship/me/courses/:courseId",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const courseId = String(req.params.courseId);
    if (!UUID_RE.test(courseId)) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    const deleted = await db
      .delete(mentorCoursesTable)
      .where(
        and(
          eq(mentorCoursesTable.id, courseId),
          eq(mentorCoursesTable.mentorUserId, req.user!.id),
        ),
      )
      .returning({ id: mentorCoursesTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    res.json(DeleteMyCourseResponse.parse({ message: "Course deleted." }));
  },
);

router.post(
  "/mentorship/me/courses/draft",
  requireAuth,
  requireMentor,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = DraftMyCourseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "A brief is required." });
      return;
    }
    if (!isGeminiConfigured()) {
      res.status(503).json({
        error: "AI drafting is unavailable right now.",
      });
      return;
    }

    const subjectKey = `user:${req.user!.id}`;
    const monthlyGrant = monthlyCreditsForPlan(req.user!.plan);
    try {
      const state = await getCreditState(subjectKey, monthlyGrant);
      if (state.totalRemaining <= 0) {
        res.status(402).json({
          error:
            "You're out of credits. Top up or upgrade your plan to draft more courses.",
          outOfCredits: true,
          isGuest: false,
          upgradeHref: "/pricing",
        });
        return;
      }
    } catch (err) {
      req.log?.warn({ err }, "credit pre-check failed; allowing course draft");
    }

    try {
      let usageTokens = 0;
      const draft = await draftMentoringCourse(parsed.data.brief, {
        onUsage: (u) => {
          usageTokens = u.totalTokens;
        },
      });
      const cost = creditsForUsage("courseDraft", usageTokens);
      try {
        await consumeCredits(subjectKey, monthlyGrant, cost);
      } catch (meterErr) {
        req.log?.warn(
          { err: meterErr },
          "credit deduction failed after course draft",
        );
      }
      res.json(DraftMyCourseResponse.parse(draft));
    } catch (err) {
      req.log?.error({ err }, "course draft failed");
      res.status(500).json({ error: "Failed to draft course." });
    }
  },
);

// ---------------------------------------------------------------------------
// Member enrollment
// ---------------------------------------------------------------------------

router.get(
  "/mentorship/enrollments",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select({
        enrollmentId: mentorEnrollmentsTable.id,
        courseId: mentorEnrollmentsTable.courseId,
        courseTitle: mentorCoursesTable.title,
        courseDescription: mentorCoursesTable.description,
        outcomes: mentorCoursesTable.outcomes,
        mentorUserId: mentorCoursesTable.mentorUserId,
        mentorName: usersTable.name,
        creditsPaid: mentorEnrollmentsTable.creditsPaid,
        enrolledAt: mentorEnrollmentsTable.createdAt,
      })
      .from(mentorEnrollmentsTable)
      .innerJoin(
        mentorCoursesTable,
        eq(mentorCoursesTable.id, mentorEnrollmentsTable.courseId),
      )
      .innerJoin(
        usersTable,
        eq(usersTable.id, mentorCoursesTable.mentorUserId),
      )
      .where(eq(mentorEnrollmentsTable.menteeUserId, req.user!.id))
      .orderBy(desc(mentorEnrollmentsTable.createdAt));

    const enrollments = rows.map((r) => ({
      enrollmentId: r.enrollmentId,
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      courseDescription: r.courseDescription,
      outcomes: r.outcomes,
      mentorUserId: r.mentorUserId,
      mentorName: r.mentorName,
      creditsPaid: r.creditsPaid,
      enrolledAt: r.enrolledAt.toISOString(),
    }));

    res.json(GetMyEnrollmentsResponse.parse(enrollments));
  },
);

router.post(
  "/mentorship/courses/:courseId/enroll",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const courseId = String(req.params.courseId);
    if (!UUID_RE.test(courseId)) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    const parsed = EnrollInCourseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "A credit amount is required." });
      return;
    }

    const menteeId = req.user!.id;

    const [course] = await db
      .select()
      .from(mentorCoursesTable)
      .where(eq(mentorCoursesTable.id, courseId));

    if (!course || !course.published) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    if (course.mentorUserId === menteeId) {
      res.status(400).json({ error: "You can't enroll in your own course." });
      return;
    }

    if (parsed.data.credits < course.minCredits) {
      res.status(400).json({
        error: `This course requires at least ${course.minCredits} credits.`,
      });
      return;
    }

    const [existing] = await db
      .select({ id: mentorEnrollmentsTable.id })
      .from(mentorEnrollmentsTable)
      .where(
        and(
          eq(mentorEnrollmentsTable.courseId, courseId),
          eq(mentorEnrollmentsTable.menteeUserId, menteeId),
        ),
      );
    if (existing) {
      res.status(409).json({ error: "You're already enrolled in this course." });
      return;
    }

    const credits = parsed.data.credits;
    const subjectKey = `user:${menteeId}`;
    const monthlyGrant = monthlyCreditsForPlan(req.user!.plan);

    const state = await getCreditState(subjectKey, monthlyGrant);
    if (state.totalRemaining < credits) {
      res.status(402).json({
        error:
          "You don't have enough credits to enroll. Top up or upgrade your plan.",
        outOfCredits: true,
        isGuest: false,
        upgradeHref: "/pricing",
      });
      return;
    }

    // Move credits: deduct from the mentee, credit the mentor as top-up. Record
    // the enrollment. Done in a transaction so a partial transfer can't happen.
    let enrollmentId = "";
    try {
      await db.transaction(async () => {
        const after = await consumeCredits(subjectKey, monthlyGrant, credits);
        if (after.totalRemaining < 0) {
          throw new Error("insufficient credits");
        }
        await addTopupCredits(`user:${course.mentorUserId}`, credits);
        const [enrollment] = await db
          .insert(mentorEnrollmentsTable)
          .values({
            courseId,
            menteeUserId: menteeId,
            creditsPaid: credits,
          })
          .returning({ id: mentorEnrollmentsTable.id });
        enrollmentId = enrollment.id;
      });
    } catch (err) {
      req.log?.error({ err }, "enrollment failed");
      res.status(500).json({ error: "Failed to enroll. No credits were spent." });
      return;
    }

    const finalState = await getCreditState(subjectKey, monthlyGrant);
    res.status(201).json(
      EnrollInCourseResponse.parse({
        enrollmentId,
        courseId,
        creditsPaid: credits,
        totalRemaining: finalState.totalRemaining,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// Living-legend mentee waitlist (Task #119)
// ---------------------------------------------------------------------------
//
// A "living legend" is a directory figure (featured_profiles row) who is still
// alive. Members can join a mentee waitlist for them, which surfaces aspiring-
// mentee demand back to the figure (and to the verified owner of that profile,
// if it has been claimed). The figure is identified by its directory slug.

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

// Load a living-legend profile by slug, or null when no such row exists or the
// figure is historical/deceased (only living figures can be mentors).
async function loadLivingLegend(slug: string) {
  const [profile] = await db
    .select({
      id: featuredProfilesTable.id,
      slug: featuredProfilesTable.slug,
      era: featuredProfilesTable.era,
      ownerUserId: featuredProfilesTable.ownerUserId,
    })
    .from(featuredProfilesTable)
    .where(eq(featuredProfilesTable.slug, slug));

  if (!profile || !isLivingEra(profile.era)) return null;
  return profile;
}

// Assemble the waitlist status for a figure. `userId` is null for guests, who
// only see the aggregate count.
async function buildWaitlistStatus(
  figureSlug: string,
  ownerUserId: string | null,
  userId: string | null,
) {
  const [{ c }] = await db
    .select({ c: count() })
    .from(menteeWaitlistTable)
    .where(eq(menteeWaitlistTable.figureSlug, figureSlug));

  let isOnWaitlist = false;
  if (userId) {
    const [row] = await db
      .select({ id: menteeWaitlistTable.id })
      .from(menteeWaitlistTable)
      .where(
        and(
          eq(menteeWaitlistTable.figureSlug, figureSlug),
          eq(menteeWaitlistTable.userId, userId),
        ),
      );
    isOnWaitlist = !!row;
  }

  return {
    figureSlug,
    count: Number(c),
    isOnWaitlist,
    isOwner: !!userId && ownerUserId === userId,
  };
}

// GET /mentorship/legends/:slug/waitlist — public (optional auth). Returns the
// waitlist count for a living legend, plus the caller's own membership/ownership
// when they're signed in.
router.get(
  "/mentorship/legends/:slug/waitlist",
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    if (!SLUG_RE.test(slug)) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    const profile = await loadLivingLegend(slug);
    if (!profile) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    // Optional auth: resolve the caller from the session cookie if present.
    let userId: string | null = null;
    const sid = req.signedCookies?.[SESSION_COOKIE];
    if (typeof sid === "string" && sid.length > 0) {
      try {
        const user = await getUserBySession(sid);
        userId = user?.id ?? null;
      } catch (err) {
        req.log?.warn({ err }, "waitlist: optional session lookup failed");
      }
    }

    const status = await buildWaitlistStatus(slug, profile.ownerUserId, userId);
    res.json(GetLegendWaitlistResponse.parse(status));
  },
);

// POST /mentorship/legends/:slug/waitlist — auth-only. Adds the signed-in member
// to the figure's mentee waitlist (idempotent) and returns the updated status.
router.post(
  "/mentorship/legends/:slug/waitlist",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    if (!SLUG_RE.test(slug)) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    const profile = await loadLivingLegend(slug);
    if (!profile) {
      res.status(404).json({ error: "Figure not found." });
      return;
    }

    const userId = req.user!.id;
    await db
      .insert(menteeWaitlistTable)
      .values({ figureSlug: slug, userId })
      .onConflictDoNothing({
        target: [menteeWaitlistTable.figureSlug, menteeWaitlistTable.userId],
      });

    const status = await buildWaitlistStatus(slug, profile.ownerUserId, userId);
    res.json(JoinLegendWaitlistResponse.parse(status));
  },
);

export default router;
