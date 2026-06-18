import { eq, sql } from "drizzle-orm";
import { db, usersTable, stripeProcessedEventsTable } from "@workspace/db";
import { addTopupCredits } from "../credits/credits";
import { getStripeSync } from "./stripeClient";
import type { PlanId } from "../credits/plans";

function planIdFromMeta(planId: string | null | undefined): PlanId | null {
  if (planId === "researcher" || planId === "pioneer") return planId;
  return null;
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

        await db
          .update(usersTable)
          .set({ plan: newPlan, stripeSubscriptionId: String(obj.id) })
          .where(eq(usersTable.stripeCustomerId, customerId));

        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────
      case "customer.subscription.deleted": {
        const customerId = obj.customer as string | null;
        if (!customerId) break;

        await db
          .update(usersTable)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(eq(usersTable.stripeCustomerId, customerId));

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

        // Persistent idempotency: insert the event id with a unique constraint.
        // If a duplicate event is delivered (Stripe at-least-once delivery),
        // the insert is a no-op and we skip re-crediting the user.
        const inserted = await db
          .insert(stripeProcessedEventsTable)
          .values({ stripeEventId: eventId, eventType: event.type })
          .onConflictDoNothing()
          .returning({ id: stripeProcessedEventsTable.id });

        if (inserted.length === 0) break; // already processed

        const lineItems = await sync.stripe.checkout.sessions.listLineItems(
          sessionId,
          { limit: 10, expand: ["data.price.product"] },
        );

        let totalCredits = 0;
        for (const item of lineItems.data) {
          const price = item.price;
          const meta: Record<string, string> = price?.metadata ?? {};
          const productMeta: Record<string, string> =
            typeof price?.product === "object"
              ? ((price.product as { metadata?: Record<string, string> })
                  .metadata ?? {})
              : {};

          const creditStr =
            meta["creditAmount"] ?? productMeta["creditAmount"];
          if (creditStr) {
            const qty = item.quantity ?? 1;
            totalCredits += Number(creditStr) * qty;
          }
        }

        if (totalCredits > 0) {
          const [user] = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.stripeCustomerId, customerId));

          if (user) {
            await addTopupCredits(`user:${user.id}`, totalCredits);
          }
        }

        break;
      }

      default:
        break;
    }
  }
}
