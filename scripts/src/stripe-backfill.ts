import { getStripeSync } from "./stripeClient";

async function main() {
  const sync = await getStripeSync();
  console.log("Running Stripe backfill for products and prices...");
  await sync.syncBackfill({ stripeObjects: ["products", "prices"] });
  console.log("Backfill done");
}

main().catch(e => { console.error("Backfill failed:", e.message); process.exit(1); });
