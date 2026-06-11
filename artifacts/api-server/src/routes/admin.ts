import { Router, type IRouter, type Request, type Response } from "express";
import { and, count, desc, eq, gte, ilike, like, ne, or, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  creditAccountsTable,
  copilotUsageTable,
  featuredProfilesTable,
  profileClaimsTable,
  type User,
  type ProfileClaim,
} from "@workspace/db";
import {
  GetAdminOverviewResponse,
  ListAdminUsersResponse,
  UpdateUserPlanBody,
  UpdateUserPlanResponse,
  GrantUserCreditsBody,
  GrantUserCreditsResponse,
  GetAdminRevenueResponse,
  GetAdminUsageResponse,
  GetAdminContentResponse,
  GetAdminSystemResponse,
  ListAdminClaimsResponse,
  ApproveClaimResponse,
  DenyClaimResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { requireSuperAdmin } from "../lib/admin/superadmin";
import {
  PLAN_MONTHLY_CREDITS,
  monthlyCreditsForPlan,
  normalizePlan,
} from "../lib/credits/plans";
import { addTopupCredits, currentPeriodKey } from "../lib/credits/credits";
import { liveAvatarSessionCount } from "./avatar";
import { LABS } from "../lib/labs";
import { PARTNERS } from "../lib/partners";
import { isGeminiConfigured } from "@workspace/integrations-gemini-ai-server";
import { isYouTubeConfigured } from "../lib/youtube/search";

const router: IRouter = Router();

// Every /admin/* route requires a valid session AND a superadmin allowlisted
// email. A non-admin hitting these directly gets 403 (requireSuperAdmin) or 401
// (requireAuth). Order matters: auth first so req.user is populated.
router.use("/admin", requireAuth, requireSuperAdmin);

// Pricing used for the projected-revenue model. No live payment processor — MRR
// is purely derived from how many users sit on each paid tier.
const PLAN_PRICES_USD: Record<string, number> = {
  free: 0,
  researcher: 20,
  pioneer: 100,
};

// Notional USD value of one credit, used to put a dollar figure on consumption.
// Derived from the Researcher tier ($20 / 2000 credits = $0.01/credit).
const CREDIT_VALUE_USD = 20 / PLAN_MONTHLY_CREDITS.researcher;

// Number of science categories / learning modules. Mirrors the MODULES list the
// copilot uses; kept here so the count is API-served like everything else.
const CATEGORY_COUNT = 14;

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgo(n: number): Date {
  const d = startOfUtcDay(new Date());
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function toInt(v: unknown): number {
  const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// User ids are UUIDs. Guard the write routes so a malformed id is treated as a
// "not found" rather than blowing up the Postgres query with an invalid-uuid
// syntax error (which would surface as a 500).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Build a zero-filled daily series over the last `days` days from a sparse map
// of "YYYY-MM-DD" -> value, so the chart always has a continuous x-axis.
function fillDailySeries(
  rows: { date: string; value: number }[],
  days: number,
): { date: string; value: number }[] {
  const byDate = new Map(rows.map((r) => [r.date, r.value]));
  const out: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    out.push({ date: key, value: byDate.get(key) ?? 0 });
  }
  return out;
}

router.get(
  "/admin/overview",
  async (req: Request, res: Response): Promise<void> => {
    const period = currentPeriodKey();

    const [
      totalRow,
      todayRow,
      d7Row,
      d30Row,
      planRows,
      guestRow,
      creditsRow,
      signupRows,
      copilotRows,
    ] = await Promise.all([
      db.select({ c: count() }).from(usersTable),
      db
        .select({ c: count() })
        .from(usersTable)
        .where(gte(usersTable.createdAt, daysAgo(0))),
      db
        .select({ c: count() })
        .from(usersTable)
        .where(gte(usersTable.createdAt, daysAgo(7))),
      db
        .select({ c: count() })
        .from(usersTable)
        .where(gte(usersTable.createdAt, daysAgo(30))),
      db
        .select({ plan: usersTable.plan, c: count() })
        .from(usersTable)
        .groupBy(usersTable.plan),
      db
        .select({ c: count() })
        .from(creditAccountsTable)
        .where(like(creditAccountsTable.subjectKey, "guest:%")),
      db
        .select({ s: sql<string>`coalesce(sum(${creditAccountsTable.periodUsed}), 0)` })
        .from(creditAccountsTable)
        .where(eq(creditAccountsTable.periodKey, period)),
      db
        .select({
          date: sql<string>`to_char(${usersTable.createdAt}, 'YYYY-MM-DD')`,
          value: count(),
        })
        .from(usersTable)
        .where(gte(usersTable.createdAt, daysAgo(29)))
        .groupBy(sql`to_char(${usersTable.createdAt}, 'YYYY-MM-DD')`),
      db
        .select({
          date: sql<string>`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM-DD')`,
          value: sql<string>`coalesce(sum(${copilotUsageTable.count}), 0)`,
        })
        .from(copilotUsageTable)
        .where(gte(copilotUsageTable.usageDate, daysAgo(29).toISOString().slice(0, 10)))
        .groupBy(sql`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM-DD')`),
    ]);

    const registeredUsers = toInt(totalRow[0]?.c);
    const planDistribution = planRows.map((r) => ({
      plan: normalizePlan(r.plan),
      count: toInt(r.c),
    }));

    res.json(
      GetAdminOverviewResponse.parse({
        totalUsers: registeredUsers,
        newToday: toInt(todayRow[0]?.c),
        new7d: toInt(d7Row[0]?.c),
        new30d: toInt(d30Row[0]?.c),
        registeredUsers,
        guestSubjects: toInt(guestRow[0]?.c),
        planDistribution,
        creditsConsumedThisMonth: toInt(creditsRow[0]?.s),
        signupTrend: fillDailySeries(
          signupRows.map((r) => ({ date: r.date, value: toInt(r.value) })),
          30,
        ),
        copilotTrend: fillDailySeries(
          copilotRows.map((r) => ({ date: r.date, value: toInt(r.value) })),
          30,
        ),
      }),
    );
  },
);

router.get(
  "/admin/users",
  async (req: Request, res: Response): Promise<void> => {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = Math.max(1, toInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, toInt(req.query.pageSize) || 25));
    const offset = (page - 1) * pageSize;

    const where = search
      ? or(
          ilike(usersTable.email, `%${search}%`),
          ilike(usersTable.name, `%${search}%`),
        )
      : undefined;

    const period = currentPeriodKey();

    // Per-user current-month usage: left-join the credit ledger on the user's
    // ledger key ("user:<id>"). periodUsed only counts if the stored period is
    // the current month (lazy monthly reset), matching the runtime metering.
    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          plan: usersTable.plan,
          googleId: usersTable.googleId,
          createdAt: usersTable.createdAt,
          periodKey: creditAccountsTable.periodKey,
          periodUsed: creditAccountsTable.periodUsed,
          topupBalance: creditAccountsTable.topupBalance,
        })
        .from(usersTable)
        .leftJoin(
          creditAccountsTable,
          eq(
            creditAccountsTable.subjectKey,
            sql`'user:' || ${usersTable.id}`,
          ),
        )
        .where(where)
        .orderBy(desc(usersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ c: count() }).from(usersTable).where(where),
    ]);

    const users = rows.map((r) => {
      const plan = normalizePlan(r.plan);
      const usedThisMonth =
        r.periodKey === period ? toInt(r.periodUsed) : 0;
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        plan,
        signupMethod: r.googleId ? "google" : "password",
        createdAt: r.createdAt,
        creditsUsedThisMonth: usedThisMonth,
        monthlyGrant: monthlyCreditsForPlan(plan),
        topupBalance: toInt(r.topupBalance),
      };
    });

    res.json(
      ListAdminUsersResponse.parse({
        users,
        total: toInt(totalRow[0]?.c),
        page,
        pageSize,
      }),
    );
  },
);

