import { Router, type IRouter, type Request, type Response } from "express";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  like,
  ne,
  or,
  sql,
} from "drizzle-orm";
import {
  db,
  usersTable,
  creditAccountsTable,
  copilotUsageTable,
  featuredProfilesTable,
  profileClaimsTable,
  messagesTable,
  outreachProspectsTable,
  outreachTemplatesTable,
  outreachSendsTable,
  outreachSettingsTable,
  type User,
  type ProfileClaim,
  type ProspectContactInfo,
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
  SetUserMentorBody,
  SetUserMentorResponse,
  SendSelectedOutreachProspectsBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { requireSuperAdmin } from "../lib/admin/superadmin";
import {
  runOutreachBatch,
  sendToProspect,
  getOutreachSettings,
} from "../lib/outreach/scheduler";
import {
  startSelectedSendJob,
  getSelectedSendJob,
} from "../lib/outreach/sendJobs";
import { isResendConfigured } from "../lib/outreach/resend";
import { ensureDefaultTemplates } from "../lib/outreach/templates";
import { ensureProspectDraft } from "../lib/outreach/draft";
import { researchProspectContact } from "../lib/outreach/research";
import { isLivingEra } from "../lib/profiles/living";
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

// List prices used for the projected-revenue model. Stripe checkout is live and
// subscription webhooks set users.plan, so MRR here is an estimate derived from
// how many users sit on each paid tier × list price — NOT Stripe's settled
// revenue (it excludes proration, discounts, tax, and refunds).
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
          isMentor: usersTable.isMentor,
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
        isMentor: r.isMentor,
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
      isMentor: usersTable.isMentor,
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
    isMentor: row.isMentor,
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

router.patch(
  "/admin/users/:id/mentor",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = SetUserMentorBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "isMentor (boolean) is required." });
      return;
    }
    const id = String(req.params.id);
    if (!UUID_RE.test(id)) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const updated = await db
      .update(usersTable)
      .set({ isMentor: parsed.data.isMentor, updatedAt: new Date() })
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
    res.json(SetUserMentorResponse.parse(user));
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

    // Founding Member sales are real one-time purchases (a live Stripe checkout,
    // not a mailto CTA). Count the PAID founding-type checkout line items synced
    // by stripe-replit-sync and sum their settled totals (cents → dollars).
    // Degrades to zero if the Stripe schema isn't present (integration not
    // connected), so the dashboard never breaks.
    let foundingMembers = 0;
    let foundingRevenue = 0;
    try {
      const foundingRes = await db.execute(sql`
        SELECT
          COALESCE(SUM(li.quantity), 0)     AS members,
          COALESCE(SUM(li.amount_total), 0) AS revenue_cents
        FROM stripe.checkout_session_line_items li
        JOIN stripe.prices pr ON pr.id = li.price
        JOIN stripe.products p ON p.id = pr.product
        JOIN stripe.checkout_sessions cs ON cs.id = li.checkout_session
        WHERE COALESCE(pr.metadata->>'type', p.metadata->>'type') = 'founding'
          AND cs.payment_status = 'paid'
      `);
      const fRow =
        (foundingRes as unknown as { rows?: Array<Record<string, unknown>> })
          .rows?.[0] ??
        (foundingRes as unknown as Array<Record<string, unknown>>)[0];
      if (fRow) {
        foundingMembers = toInt(fRow["members"]);
        foundingRevenue = toInt(fRow["revenue_cents"]) / 100;
      }
    } catch {
      // Stripe schema not ready yet — leave founding figures at zero.
    }

    res.json(
      GetAdminRevenueResponse.parse({
        projectedMrr,
        paidUsers,
        freeUsers,
        conversionRate: registered > 0 ? paidUsers / registered : 0,
        planRevenue,
        foundingMembers,
        foundingRevenue,
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
      {
        key: "resend",
        label: "Resend Email",
        configured: isResendConfigured(),
        detail: "AI-personalised outreach email delivery",
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

      // Deliver any messages that were held for this profile while it was
      // unclaimed: route them to the new owner's inbox (skipping anything the
      // new owner sent before claiming).
      await tx
        .update(messagesTable)
        .set({ recipientId: row.claim.userId })
        .where(
          and(
            eq(messagesTable.profileSlug, row.profileSlug),
            isNull(messagesTable.recipientId),
            ne(messagesTable.senderId, row.claim.userId),
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

// ---------------------------------------------------------------------------
// Outreach: default template seeds (inserted on first GET if missing)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Outreach: Webhook (no auth — verified via svix-signature header)
// ---------------------------------------------------------------------------

// This route is mounted OUTSIDE the requireAuth/requireSuperAdmin chain so
// Resend can POST to it without credentials. The outer router.use("/admin", ...)
// above doesn't apply here because we register on the root router directly.
// We export the handler for mounting in routes/index.ts instead.

export function buildOutreachWebhookHandler() {
  const r = Router();

  r.post(
    "/admin/outreach/webhook",
    async (req: Request, res: Response): Promise<void> => {
      // When RESEND_WEBHOOK_SECRET is set, verify the svix HMAC signature.
      // When it is NOT set, accept the request body for logging only — no DB
      // mutations — so an unconfigured endpoint can't be used to forge state.
      const secret = process.env.RESEND_WEBHOOK_SECRET;

      if (secret) {
        const svixId = req.headers["svix-id"];
        const svixTimestamp = req.headers["svix-timestamp"];
        const svixSignature = req.headers["svix-signature"];

        if (!svixId || !svixTimestamp || !svixSignature) {
          res.status(401).json({ error: "Missing svix headers" });
          return;
        }

        // Basic svix v1 signature verification: HMAC-SHA256 of
        // "<svix-id>.<svix-timestamp>.<body>" with the secret (base64).
        const { createHmac } = await import("node:crypto");
        const rawBody = JSON.stringify(req.body);
        const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
        const keyBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
        const expected = createHmac("sha256", keyBytes)
          .update(toSign)
          .digest("base64");

        const signatures = (svixSignature as string)
          .split(" ")
          .map((s) => s.split(",")[1] ?? "");

        if (!signatures.includes(expected)) {
          req.log?.warn("outreach webhook: signature mismatch");
          res.status(401).json({ error: "Invalid signature" });
          return;
        }
      }

      const event = req.body as {
        type?: string;
        data?: { email_id?: string; to?: string[] };
      };

      const eventType = event.type;
      const messageId = event.data?.email_id;

      req.log?.info({ eventType, messageId, secured: !!secret }, "outreach webhook received");

      // No secret configured: log-only mode — do not mutate DB state from an
      // unauthenticated caller.
      if (!secret) {
        res.json({ ok: true });
        return;
      }

      if (!messageId) {
        res.json({ ok: true });
        return;
      }

      const [send] = await db
        .select()
        .from(outreachSendsTable)
        .where(eq(outreachSendsTable.resendMessageId, messageId))
        .limit(1);

      if (!send) {
        res.json({ ok: true });
        return;
      }

      const now = new Date();

      if (eventType === "email.delivered") {
        await db
          .update(outreachSendsTable)
          .set({ status: "delivered", updatedAt: now })
          .where(eq(outreachSendsTable.id, send.id));
      } else if (
        eventType === "email.bounced" ||
        eventType === "email.complained"
      ) {
        const sendStatus =
          eventType === "email.bounced" ? "bounced" : "complained";

        await db
          .update(outreachSendsTable)
          .set({ status: sendStatus, updatedAt: now })
          .where(eq(outreachSendsTable.id, send.id));

        await db
          .update(outreachProspectsTable)
          .set({ status: "unsubscribed", updatedAt: now })
          .where(eq(outreachProspectsTable.id, send.prospectId));
      }

      res.json({ ok: true });
    },
  );

  return r;
}

// ---------------------------------------------------------------------------
// Outreach: Prospects
// ---------------------------------------------------------------------------

const VALID_PROSPECT_TYPES = [
  "researcher",
  "scientist",
  "investor",
  "user",
] as const;
type ProspectType = (typeof VALID_PROSPECT_TYPES)[number];
const VALID_PROSPECT_STATUSES = [
  "pending",
  "contacted",
  "replied",
  "unsubscribed",
] as const;

function isValidProspectType(v: unknown): v is ProspectType {
  return VALID_PROSPECT_TYPES.includes(v as ProspectType);
}

function toProspectWire(
  p: {
    id: string;
    name: string;
    email: string | null;
    type: string;
    notes: string;
    status: string;
    profileId: string | null;
    source: string;
    reviewState: string;
    contactInfo: ProspectContactInfo;
    researchedAt: Date | null;
    draftSubject: string | null;
    draftBody: string | null;
    createdAt: Date;
    lastContactedAt: Date | null;
    updatedAt: Date;
  },
  profileSlug?: string | null,
) {
  return {
    id: p.id,
    name: p.name,
    email: p.email ?? null,
    type: p.type,
    notes: p.notes,
    status: p.status,
    profileId: p.profileId ?? null,
    profileSlug: profileSlug ?? null,
    source: p.source,
    reviewState: p.reviewState,
    contactInfo: {
      email: p.contactInfo?.email ?? null,
      website: p.contactInfo?.website ?? null,
      contactPage: p.contactInfo?.contactPage ?? null,
      socials: p.contactInfo?.socials ?? [],
      notes: p.contactInfo?.notes ?? null,
    },
    researchedAt: p.researchedAt ? p.researchedAt.toISOString() : null,
    draftSubject: p.draftSubject ?? null,
    draftBody: p.draftBody ?? null,
    createdAt: p.createdAt.toISOString(),
    lastContactedAt: p.lastContactedAt ? p.lastContactedAt.toISOString() : null,
    updatedAt: p.updatedAt.toISOString(),
  };
}

// Map a directory profile's `group` onto a sensible outreach prospect `type`.
function prospectTypeForGroup(group: string): ProspectType {
  switch (group) {
    case "scientist":
      return "scientist";
    case "inventor":
      return "scientist";
    case "thought_leader":
      return "researcher";
    case "organization":
      return "user";
    default:
      return "scientist";
  }
}

// Accept a partial, user-edited contact-info object from the admin modal and
// normalise it into the stored shape (trimmed strings, capped socials list).
function sanitizeContactInfoInput(raw: unknown): ProspectContactInfo {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (v: unknown, max: number): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t ? t.slice(0, max) : null;
  };
  const socials = Array.isArray(o.socials)
    ? o.socials
        .map((s) => str(s, 200))
        .filter((s): s is string => !!s)
        .slice(0, 8)
    : [];
  const info: ProspectContactInfo = {};
  const email = str(o.email, 200);
  const website = str(o.website, 300);
  const contactPage = str(o.contactPage, 300);
  const notes = str(o.notes, 600);
  if (email) info.email = email;
  if (website) info.website = website;
  if (contactPage) info.contactPage = contactPage;
  if (socials.length) info.socials = socials;
  if (notes) info.notes = notes;
  return info;
}

router.get(
  "/admin/outreach/prospects",
  async (req: Request, res: Response): Promise<void> => {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const typeFilter =
      typeof req.query.type === "string" ? req.query.type.trim() : "";
    const statusFilter =
      typeof req.query.status === "string" ? req.query.status.trim() : "";
    const page = Math.max(1, toInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, toInt(req.query.pageSize) || 25));
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(outreachProspectsTable.email, `%${search}%`),
          ilike(outreachProspectsTable.name, `%${search}%`),
        ),
      );
    }
    if (typeFilter && isValidProspectType(typeFilter)) {
      conditions.push(eq(outreachProspectsTable.type, typeFilter));
    }
    if (
      statusFilter &&
      VALID_PROSPECT_STATUSES.includes(
        statusFilter as (typeof VALID_PROSPECT_STATUSES)[number],
      )
    ) {
      conditions.push(
        eq(
          outreachProspectsTable.status,
          statusFilter as (typeof VALID_PROSPECT_STATUSES)[number],
        ),
      );
    }

    const where = conditions.length
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

    const [rows, totalRow] = await Promise.all([
      db
        .select({
          prospect: outreachProspectsTable,
          profileSlug: featuredProfilesTable.slug,
        })
        .from(outreachProspectsTable)
        .leftJoin(
          featuredProfilesTable,
          eq(outreachProspectsTable.profileId, featuredProfilesTable.id),
        )
        .where(where)
        .orderBy(desc(outreachProspectsTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ c: count() }).from(outreachProspectsTable).where(where),
    ]);

    res.json({
      prospects: rows.map((r) => toProspectWire(r.prospect, r.profileSlug)),
      total: toInt(totalRow[0]?.c),
      page,
      pageSize,
    });
  },
);

router.post(
  "/admin/outreach/prospects",
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, type, notes } = req.body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      !isValidProspectType(type)
    ) {
      res.status(400).json({ error: "name, email, and valid type are required." });
      return;
    }

    try {
      const [row] = await db
        .insert(outreachProspectsTable)
        .values({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          type: type as ProspectType,
          notes: typeof notes === "string" ? notes.trim() : "",
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(toProspectWire(row));
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("unique")
      ) {
        res.status(409).json({ error: "A prospect with this email already exists." });
        return;
      }
      throw err;
    }
  },
);

