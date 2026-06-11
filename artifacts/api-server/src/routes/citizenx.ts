import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import {
  db,
  citizenxChaptersTable,
  citizenxEventsTable,
  citizenxExperimentsTable,
  type User,
} from "@workspace/db";
import {
  ListCitizenxChaptersResponse,
  ListCitizenxChaptersResponseItem,
  ApplyCitizenxChapterBody,
  ListMyCitizenxChaptersResponse,
  ListCitizenxEventsResponse,
  CreateCitizenxEventBody,
  ListMyCitizenxEventsResponse,
  GetCitizenxEventResponse,
  ListCitizenxExperimentsResponse,
  PublishCitizenxExperimentBody,
  ListMyCitizenxExperimentsResponse,
  GetCitizenxExperimentResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Derive a URL-safe slug base from arbitrary text, then append a short random
// suffix so the unique slug column never collides (two events called
// "Stargazing Night" coexist fine). Kept simple — no external slug lib.
function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : suffix;
}

// A sensible public display name for the acting user, used to snapshot the
// organizer/author onto each row so listings never need to join users.
function displayName(user: User): string {
  if (user.name && user.name.trim()) return user.name.trim();
  return user.email.split("@")[0];
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

// Public: active (approved) chapters only.
router.get(
  "/citizenx/chapters",
  async (_req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select()
      .from(citizenxChaptersTable)
      .where(eq(citizenxChaptersTable.status, "active"))
      .orderBy(asc(citizenxChaptersTable.name));
    res.json(ListCitizenxChaptersResponse.parse(rows));
  },
);

// Auth: the caller's own chapters (including pending applications).
router.get(
  "/citizenx/chapters/mine",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const rows = await db
      .select()
      .from(citizenxChaptersTable)
      .where(eq(citizenxChaptersTable.ownerId, user.id))
      .orderBy(desc(citizenxChaptersTable.createdAt));
    res.json(ListMyCitizenxChaptersResponse.parse(rows));
  },
);

// Auth: apply to organize a chapter — starts in "pending" review status.
router.post(
  "/citizenx/chapters",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplyCitizenxChapterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const user = req.user as User;
    const [row] = await db
      .insert(citizenxChaptersTable)
      .values({
        ownerId: user.id,
        organizerName: displayName(user),
        slug: slugify(parsed.data.name),
        name: parsed.data.name.trim(),
        location: parsed.data.location.trim(),
        focus: parsed.data.focus.trim(),
        description: parsed.data.description.trim(),
        status: "pending",
      })
      .returning();
    res.status(201).json(ListCitizenxChaptersResponseItem.parse(row));
  },
);

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

// Public: upcoming events (start time in the future), soonest first.
router.get(
  "/citizenx/events",
  async (_req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select()
      .from(citizenxEventsTable)
      .where(gte(citizenxEventsTable.startsAt, new Date()))
      .orderBy(asc(citizenxEventsTable.startsAt));
    res.json(ListCitizenxEventsResponse.parse(rows));
  },
);

// Auth: the caller's own events.
router.get(
  "/citizenx/events/mine",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const rows = await db
      .select()
      .from(citizenxEventsTable)
      .where(eq(citizenxEventsTable.ownerId, user.id))
      .orderBy(desc(citizenxEventsTable.startsAt));
    res.json(ListMyCitizenxEventsResponse.parse(rows));
  },
);

// Public: single event by slug.
router.get(
  "/citizenx/events/:slug",
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const [row] = await db
      .select()
      .from(citizenxEventsTable)
      .where(eq(citizenxEventsTable.slug, slug));
    if (!row) {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    res.json(GetCitizenxEventResponse.parse(row));
  },
);

// Auth: host an event.
router.post(
  "/citizenx/events",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreateCitizenxEventBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const user = req.user as User;
    const [row] = await db
      .insert(citizenxEventsTable)
      .values({
        ownerId: user.id,
        organizerName: displayName(user),
        chapterId: parsed.data.chapterId ?? null,
        slug: slugify(parsed.data.title),
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        location: parsed.data.location.trim(),
        startsAt: parsed.data.startsAt,
        status: "upcoming",
      })
      .returning();
    res.status(201).json(GetCitizenxEventResponse.parse(row));
  },
);

// ---------------------------------------------------------------------------
// Experiments
// ---------------------------------------------------------------------------

// Public: gallery of published experiments, newest first.
router.get(
  "/citizenx/experiments",
  async (_req: Request, res: Response): Promise<void> => {
    const rows = await db
      .select({
        id: citizenxExperimentsTable.id,
        authorName: citizenxExperimentsTable.authorName,
        slug: citizenxExperimentsTable.slug,
        title: citizenxExperimentsTable.title,
        summary: citizenxExperimentsTable.summary,
        coverImageUrl: citizenxExperimentsTable.coverImageUrl,
        categorySlug: citizenxExperimentsTable.categorySlug,
        createdAt: citizenxExperimentsTable.createdAt,
      })
      .from(citizenxExperimentsTable)
      .orderBy(desc(citizenxExperimentsTable.createdAt));
    res.json(ListCitizenxExperimentsResponse.parse(rows));
  },
);

// Auth: the caller's own published experiments.
router.get(
  "/citizenx/experiments/mine",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const rows = await db
      .select({
        id: citizenxExperimentsTable.id,
        authorName: citizenxExperimentsTable.authorName,
        slug: citizenxExperimentsTable.slug,
        title: citizenxExperimentsTable.title,
        summary: citizenxExperimentsTable.summary,
        coverImageUrl: citizenxExperimentsTable.coverImageUrl,
        categorySlug: citizenxExperimentsTable.categorySlug,
        createdAt: citizenxExperimentsTable.createdAt,
      })
      .from(citizenxExperimentsTable)
      .where(eq(citizenxExperimentsTable.authorId, user.id))
      .orderBy(desc(citizenxExperimentsTable.createdAt));
    res.json(ListMyCitizenxExperimentsResponse.parse(rows));
  },
);

// Public: single published experiment by slug.
router.get(
  "/citizenx/experiments/:slug",
  async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const [row] = await db
      .select()
      .from(citizenxExperimentsTable)
      .where(eq(citizenxExperimentsTable.slug, slug));
    if (!row) {
      res.status(404).json({ error: "Experiment not found." });
      return;
    }
    res.json(GetCitizenxExperimentResponse.parse(row));
  },
);

// Auth: publish an experiment.
router.post(
  "/citizenx/experiments",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = PublishCitizenxExperimentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const user = req.user as User;
    const [row] = await db
      .insert(citizenxExperimentsTable)
      .values({
        authorId: user.id,
        authorName: parsed.data.authorName.trim(),
        authorTagline: parsed.data.authorTagline?.trim() || null,
        slug: slugify(parsed.data.title),
        title: parsed.data.title.trim(),
        summary: parsed.data.summary.trim(),
        description: parsed.data.description.trim(),
        coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
        categorySlug: parsed.data.categorySlug,
        steps: parsed.data.steps,
        status: "published",
      })
      .returning();
    res.status(201).json(GetCitizenxExperimentResponse.parse(row));
  },
);

export default router;
