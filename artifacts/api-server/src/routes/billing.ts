import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import {
  GetCreditBalanceResponse,
  GetCreditEconomyResponse,
  GetBillingPricesResponse,
  CreateCheckoutSessionResponse,
  CreatePortalSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { resolveBillingSubject } from "../lib/credits/subject";
import { getCreditState, nextRenewalDate } from "../lib/credits/credits";
import { buildCreditEconomy } from "../lib/credits/plans";
import { requireAuth } from "../middlewares/requireAuth";
import { getUncachableStripeClient } from "../lib/stripe/stripeClient";

const router: IRouter = Router();

// ── Credit balance (public) ─────────────────────────────────────────────────

router.get(
  "/billing/credits",
  async (req: Request, res: Response): Promise<void> => {
    const subject = await resolveBillingSubject(req, res);
    const renewalDate = nextRenewalDate();

    try {
      const state = await getCreditState(
        subject.subjectKey,
        subject.monthlyGrant,
      );
      res.json(
        GetCreditBalanceResponse.parse({
          plan: subject.plan,
          isGuest: subject.isGuest,
          monthlyGrant: state.monthlyGrant,
          monthlyRemaining: state.monthlyRemaining,
          topupBalance: state.topupBalance,
          totalRemaining: state.totalRemaining,
          renewalDate,
        }),
      );
    } catch (err) {
      req.log?.warn({ err }, "credit balance read failed; returning full grant");
      res.json(
        GetCreditBalanceResponse.parse({
          plan: subject.plan,
          isGuest: subject.isGuest,
          monthlyGrant: subject.monthlyGrant,
          monthlyRemaining: subject.monthlyGrant,
          topupBalance: 0,
          totalRemaining: subject.monthlyGrant,
          renewalDate,
        }),
      );
    }
  },
);

// ── Credit economy blueprint (public) ───────────────────────────────────────

router.get("/billing/economy", (_req: Request, res: Response): void => {
  res.json(GetCreditEconomyResponse.parse(buildCreditEconomy()));
});

// ── Available Stripe prices (public) ────────────────────────────────────────
// Queries the stripe.products / stripe.prices tables managed by stripe-replit-sync.
// Returns empty arrays when the Stripe schema doesn't exist yet — degrades
// gracefully before the integration is connected.

router.get(
  "/billing/prices",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await db.execute(sql`
        SELECT
          pr.id            AS price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.metadata      AS price_meta,
          p.id             AS product_id,
          p.name           AS product_name,
          p.metadata       AS product_meta
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id
        WHERE p.active = true AND pr.active = true
        ORDER BY pr.unit_amount ASC
      `);
      const rows = (result as unknown as { rows?: Array<Record<string, unknown>> }).rows
        ?? (result as unknown as Array<Record<string, unknown>>);

      const subscriptions: unknown[] = [];
      const topups: unknown[] = [];
      const founding: unknown[] = [];

      for (const row of rows) {
        const priceMeta =
          typeof row["price_meta"] === "string"
            ? (JSON.parse(row["price_meta"]) as Record<string, string>)
            : ((row["price_meta"] as Record<string, string> | null) ?? {});
        const productMeta =
          typeof row["product_meta"] === "string"
            ? (JSON.parse(row["product_meta"]) as Record<string, string>)
            : ((row["product_meta"] as Record<string, string> | null) ?? {});

        const type = priceMeta["type"] ?? productMeta["type"];

        const entry = {
          id: String(row["price_id"]),
          productId: String(row["product_id"]),
          name: String(row["product_name"]),
          unitAmount: Number(row["unit_amount"]),
          currency: String(row["currency"]),
          interval:
            row["recurring"] != null
              ? ((row["recurring"] as { interval?: string })["interval"] ??
                null)
              : null,
          planId: priceMeta["planId"] ?? productMeta["planId"] ?? null,
          packId: priceMeta["packId"] ?? productMeta["packId"] ?? null,
          creditAmount:
            priceMeta["creditAmount"] != null
              ? Number(priceMeta["creditAmount"])
              : productMeta["creditAmount"] != null
                ? Number(productMeta["creditAmount"])
                : null,
        };

        if (type === "topup") {
          topups.push(entry);
        } else if (type === "founding") {
          founding.push(entry);
        } else {
          subscriptions.push(entry);
        }
      }

      res.json(GetBillingPricesResponse.parse({ subscriptions, topups, founding }));
    } catch {
      // Stripe schema not ready yet — return empty lists.
      res.json(
        GetBillingPricesResponse.parse({ subscriptions: [], topups: [], founding: [] }),
      );
    }
  },
);

// ── Checkout session (auth required) ────────────────────────────────────────
// Body: { priceId: string }
// Creates a Stripe Checkout session and returns { url } to redirect the client.

router.post(
  "/billing/checkout",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { priceId } = req.body as { priceId?: string };
    if (!priceId || typeof priceId !== "string") {
      res.status(400).json({ error: "priceId is required" });
      return;
    }

    let stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>;
    try {
      stripe = await getUncachableStripeClient();
    } catch (err) {
      req.log.warn({ err }, "Stripe not connected — checkout unavailable");
      res.status(503).json({
        error: "Payment system not available. Please try again later.",
      });
      return;
    }

    const user = req.user!;
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id));

    // Find or create the Stripe customer for this user.
    let customerId = dbUser?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId: customerId })
        .where(eq(usersTable.id, user.id));
    }

    // Determine mode from the price's recurring field.
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? "subscription" : "payment";

    const domain =
      process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      `https://${(process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim()}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${domain}/pricing?checkout=success`,
      cancel_url: `${domain}/pricing?checkout=canceled`,
    });

    res.json(
      CreateCheckoutSessionResponse.parse({ url: session.url ?? "" }),
    );
  },
);

// ── Customer portal session (auth required) ─────────────────────────────────
// POST /api/billing/portal
// Returns a Stripe Billing Portal URL so the user can manage their subscription.

router.post(
  "/billing/portal",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    let stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>;
    try {
      stripe = await getUncachableStripeClient();
    } catch (err) {
      req.log.warn({ err }, "Stripe not connected — portal unavailable");
      res.status(503).json({
        error: "Payment system not available. Please try again later.",
      });
      return;
    }

    const user = req.user!;
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id));

    if (!dbUser?.stripeCustomerId) {
      res.status(400).json({
        error: "No billing account found. Subscribe to a plan first.",
      });
      return;
    }

    const domain =
      process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      `https://${(process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim()}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${domain}/profile`,
    });

    res.json(CreatePortalSessionResponse.parse({ url: session.url }));
  },
);

export default router;