// Shape a single user row for the admin write responses (plan/credit changes).
async function adminUserById(id: string) {
  const period = currentPeriodKey();
  const [row] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      plan: usersTable.plan,
      googleId: usersTable.googleId,
      createdAt: usersTable.createdAt,
      periodKey: creditAccountsTable.periodKey,
      periodUsed: creditAccountsTable.periodUsed,
      topupBalance: creditAccountsTable.topupBalance,
    })
    .from(usersTable)
    .leftJoin(
      creditAccountsTable,
      eq(creditAccountsTable.subjectKey, sql`'user:' || ${usersTable.id}`),
    )
    .where(eq(usersTable.id, id));

  if (!row) return null;
  const plan = normalizePlan(row.plan);
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan,
    signupMethod: row.googleId ? "google" : "password",
    createdAt: row.createdAt,
    creditsUsedThisMonth: row.periodKey === period ? toInt(row.periodUsed) : 0,
    monthlyGrant: monthlyCreditsForPlan(plan),
    topupBalance: toInt(row.topupBalance),
  };
}

router.patch(
  "/admin/users/:id/plan",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = UpdateUserPlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "A valid plan is required." });
      return;
    }
    const id = String(req.params.id);
    if (!UUID_RE.test(id)) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const updated = await db
      .update(usersTable)
      .set({ plan: parsed.data.plan, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    if (updated.length === 0) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const user = await adminUserById(id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json(UpdateUserPlanResponse.parse(user));
  },
);

router.post(
  "/admin/users/:id/credits",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = GrantUserCreditsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "A positive credit amount is required." });
      return;
    }
    const id = String(req.params.id);
    if (!UUID_RE.test(id)) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const [exists] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, id));
    if (!exists) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    await addTopupCredits(`user:${id}`, parsed.data.credits);

    const user = await adminUserById(id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json(GrantUserCreditsResponse.parse(user));
  },
);

