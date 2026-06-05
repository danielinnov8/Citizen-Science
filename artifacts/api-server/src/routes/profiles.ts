import { Router, type IRouter, type Request, type Response } from "express";
import { asc, eq } from "drizzle-orm";
import { db, featuredProfilesTable } from "@workspace/db";
import {
  ListFeaturedProfilesResponse,
  GetFeaturedProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

    res.json(GetFeaturedProfileResponse.parse(profile));
  },
);

export default router;