router.post(
  "/admin/outreach/prospects/bulk",
  async (req: Request, res: Response): Promise<void> => {
    const { csv } = req.body as { csv?: string };
    if (typeof csv !== "string" || !csv.trim()) {
      res.status(400).json({ error: "csv is required." });
      return;
    }

    const lines = csv.trim().split(/\r?\n/);
    // Skip header row if it matches the expected pattern
    const startIdx =
      lines[0]?.toLowerCase().includes("email") ||
      lines[0]?.toLowerCase().includes("name")
        ? 1
        : 0;

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const line of lines.slice(startIdx)) {
      if (!line.trim()) continue;

      // Parse CSV: handle optional quoted fields
      const parts = line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((p) => p.trim().replace(/^"|"$/g, ""));

      const [rawName, rawEmail, rawType, rawNotes] = parts;

      if (!rawName || !rawEmail) {
        errors.push(`Skipped row (missing name or email): ${line.slice(0, 60)}`);
        skipped++;
        continue;
      }

      const emailVal = rawEmail.trim().toLowerCase();
      const nameVal = rawName.trim();
      const typeVal =
        rawType && isValidProspectType(rawType.trim().toLowerCase())
          ? (rawType.trim().toLowerCase() as ProspectType)
          : "user";
      const notesVal = rawNotes?.trim() ?? "";

      try {
        const rows = await db
          .insert(outreachProspectsTable)
          .values({
            name: nameVal,
            email: emailVal,
            type: typeVal,
            notes: notesVal,
            updatedAt: new Date(),
          })
          .onConflictDoNothing()
          .returning({ id: outreachProspectsTable.id });
        if (rows.length > 0) {
          imported++;
        } else {
          skipped++; // Duplicate email — silently skipped by conflict rule
        }
      } catch {
        errors.push(`Error importing ${emailVal}`);
        skipped++;
      }
    }

    res.json({ imported, skipped, errors });
  },
);

