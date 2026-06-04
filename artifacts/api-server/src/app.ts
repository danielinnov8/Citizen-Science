import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Behind the Replit reverse proxy: trust x-forwarded-* so req.secure and
// req.protocol reflect the external HTTPS scheme (needed for secure cookies).
app.set("trust proxy", true);

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

app.use("/api", router);

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
