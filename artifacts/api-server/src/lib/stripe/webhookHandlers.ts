import { and, eq, sql } from "drizzle-orm";
import { db, usersTable, stripeProcessedEventsTable } from "@workspace/db";
import { addTopupCredits } from "../credits/credits";
import { getStripeSync } from "./stripeClient";
import {
  grantFoundingToUser,
  planRank,
  recordUnclaimedFoundingPurchase,
} from "./foundingClaims";
import type { PlanId } from "../credits/plans";

function planIdFromMeta(planId: string | null | undefined): PlanId | null {
  if (planId === "researcher" || planId === "pioneer") return planId;
  return null;
}

/** A minimal shape of a Stripe checkout line item (price metadata + quantity). */
export type CheckoutLineItem = {
  quantity?: number | null;
  price?: {
    metadata?: Record<string, string> | null;
    // The product may be expanded (object) or just an id (string).
    product?: unknown;
  } | null;
};

/**
 * Compute the effects of a one-time checkout from its line items in a SINGLE
 * pass: the total credits to grant (top-up packs) and the lifetime plan to set
 * (founding member). Each line item contributes exactly once — a founding item
 * grants its plan; any other item carrying a `creditAmount` grants that many
 * credits (× quantity). Pure and side-effect free so it is easy to unit test.
 */
export function summarizeCheckoutLineItems(items: CheckoutLineItem[]): {
  totalCredits: number;
  purchasedPlanId: string | null;
} {
  let totalCredits = 0;
  let purchasedPlanId: string | null = null;

  for (const item of items) {
    const price = item.price;
    const meta: Record<string, string> = price?.metadata ?? {};
    const productMeta: Record<string, string> =
      typeof price?.product === "object" && price?.product !== null
        ? ((price.product as { metadata?: Record<string, string> }).metadata ??
          {})
        : {};

    const itemType = meta["type"] ?? productMeta["type"];
    const creditStr = meta["creditAmount"] ?? productMeta["creditAmount"];
    const planStr = meta["planId"] ?? productMeta["planId"];

    if (itemType === "founding" && planStr) {
      purchasedPlanId = planStr;
    } else if (creditStr) {
      const qty = item.quantity ?? 1;
      totalCredits += Number(creditStr) * qty;
    }
  }

  return { totalCredits, purchasedPlanId };
}

/**
 * Resolve the webhook signing secret. Prefers the managed-webhook secret
 * stored in stripe."_managed_webhooks" by stripe-replit-sync (always present
 * when the managed webhook flow ran), falling back to the config-level secret.
 * This avoids depending on the Replit connector exposing webhook_secret.
 */
