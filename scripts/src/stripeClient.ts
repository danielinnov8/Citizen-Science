import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";

async function getStripeCredentials(): Promise<{
  secretKey: string;
  webhookSecret?: string;
}> {
  // Prefer an explicit STRIPE_SECRET_KEY from the environment when present —
  // mirrors the api-server's stripeClient. This lets the seed run against any
  // account/mode (e.g. live mode for the production catalog) by setting the env
  // var inline, without going through the Replit connector (which is bound to the
  // sandbox/test account):
  //   STRIPE_SECRET_KEY=sk_live_... pnpm --filter @workspace/scripts run seed-products
  const envSecret = process.env.STRIPE_SECRET_KEY?.trim();
  if (envSecret) {
    const envWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    return {
      secretKey: envSecret,
      webhookSecret: envWebhookSecret || undefined,
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error(
      "Missing Replit environment variables. " +
        "Ensure the Stripe integration is connected via the Integrations tab.",
    );
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch Stripe credentials: ${resp.status} ${resp.statusText}`,
    );
  }

  const data = (await resp.json()) as {
    items?: { settings?: { secret?: string; webhook_secret?: string } }[];
  };
  const settings = data.items?.[0]?.settings;

  if (!settings?.secret) {
    throw new Error(
      "Stripe integration not connected or missing secret key. " +
        "Connect Stripe via the Integrations tab first.",
    );
  }

  return {
    secretKey: settings.secret,
    webhookSecret: settings.webhook_secret,
  };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey);
}

export async function getStripeSync(): Promise<StripeSync> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const { secretKey, webhookSecret } = await getStripeCredentials();
  return new StripeSync({
    poolConfig: { connectionString: databaseUrl },
    stripeSecretKey: secretKey,
    stripeWebhookSecret: webhookSecret ?? "",
  });
}
