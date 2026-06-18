import { getUncachableStripeClient } from "./stripeClient";

/**
 * Seeds Stripe with the Citizen Science subscription plans and credit top-up packs.
 * Idempotent — checks for existing products by metadata.productKey before creating.
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 */
async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log("Seeding Stripe products and prices...");

  // ── Subscription plans ───────────────────────────────────────────────────
  const subscriptionPlans = [
    {
      productKey: "cs-researcher",
      name: "Researcher",
      description:
        "For dedicated learners — ~2,000 AI credits/month, full experiment library, talking-avatar conversations.",
      planId: "researcher",
      unitAmount: 2000, // $20.00
    },
    {
      productKey: "cs-pioneer",
      name: "Pioneer",
      description:
        "For power users — ~12,000 AI credits/month, priority access to new labs and features.",
      planId: "pioneer",
      unitAmount: 10000, // $100.00
    },
  ];

  for (const plan of subscriptionPlans) {
    const existing = await stripe.products.search({
      query: `metadata["productKey"]:"${plan.productKey}"`,
    });

    if (existing.data.length > 0) {
      console.log(`  ✓ ${plan.name} plan already exists — skipping`);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        productKey: plan.productKey,
        planId: plan.planId,
        type: "subscription",
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.unitAmount,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: {
        planId: plan.planId,
        type: "subscription",
      },
    });

    console.log(
      `  + Created ${plan.name}: product=${product.id} price=${price.id} ($${plan.unitAmount / 100}/mo)`,
    );
  }

  // ── Credit top-up packs ──────────────────────────────────────────────────
  const topupPacks = [
    {
      productKey: "cs-topup-500",
      packId: "pack-500",
      name: "500 AI Credits",
      description: "One-time purchase of 500 non-expiring AI credits.",
      credits: 500,
      unitAmount: 500, // $5.00
    },
    {
      productKey: "cs-topup-1500",
      packId: "pack-1500",
      name: "1,500 AI Credits",
      description:
        "One-time purchase of 1,500 non-expiring AI credits — best value.",
      credits: 1500,
      unitAmount: 1200, // $12.00
    },
    {
      productKey: "cs-topup-5000",
      packId: "pack-5000",
      name: "5,000 AI Credits",
      description: "One-time purchase of 5,000 non-expiring AI credits.",
      credits: 5000,
      unitAmount: 3500, // $35.00
    },
  ];

  for (const pack of topupPacks) {
    const existing = await stripe.products.search({
      query: `metadata["productKey"]:"${pack.productKey}"`,
    });

    if (existing.data.length > 0) {
      console.log(`  ✓ ${pack.name} pack already exists — skipping`);
      continue;
    }

    const product = await stripe.products.create({
      name: pack.name,
      description: pack.description,
      metadata: {
        productKey: pack.productKey,
        packId: pack.packId,
        creditAmount: String(pack.credits),
        type: "topup",
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pack.unitAmount,
      currency: "usd",
      metadata: {
        packId: pack.packId,
        creditAmount: String(pack.credits),
        type: "topup",
      },
    });

    console.log(
      `  + Created ${pack.name}: product=${product.id} price=${price.id} ($${pack.unitAmount / 100})`,
    );
  }

  console.log("Done! Webhooks will sync these products to the database.");
}

seedProducts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