router.patch(
  "/admin/outreach/prospects/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const {
      name,
      email,
      type,
      notes,
      status,
      reviewState,
      contactInfo,
      draftSubject,
      draftBody,
    } = req.body as Record<string, unknown>;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    // Email is nullable: an explicit null/empty string clears it, a non-empty
    // string sets it. `undefined` (key absent) leaves it untouched.
    if (email === null || (typeof email === "string" && !email.trim())) {
      updates.email = null;
    } else if (typeof email === "string" && email.trim()) {
      updates.email = email.trim().toLowerCase();
    }
    if (isValidProspectType(type)) updates.type = type;
    if (typeof notes === "string") updates.notes = notes.trim();
    if (
      typeof status === "string" &&
      VALID_PROSPECT_STATUSES.includes(
        status as (typeof VALID_PROSPECT_STATUSES)[number],
      )
    ) {
      updates.status = status;
    }
    if (reviewState === "needs_review" || reviewState === "approved") {
      updates.reviewState = reviewState;
    }
    if (contactInfo !== undefined) {
      updates.contactInfo = sanitizeContactInfoInput(contactInfo);
    }
    // Draft copy: null/empty clears, string sets, absent leaves untouched (the
    // email convention). Sends only use a draft when BOTH halves are set, so
    // clearing one safely disables it.
    if (
      draftSubject === null ||
      (typeof draftSubject === "string" && !draftSubject.trim())
    ) {
      updates.draftSubject = null;
    } else if (typeof draftSubject === "string") {
      updates.draftSubject = draftSubject.trim();
    }
    if (
      draftBody === null ||
      (typeof draftBody === "string" && !draftBody.trim())
    ) {
      updates.draftBody = null;
    } else if (typeof draftBody === "string") {
      updates.draftBody = draftBody.trim();
    }

    const [updated] = await db
      .update(outreachProspectsTable)
      .set(updates)
      .where(eq(outreachProspectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }

    const slug = updated.profileId
      ? (
          await db
            .select({ slug: featuredProfilesTable.slug })
            .from(featuredProfilesTable)
            .where(eq(featuredProfilesTable.id, updated.profileId))
            .limit(1)
        )[0]?.slug ?? null
      : null;

    res.json(toProspectWire(updated, slug));
  },
);