router.get(
  "/admin/revenue",
  async (req: Request, res: Response): Promise<void> => {
    const period = currentPeriodKey();
    const [planRows, topupRow, creditsRow] = await Promise.all([
      db
        .select({ plan: usersTable.plan, c: count() })
        .from(usersTable)
        .groupBy(usersTable.plan),
      db
        .select({ s: sql<string>`coalesce(sum(${creditAccountsTable.topupBalance}), 0)` })
        .from(creditAccountsTable),
      db
        .select({ s: sql<string>`coalesce(sum(${creditAccountsTable.periodUsed}), 0)` })
        .from(creditAccountsTable)
        .where(eq(creditAccountsTable.periodKey, period)),
    ]);

    const counts: Record<string, number> = { free: 0, researcher: 0, pioneer: 0 };
    for (const r of planRows) {
      counts[normalizePlan(r.plan)] += toInt(r.c);
    }

    const planRevenue = (["free", "researcher", "pioneer"] as const).map(
      (plan) => ({
        plan,
        count: counts[plan],
        unitPrice: PLAN_PRICES_USD[plan],
        monthlyRevenue: counts[plan] * PLAN_PRICES_USD[plan],
      }),
    );

    const projectedMrr = planRevenue.reduce((s, p) => s + p.monthlyRevenue, 0);
    const paidUsers = counts.researcher + counts.pioneer;
    const freeUsers = counts.free;
    const registered = paidUsers + freeUsers;
    const creditsConsumed = toInt(creditsRow[0]?.s);

    res.json(
      GetAdminRevenueResponse.parse({
        projectedMrr,
        paidUsers,
        freeUsers,
        conversionRate: registered > 0 ? paidUsers / registered : 0,
        planRevenue,
        // No founding-member purchase flow exists yet (it's a mailto CTA), so
        // there is nothing to count in the DB.
        foundingMembers: 0,
        foundingRevenue: 0,
        outstandingTopupCredits: toInt(topupRow[0]?.s),
        creditsConsumedThisMonth: creditsConsumed,
        creditValueUsd: Math.round(creditsConsumed * CREDIT_VALUE_USD * 100) / 100,
      }),
    );
  },
);

