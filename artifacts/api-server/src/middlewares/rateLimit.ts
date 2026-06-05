import type { NextFunction, Request, Response } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/**
 * A tiny, dependency-free fixed-window rate limiter keyed by client IP.
 * Intended to protect public (unauthenticated) endpoints from abuse and
 * runaway cost. State is in-process only; on a multi-instance deploy each
 * instance enforces its own window, which is sufficient as a basic guard.
 */
export function rateLimit({ windowMs, max }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";

    // Opportunistic cleanup so the map can't grow unbounded.
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({
        error: "Too many requests. Please slow down and try again shortly.",
      });
      return;
    }

    next();
  };
}