router.delete(
  "/admin/outreach/prospects/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const deleted = await db
      .delete(outreachProspectsTable)
      .where(eq(outreachProspectsTable.id, id))
      .returning({ id: outreachProspectsTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }

    res.json({ message: "Prospect deleted." });
  },
);

// ---------------------------------------------------------------------------
// Outreach: Directory pipeline (queue / research / detail / review / send)
// ---------------------------------------------------------------------------

// Queue every LIVING directory figure as a directory-sourced prospect, in the
// `needs_review` state with no email yet. Deceased figures are never queued.
// Idempotent: re-running only inserts profiles that aren't already prospects
// (unique index on profile_id + onConflictDoNothing).
router.post(
  "/admin/outreach/queue-directory",
  async (_req: Request, res: Response): Promise<void> => {
    const profiles = await db
      .select({
        id: featuredProfilesTable.id,
        name: featuredProfilesTable.name,
        group: featuredProfilesTable.group,
        era: featuredProfilesTable.era,
        summary: featuredProfilesTable.summary,
      })
      .from(featuredProfilesTable);

    const living = profiles.filter((p) => isLivingEra(p.era));

    let queued = 0;
    for (const p of living) {
      const rows = await db
        .insert(outreachProspectsTable)
        .values({
          name: p.name,
          email: null,
          type: prospectTypeForGroup(p.group),
          notes: p.summary?.slice(0, 500) ?? "",
          status: "pending",
          profileId: p.id,
          source: "directory",
          reviewState: "needs_review",
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: outreachProspectsTable.id });
      if (rows.length > 0) queued++;
    }

    res.json({
      livingCount: living.length,
      totalProfiles: profiles.length,
      queued,
      skipped: living.length - queued,
    });
  },
);