router.get(
  "/admin/usage",
  async (req: Request, res: Response): Promise<void> => {
    const period = currentPeriodKey();
    const dailyCutoff = daysAgo(29).toISOString().slice(0, 10);

    const [creditsRow, dailyRows, monthlyRows] = await Promise.all([
      db
        .select({ s: sql<string>`coalesce(sum(${creditAccountsTable.periodUsed}), 0)` })
        .from(creditAccountsTable)
        .where(eq(creditAccountsTable.periodKey, period)),
      db
        .select({
          date: sql<string>`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM-DD')`,
          total: sql<string>`coalesce(sum(${copilotUsageTable.count}), 0)`,
          users: sql<string>`coalesce(sum(case when ${copilotUsageTable.subjectKey} like 'user:%' then ${copilotUsageTable.count} else 0 end), 0)`,
          guests: sql<string>`coalesce(sum(case when ${copilotUsageTable.subjectKey} like 'guest:%' then ${copilotUsageTable.count} else 0 end), 0)`,
        })
        .from(copilotUsageTable)
        .where(gte(copilotUsageTable.usageDate, dailyCutoff))
        .groupBy(sql`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM-DD')`),
      db
        .select({
          date: sql<string>`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM')`,
          value: sql<string>`coalesce(sum(${copilotUsageTable.count}), 0)`,
        })
        .from(copilotUsageTable)
        .groupBy(sql`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${copilotUsageTable.usageDate}, 'YYYY-MM')`),
    ]);

    res.json(
      GetAdminUsageResponse.parse({
        creditsConsumedThisMonth: toInt(creditsRow[0]?.s),
        copilotDaily: fillDailySeries(
          dailyRows.map((r) => ({ date: r.date, value: toInt(r.total) })),
          30,
        ),
        copilotMonthly: monthlyRows
          .slice(-12)
          .map((r) => ({ date: r.date, value: toInt(r.value) })),
        copilotUsersDaily: fillDailySeries(
          dailyRows.map((r) => ({ date: r.date, value: toInt(r.users) })),
          30,
        ),
        copilotGuestsDaily: fillDailySeries(
          dailyRows.map((r) => ({ date: r.date, value: toInt(r.guests) })),
          30,
        ),
        liveAvatarSessions: liveAvatarSessionCount(),
      }),
    );
  },
);

router.get(
  "/admin/content",
  async (req: Request, res: Response): Promise<void> => {
    const [totalRow, groupRows] = await Promise.all([
      db.select({ c: count() }).from(featuredProfilesTable),
      db
        .select({ group: featuredProfilesTable.group, c: count() })
        .from(featuredProfilesTable)
        .groupBy(featuredProfilesTable.group),
    ]);

    res.json(
      GetAdminContentResponse.parse({
        categories: CATEGORY_COUNT,
        partners: PARTNERS.length,
        labs: LABS.length,
        profilesTotal: toInt(totalRow[0]?.c),
        profilesByGroup: groupRows.map((r) => ({
          group: r.group,
          count: toInt(r.c),
        })),
      }),
    );
  },
);

