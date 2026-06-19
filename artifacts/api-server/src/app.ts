import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { awaitMigrations } from "./lib/startup/migrations";
import { WebhookHandlers } from "./lib/stripe/webhookHandlers";
import { startOutreachScheduler } from "./lib/outreach/scheduler";

const app: Express = express();

// Behind the Replit reverse proxy: trust x-forwarded-* so req.secure and
// req.protocol reflect the external HTTPS scheme (needed for secure cookies).
app.set("trust proxy", true);

// ── Stripe webhook ── must be registered BEFORE express.json() so the body
// arrives as a raw Buffer that Stripe can verify with its signing secret.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }
    const sig = Array.isArray(signature) ? signature[0] : signature;
    try {
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "Stripe webhook processing failed");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// The `/api` path is owned by this server, so a browser navigating to the bare
// `/api` URL would otherwise 404. The web app's public API directory page lives
// at `/apis`; redirect human (HTML) navigations to it while leaving real API
// clients (which prefer JSON) to fall through to the 404 they expect. Only the
// exact `/api` GET is affected — every `/api/*` endpoint is untouched.
app.get("/api", (req, res, next) => {
  if (req.accepts(["html", "json"]) === "html") {
    res.redirect(302, "/apis");
    return;
  }
  next();
});

// Hold DB-backed requests until schema migrations have settled, so a cold-start
// deploy never serves a route against a not-yet-migrated schema (e.g. the prod
// DB before the latest columns are added). /healthz is exempt so readiness/
// liveness probes pass immediately while migrations run. Once settled this is a
// no-op, so steady-state latency is unaffected.
app.use("/api", (req, res, next) => {
  if (req.path === "/healthz") {
    next();
    return;
  }
  void awaitMigrations().then(() => next());
});

app.use("/api", router);

// Start the outreach email scheduler after migrations settle. It checks
// wall-clock hour once per minute and fires the daily batch when the
// configured send hour is reached. No-ops when RESEND_API_KEY is absent.
void awaitMigrations().then(() => startOutreachScheduler());

// In production container images (e.g. Google Cloud Run) the built web client
// is copied next to this server bundle, so a single service serves both the API
// and the SPA from one origin — which keeps the session cookie same-site and
// working in every browser. In the Replit dev/prod setup the web app is served
// separately, so this directory is absent and the block is skipped.
const clientDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "public",
);

if (existsSync(clientDir)) {
  app.use(express.static(clientDir));

  // SPA fallback: serve index.html for client-side routes, but never shadow the
  // API — an unmatched /api/* request should 404, not return HTML.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

export default app;