// Run one paced, resumable batch of AI contact research over directory prospects
// that haven't been researched yet. Stores results in contactInfo + stamps
// researchedAt only on success, so an interrupted run is safely re-runnable.
router.post(
  "/admin/outreach/research-contacts",
  async (req: Request, res: Response): Promise<void> => {
    if (!isGeminiConfigured()) {
      res
        .status(503)
        .json({ error: "GEMINI_API_KEY is not configured. Cannot research contacts." });
      return;
    }

    // Cap 25: with ~5-8s per grounded call + 1.2s pacing this stays under the
    // Cloud Run default request timeout while clearing a full queue in ~14
    // clicks instead of ~70.
    const limit = Math.min(25, Math.max(1, toInt(req.body?.limit) || 5));

    const rows = await db
      .select({
        prospect: outreachProspectsTable,
        field: featuredProfilesTable.field,
        era: featuredProfilesTable.era,
      })
      .from(outreachProspectsTable)
      .leftJoin(
        featuredProfilesTable,
        eq(outreachProspectsTable.profileId, featuredProfilesTable.id),
      )
      .where(
        and(
          eq(outreachProspectsTable.source, "directory"),
          isNull(outreachProspectsTable.researchedAt),
        ),
      )
      .orderBy(outreachProspectsTable.createdAt)
      .limit(limit);

    let researched = 0;
    let withEmail = 0;
    let failed = 0;

    for (const r of rows) {
      try {
        const info = await researchProspectContact({
          name: r.prospect.name,
          field: r.field,
          era: r.era,
        });
        await db
          .update(outreachProspectsTable)
          .set({
            contactInfo: info,
            researchedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(outreachProspectsTable.id, r.prospect.id));
        researched++;
        if (info.email) withEmail++;
        // Gentle pacing to respect the Gemini free-tier rate limits.
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch (err) {
        failed++;
        req.log.warn(
          { err, prospectId: r.prospect.id },
          "outreach: contact research failed for prospect",
        );
      }
    }

    const [remainingRow] = await db
      .select({ c: count() })
      .from(outreachProspectsTable)
      .where(
        and(
          eq(outreachProspectsTable.source, "directory"),
          isNull(outreachProspectsTable.researchedAt),
        ),
      );

    res.json({
      researched,
      withEmail,
      failed,
      remaining: toInt(remainingRow?.c),
    });
  },
);

// Full prospect detail joined with its directory profile (portrait/field/era/
// summary/slug) for the admin review modal.
router.get(
  "/admin/outreach/prospects/:id/detail",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const [row] = await db
      .select({
        prospect: outreachProspectsTable,
        profileSlug: featuredProfilesTable.slug,
        profileName: featuredProfilesTable.name,
        profileField: featuredProfilesTable.field,
        profileEra: featuredProfilesTable.era,
        profileSummary: featuredProfilesTable.summary,
        profileImageUrl: featuredProfilesTable.imageUrl,
      })
      .from(outreachProspectsTable)
      .leftJoin(
        featuredProfilesTable,
        eq(outreachProspectsTable.profileId, featuredProfilesTable.id),
      )
      .where(eq(outreachProspectsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }

    res.json({
      ...toProspectWire(row.prospect, row.profileSlug),
      profile: row.prospect.profileId
        ? {
            slug: row.profileSlug ?? null,
            name: row.profileName ?? null,
            field: row.profileField ?? null,
            era: row.profileEra ?? null,
            summary: row.profileSummary ?? null,
            imageUrl: row.profileImageUrl ?? null,
          }
        : null,
    });
  },
);

// Render (but do not send) the personalised email this prospect would receive,
// so the admin can review copy before approving/sending.
router.post(
  "/admin/outreach/prospects/:id/preview",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const [prospect] = await db
      .select()
      .from(outreachProspectsTable)
      .where(eq(outreachProspectsTable.id, id))
      .limit(1);

    if (!prospect) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }

    // The stored draft IS the preview: generate-and-queue it on first view so
    // what the admin sees here is exactly what a send delivers — never a
    // throwaway regeneration that a later send would silently replace.
    try {
      const draft = await ensureProspectDraft(prospect.id);
      res.json({
        subject: draft.subject,
        body: draft.body,
        to: prospect.email ?? null,
      });
    } catch (err) {
      res.status(500).json({
        error: (err as Error)?.message ?? "Couldn't generate the email draft.",
      });
    }
  },
);