router.get(
  "/admin/system",
  async (req: Request, res: Response): Promise<void> => {
    const didConfigured = !!process.env.D_ID_API_KEY;
    const googleOauth =
      !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

    // Verify the DB is actually reachable, not just that DATABASE_URL is set.
    let dbReachable = false;
    try {
      await db.select({ c: count() }).from(usersTable);
      dbReachable = true;
    } catch (err) {
      req.log?.warn({ err }, "admin system: db reachability check failed");
    }

    const features = [
      {
        key: "gemini",
        label: "Gemini AI",
        configured: isGeminiConfigured(),
        detail: "Powers copilot chat, research & field notes",
      },
      {
        key: "youtube",
        label: "YouTube Data API",
        configured: isYouTubeConfigured(),
        detail: "Verified science video suggestions",
      },
      {
        key: "d-id",
        label: "D-ID",
        configured: didConfigured,
        detail: "Live talking-avatar streaming",
      },
      {
        key: "elevenlabs",
        label: "ElevenLabs Voice",
        configured: didConfigured,
        detail: "Cloned avatar voices (via D-ID)",
      },
      {
        key: "google-oauth",
        label: "Google Sign-In",
        configured: googleOauth,
        detail: "Continue-with-Google login",
      },
      {
        key: "database",
        label: "PostgreSQL Database",
        configured: dbReachable,
        detail: dbReachable ? "Connected" : "Not reachable",
      },
    ];

    res.json(
      GetAdminSystemResponse.parse({
        features,
        apiHealthy: true,
        uptimeSeconds: Math.floor(process.uptime()),
        liveAvatarSessions: liveAvatarSessionCount(),
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// Profile-ownership claims (Task #92)
// ---------------------------------------------------------------------------

// Shapes a joined claim+profile+user row into the AdminClaim wire format.
function toAdminClaim(row: {
  claim: ProfileClaim;
  profileSlug: string;
  profileName: string;
  claimantName: string | null;
  claimantEmail: string;
}) {
  return {
    id: row.claim.id,
    status: row.claim.status,
    email: row.claim.email,
    profileSlug: row.profileSlug,
    profileName: row.profileName,
    claimantId: row.claim.userId,
    claimantName: row.claimantName,
    claimantEmail: row.claimantEmail,
    createdAt: row.claim.createdAt.toISOString(),
    reviewedAt: row.claim.reviewedAt
      ? row.claim.reviewedAt.toISOString()
      : null,
  };
}

const CLAIM_STATUSES = ["pending", "approved", "denied"] as const;

router.get(
  "/admin/claims",
  async (req: Request, res: Response): Promise<void> => {
    const statusParam =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const status = CLAIM_STATUSES.find((s) => s === statusParam);

    const rows = await db
      .select({
        claim: profileClaimsTable,
        profileSlug: featuredProfilesTable.slug,
        profileName: featuredProfilesTable.name,
        claimantName: usersTable.name,
        claimantEmail: usersTable.email,
      })
      .from(profileClaimsTable)
      .innerJoin(
        featuredProfilesTable,
        eq(profileClaimsTable.profileId, featuredProfilesTable.id),
      )
      .innerJoin(usersTable, eq(profileClaimsTable.userId, usersTable.id))
      .where(status ? eq(profileClaimsTable.status, status) : undefined)
      .orderBy(desc(profileClaimsTable.createdAt));

    const claims = rows.map(toAdminClaim);
    res.json(ListAdminClaimsResponse.parse({ claims, total: claims.length }));
  },
);

// Loads a single claim joined with its profile + claimant, by claim id.
async function loadAdminClaim(id: string) {
  const [row] = await db
    .select({
      claim: profileClaimsTable,
      profileSlug: featuredProfilesTable.slug,
      profileName: featuredProfilesTable.name,
      claimantName: usersTable.name,
      claimantEmail: usersTable.email,
    })
    .from(profileClaimsTable)
    .innerJoin(
      featuredProfilesTable,
      eq(profileClaimsTable.profileId, featuredProfilesTable.id),
    )
    .innerJoin(usersTable, eq(profileClaimsTable.userId, usersTable.id))
    .where(eq(profileClaimsTable.id, id));
  return row ?? null;
}

router.post(
  "/admin/claims/:id/approve",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const admin = req.user as User;

    const row = await loadAdminClaim(id);
    if (!row) {
      res.status(404).json({ error: "Claim not found." });
      return;
    }

    const now = new Date();
    await db.transaction(async (tx) => {
      // Mark this claim approved.
      await tx
        .update(profileClaimsTable)
        .set({
          status: "approved",
          reviewedBy: admin.id,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(profileClaimsTable.id, row.claim.id));

      // Grant ownership (Verified badge + edit rights derive from this).
      await tx
        .update(featuredProfilesTable)
        .set({ ownerUserId: row.claim.userId, updatedAt: now })
        .where(eq(featuredProfilesTable.id, row.claim.profileId));

      // Deny any other still-pending claims on the same profile.
      await tx
        .update(profileClaimsTable)
        .set({
          status: "denied",
          reviewedBy: admin.id,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(profileClaimsTable.profileId, row.claim.profileId),
            eq(profileClaimsTable.status, "pending"),
            ne(profileClaimsTable.id, row.claim.id),
          ),
        );
    });

    const updated = await loadAdminClaim(id);
    res.json(ApproveClaimResponse.parse(toAdminClaim(updated!)));
  },
);

router.post(
  "/admin/claims/:id/deny",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const admin = req.user as User;

    const row = await loadAdminClaim(id);
    if (!row) {
      res.status(404).json({ error: "Claim not found." });
      return;
    }

    const now = new Date();
    await db
      .update(profileClaimsTable)
      .set({
        status: "denied",
        reviewedBy: admin.id,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(profileClaimsTable.id, row.claim.id));

    const updated = await loadAdminClaim(id);
    res.json(DenyClaimResponse.parse(toAdminClaim(updated!)));
  },
);

export default router;
