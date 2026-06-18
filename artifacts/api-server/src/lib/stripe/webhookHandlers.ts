import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { addTopupCredits } from "../credits/credits";
import { getStripeSync, getStripeCredentials } from "./stripeClient";
import type { PlanId } from "../credits/plans";

function planIdFromMeta(planId: string | null | undefined): PlanId | null {
  if (planId === "researcher" || planId === "pioneer") return planId;
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

    // Resolve credentials and sync instance together.
    const [sync, { webhookSecret }] = await Promise.all([
      getStripeSync(),
      getStripeCredentials(),
    ]);

    // Let stripe-replit-sync persist the raw event data first.
    await sync.processWebhook(payload, signature);

    // Parse the event ourselves for business-side effects.
    if (!webhookSecret) return;

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
        if (!customerId || !sessionId || !sync) break;

        // Idempotency: only credit once per checkout session.
        // We reuse stripe_subscription_id as a cheap idempotency store for
        // one-time payments; instead we mark processed via a dedicated column.
        // Since we don't have a separate table, we guard by checking whether
        // this session was already applied: store the session id in a small
        // idempotency check via the credit account's metadata-equivalent.
        // Simplest safe approach: use a DB advisory lock on a hash of the session id.
        const lockKey = BigInt(
          sessionId
            .split("")
            .reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0),
        );

        const result = await db.execute(
          sql`SELECT pg_try_advisory_xact_lock(${lockKey})`,
        );
        const rows = (result as unknown as { rows?: Array<Record<string, unknown>> }).rows
          ?? (result as unknown as Array<Record<string, unknown>>);
        const acquired = rows[0]?.["pg_try_advisory_xact_lock"];

        // Another concurrent handler already holds the lock → skip (idempotent).
        if (!acquired) break;

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