// Approve a prospect for sending. Optionally promote a researched contactInfo
// email onto the prospect's real `email` column so the scheduler can reach them.
// Refuses to approve without a confirmed email (the scheduler gate would skip it
// anyway — fail loudly here instead).
router.post(
  "/admin/outreach/prospects/:id/approve",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const [prospect] = await db
      .select()
      .from(outreachProspectsTable)
      .where(eq(outreachProspectsTable.id, id))
      .limit(1);

    if (!prospect) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }

    // Resolve the email to approve with: an explicit body email wins, else the
    // existing column, else the researched contactInfo email.
    const bodyEmail =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const email =
      bodyEmail || prospect.email || prospect.contactInfo?.email || null;

    if (!email) {
      res.status(400).json({
        error:
          "Cannot approve a prospect with no email. Add or research a contact email first.",
      });
      return;
    }

    const [updated] = await db
      .update(outreachProspectsTable)
      .set({ email, reviewState: "approved", updatedAt: new Date() })
      .where(eq(outreachProspectsTable.id, id))
      .returning();

    // Generate the personalised email now so it's queued ready to send: the
    // editor opens pre-filled and sends deliver this exact copy. A generation
    // failure must not fail the approval — preview/send will retry it.
    let draft: { subject: string; body: string } | null = null;
    try {
      draft = await ensureProspectDraft(updated.id);
    } catch (err) {
      req.log?.warn(
        { err, prospectId: updated.id },
        "outreach: draft generation on approve failed",
      );
    }

    const slug = updated.profileId
      ? (
          await db
            .select({ slug: featuredProfilesTable.slug })
            .from(featuredProfilesTable)
            .where(eq(featuredProfilesTable.id, updated.profileId))
            .limit(1)
        )[0]?.slug ?? null
      : null;

    res.json({
      ...toProspectWire(updated, slug),
      ...(draft ? { draftSubject: draft.subject, draftBody: draft.body } : {}),
    });
  },
);