async function resolveManagedWebhookSecret(): Promise<string | null> {
  try {
    const result = await db.execute(
      sql`SELECT secret FROM stripe."_managed_webhooks" LIMIT 1`,
    );
    const rows = (
      result as unknown as { rows?: Array<Record<string, unknown>> }
    ).rows ?? (result as unknown as Array<Record<string, unknown>>);
    const secret = rows[0]?.["secret"];
    if (typeof secret === "string" && secret.length > 0) return secret;
  } catch {
    // Table may not exist yet during first boot
  }
  return null;
}

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
          "Received type: " +
          typeof payload +
          ". " +
          "This usually means express.json() parsed the body before reaching this handler. " +
          "FIX: Ensure webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    const sync = await getStripeSync();

    // Let stripe-replit-sync persist the raw event data first.
    await sync.processWebhook(payload, signature);

    // Resolve the webhook signing secret from the managed-webhook table so
    // business-logic effects work even when the connector doesn't expose
    // webhook_secret in its settings.
    const webhookSecret = await resolveManagedWebhookSecret();
    if (!webhookSecret) {
      // No secret available — can't verify signature for business logic.
      // stripe-replit-sync already persisted the event; log and return.
      return;
    }

    const event = await sync.stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );

    await WebhookHandlers.handleBusinessLogic(event, sync);
  }

  static async handleBusinessLogic(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: { id?: string; type: string; data: { object: any } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sync?: { stripe: any },
  ): Promise<void> {
    const obj = event.data.object;

    switch (event.type) {
      // ── Subscription created or updated ─────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const customerId = obj.customer as string | null;
        if (!customerId) break;

        const priceMeta: Record<string, string> =
          obj.items?.data?.[0]?.price?.metadata ?? {};
        const planId = planIdFromMeta(priceMeta["planId"]);

        const isActive =
          obj.status === "active" || obj.status === "trialing";
        const newPlan: string = isActive && planId ? planId : "free";

        // Founding members have a LIFETIME plan floor: a subscription event
        // (including a delayed one) can raise their plan but never lower it.
        const [subUser] = await db
          .select({
            id: usersTable.id,
            plan: usersTable.plan,
            foundingMember: usersTable.foundingMember,
          })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId, customerId));

        if (subUser) {
          const keepPlan =
            subUser.foundingMember &&
            planRank(newPlan) < planRank(subUser.plan);
          await db
            .update(usersTable)
            .set({
              plan: keepPlan ? subUser.plan : newPlan,
              stripeSubscriptionId: String(obj.id),
            })
            .where(eq(usersTable.id, subUser.id));
        }

        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────
      case "customer.subscription.deleted": {
        const customerId = obj.customer as string | null;
        if (!customerId) break;

        // Founding members keep their lifetime plan when a subscription is
        // cancelled — the cancellation only detaches the subscription id.
        await db
          .update(usersTable)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(
            and(
              eq(usersTable.stripeCustomerId, customerId),
              eq(usersTable.foundingMember, false),
            ),
          );
        await db
          .update(usersTable)
          .set({ stripeSubscriptionId: null })
          .where(
            and(
              eq(usersTable.stripeCustomerId, customerId),
              eq(usersTable.foundingMember, true),
            ),
          );

        break;
      }

      // ── One-time payment completed (top-up packs) ────────────────────────
      case "checkout.session.completed": {
        if (obj.mode !== "payment") break;
        if (obj.payment_status !== "paid") break;

        const customerId = obj.customer as string | null;
        const sessionId = obj.id as string | null;
        const eventId = event.id ?? sessionId;

        if (!customerId || !sessionId || !sync || !eventId) break;

        // Fetch line items BEFORE claiming the event — a Stripe API failure
        // here means the event was never marked, so Stripe's automatic retry
        // reprocesses it naturally.
        const lineItems = await sync.stripe.checkout.sessions.listLineItems(
          sessionId,
          { limit: 10, expand: ["data.price.product"] },
        );

        // Single pass over the line items: founding → lifetime plan upgrade,
        // top-up packs → credits. Each item contributes exactly once (a prior
        // bug summed credits across two loops, double-crediting top-ups).
        const { totalCredits, purchasedPlanId } = summarizeCheckoutLineItems(
          lineItems.data as CheckoutLineItem[],
        );

        // Persistent idempotency + ownership: the unique-constrained insert is
        // the atomic claim on this event. A duplicate delivery (Stripe is
        // at-least-once) conflicts and skips, so effects run exactly once.
        const inserted = await db
          .insert(stripeProcessedEventsTable)
          .values({ stripeEventId: eventId, eventType: event.type })
          .onConflictDoNothing()
          .returning({ id: stripeProcessedEventsTable.id });

        if (inserted.length === 0) break; // already processed / in flight

        try {
          // All effects in ONE transaction: plan grant, customer link, claim
          // park, and top-up credits either all apply or none do — a retry
          // after a failure can never double-credit or half-grant.
          await db.transaction(async (tx) => {
            let [user] = await tx
              .select({ id: usersTable.id })
              .from(usersTable)
              .where(eq(usersTable.stripeCustomerId, customerId));

            // Guest founding checkout has no account linked to the Stripe
            // customer — fall back to the email Stripe collected at checkout.
            // Match → grant now; no match → park the purchase as a claim the
            // buyer picks up when they register or log in with that email.
            if (!user && purchasedPlanId) {
              const email =
                typeof obj.customer_details?.email === "string"
                  ? obj.customer_details.email.trim().toLowerCase()
                  : null;
              if (email) {
                const [byEmail] = await tx
                  .select({ id: usersTable.id })
                  .from(usersTable)
                  .where(eq(usersTable.email, email));
                if (byEmail) {
                  user = byEmail;
                } else {
                  await recordUnclaimedFoundingPurchase(
                    {
                      email,
                      planId: purchasedPlanId,
                      stripeCustomerId: customerId,
                      stripeSessionId: sessionId,
                    },
                    tx,
                  );
                }
              }
            }

            if (user) {
              // Grant lifetime plan upgrade (founding member). Never
              // downgrades a higher plan; flags the account as founding.
              if (purchasedPlanId) {
                await grantFoundingToUser(
                  user.id,
                  purchasedPlanId,
                  customerId,
                  tx,
                );
              }
              // Add top-up credits (credit packs).
              if (totalCredits > 0) {
                await addTopupCredits(`user:${user.id}`, totalCredits, tx);
              }
            }
          });
        } catch (err) {
          // The event was marked processed above but its effects rolled back.
          // Remove the marker so Stripe's retry re-enters and completes the
          // purchase — otherwise it would be silently lost. Safe against
          // concurrent deliveries: while our marker exists, other deliveries
          // conflict-and-skip; only after our delete can one re-claim it.
          await db
            .delete(stripeProcessedEventsTable)
            .where(eq(stripeProcessedEventsTable.stripeEventId, eventId));
          throw err;
        }

        break;
      }

      default:
        break;
    }
  }
}