// Send a single prospect's outreach email immediately. Enforces the same gate as
// the scheduler: must be approved AND have a confirmed email.
router.post(
  "/admin/outreach/prospects/:id/send",
  async (req: Request, res: Response): Promise<void> => {
    if (!isResendConfigured()) {
      res
        .status(503)
        .json({ error: "RESEND_API_KEY is not configured. Cannot send emails." });
      return;
    }

    const id = String(req.params.id);
    const [prospect] = await db
      .select()
      .from(outreachProspectsTable)
      .where(eq(outreachProspectsTable.id, id))
      .limit(1);

    if (!prospect) {
      res.status(404).json({ error: "Prospect not found." });
      return;
    }
    if (prospect.reviewState !== "approved") {
      res
        .status(400)
        .json({ error: "Prospect must be approved before sending." });
      return;
    }
    if (!prospect.email) {
      res
        .status(400)
        .json({ error: "Prospect has no confirmed email to send to." });
      return;
    }

    const settings = await getOutreachSettings();
    try {
      await sendToProspect(prospect, settings);
    } catch (err) {
      req.log.error({ err, prospectId: id }, "outreach: manual send failed");
      // Surface the real message — this is an admin-only route and the claim
      // errors carry actionable guidance (e.g. how to resend).
      res.status(502).json({
        error: (err as Error)?.message ?? "Failed to send email. Please try again.",
      });
      return;
    }

    res.json({ message: "Email sent.", prospectId: id });
  },
);

// Batch "generate & send": the admin's selection acts as approval — each
// selected pending prospect is approved in place, its personalised draft is
// generated once and persisted, and the email is sent through the exact same
// claim-first pipeline as the scheduler. Per-prospect results tell the admin
// exactly who was sent and who was skipped (and why).
router.post(
  "/admin/outreach/prospects/send-selected",
  async (req: Request, res: Response): Promise<void> => {
    if (!isResendConfigured()) {
      res
        .status(503)
        .json({ error: "RESEND_API_KEY is not configured. Cannot send emails." });
      return;
    }

    const parsed = SendSelectedOutreachProspectsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    // Long-running: runs as a background job — 202 immediately, and the UI
    // polls the job endpoint for live per-prospect progress.
    const job = startSelectedSendJob([...new Set(parsed.data.ids)]);
    res.status(202).json({ jobId: job.id, total: job.total });
  },
);

// Live status of a batch send job (polled by the campaigns UI). Ephemeral:
// finished jobs expire after an hour; the prospects table is always the
// authoritative record of what was sent.
router.get(
  "/admin/outreach/send-jobs/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const job = getSelectedSendJob(String(req.params.jobId));
    if (!job) {
      res.status(404).json({ error: "Job not found or expired." });
      return;
    }
    res.json({
      status: job.status,
      total: job.total,
      sent: job.sent,
      failed: job.failed,
      results: job.results,
    });
  },
);

// ---------------------------------------------------------------------------
// Outreach: Templates
// ---------------------------------------------------------------------------

function toTemplateWire(t: {
  id: string;
  type: string;
  subjectTemplate: string;
  bodyTemplate: string;
  updatedAt: Date;
}) {
  return {
    id: t.id,
    type: t.type,
    subjectTemplate: t.subjectTemplate,
    bodyTemplate: t.bodyTemplate,
    updatedAt: t.updatedAt.toISOString(),
  };
}

router.get(
  "/admin/outreach/templates",
  async (_req: Request, res: Response): Promise<void> => {
    await ensureDefaultTemplates();
    const rows = await db
      .select()
      .from(outreachTemplatesTable)
      .orderBy(outreachTemplatesTable.type);
    res.json(rows.map(toTemplateWire));
  },
);

router.patch(
  "/admin/outreach/templates/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { subjectTemplate, bodyTemplate } = req.body as Record<
      string,
      unknown
    >;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof subjectTemplate === "string" && subjectTemplate.trim())
      updates.subjectTemplate = subjectTemplate.trim();
    if (typeof bodyTemplate === "string" && bodyTemplate.trim())
      updates.bodyTemplate = bodyTemplate.trim();

    const [updated] = await db
      .update(outreachTemplatesTable)
      .set(updates)
      .where(eq(outreachTemplatesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Template not found." });
      return;
    }

    res.json(toTemplateWire(updated));
  },
);

// ---------------------------------------------------------------------------
// Outreach: Send history
// ---------------------------------------------------------------------------

router.get(
  "/admin/outreach/sends",
  async (req: Request, res: Response): Promise<void> => {
    const statusFilter =
      typeof req.query.status === "string" ? req.query.status.trim() : "";
    const page = Math.max(1, toInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, toInt(req.query.pageSize) || 25));
    const offset = (page - 1) * pageSize;

    const VALID_SEND_STATUSES = ["pending", "delivered", "bounced", "complained"];

    const where =
      statusFilter && VALID_SEND_STATUSES.includes(statusFilter)
        ? eq(
            outreachSendsTable.status,
            statusFilter as "pending" | "delivered" | "bounced" | "complained",
          )
        : undefined;

    const [rows, totalRow] = await Promise.all([
      db
        .select({
          id: outreachSendsTable.id,
          prospectId: outreachSendsTable.prospectId,
          prospectName: outreachProspectsTable.name,
          prospectEmail: outreachProspectsTable.email,
          prospectType: outreachProspectsTable.type,
          subject: outreachSendsTable.subject,
          status: outreachSendsTable.status,
          resendMessageId: outreachSendsTable.resendMessageId,
          sentAt: outreachSendsTable.sentAt,
        })
        .from(outreachSendsTable)
        .innerJoin(
          outreachProspectsTable,
          eq(outreachSendsTable.prospectId, outreachProspectsTable.id),
        )
        .where(where)
        .orderBy(desc(outreachSendsTable.sentAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ c: count() })
        .from(outreachSendsTable)
        .where(where),
    ]);

    res.json({
      sends: rows.map((r) => ({
        id: r.id,
        prospectId: r.prospectId,
        prospectName: r.prospectName,
        prospectEmail: r.prospectEmail,
        prospectType: r.prospectType,
        subject: r.subject,
        status: r.status,
        resendMessageId: r.resendMessageId,
        sentAt: r.sentAt.toISOString(),
      })),
      total: toInt(totalRow[0]?.c),
      page,
      pageSize,
    });
  },
);

// ---------------------------------------------------------------------------
// Outreach: Trigger immediate batch
// ---------------------------------------------------------------------------

router.post(
  "/admin/outreach/send-now",
  async (req: Request, res: Response): Promise<void> => {
    if (!isResendConfigured()) {
      res
        .status(503)
        .json({ error: "RESEND_API_KEY is not configured. Cannot send emails." });
      return;
    }

    const result = await runOutreachBatch();
    res.json(result);
  },
);

// ---------------------------------------------------------------------------
// Outreach: Settings
// ---------------------------------------------------------------------------

async function getOrCreateSettings() {
  const [row] = await db.select().from(outreachSettingsTable).limit(1);
  if (row) return row;
  const [inserted] = await db
    .insert(outreachSettingsTable)
    .values({ id: 1, updatedAt: new Date() })
    .onConflictDoNothing()
    .returning();
  return (
    inserted ?? {
      id: 1,
      sendHour: 9,
      batchSize: 20,
      fromEmail: "daniel@citizen-science.org",
      fromName: "Daniel (Citizen Science)",
      updatedAt: new Date(),
    }
  );
}

function toSettingsWire(s: {
  sendHour: number;
  batchSize: number;
  fromEmail: string;
  fromName: string;
}) {
  return {
    sendHour: s.sendHour,
    batchSize: s.batchSize,
    fromEmail: s.fromEmail,
    fromName: s.fromName,
  };
}

router.get(
  "/admin/outreach/settings",
  async (_req: Request, res: Response): Promise<void> => {
    const settings = await getOrCreateSettings();
    res.json(toSettingsWire(settings));
  },
);

router.patch(
  "/admin/outreach/settings",
  async (req: Request, res: Response): Promise<void> => {
    const { sendHour, batchSize, fromEmail, fromName } = req.body as Record<
      string,
      unknown
    >;

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof sendHour === "number" && sendHour >= 0 && sendHour <= 23)
      updates.sendHour = Math.floor(sendHour);
    if (typeof batchSize === "number" && batchSize >= 1 && batchSize <= 500)
      updates.batchSize = Math.floor(batchSize);
    if (typeof fromEmail === "string" && fromEmail.trim())
      updates.fromEmail = fromEmail.trim();
    if (typeof fromName === "string" && fromName.trim())
      updates.fromName = fromName.trim();

    await db
      .insert(outreachSettingsTable)
      .values({ id: 1, ...updates, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: outreachSettingsTable.id,
        set: updates,
      });

    const settings = await getOrCreateSettings();
    res.json(toSettingsWire(settings));
  },
);

export default router;
