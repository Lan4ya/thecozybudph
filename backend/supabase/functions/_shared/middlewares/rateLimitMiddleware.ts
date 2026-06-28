import { adminDb } from "@shared/db/client.ts";
import { rateLimits } from "@shared/schemas/index.ts";
import type { Ratelimit } from "@upstash/ratelimit";
import { sql } from "drizzle-orm";
import type { Context, Next } from "hono";

const getClientIp = (c: Context): string =>
  c.req.header("cf-connecting-ip") ??
  c.req.header("x-forwarded-for") ??
  c.req.header("x-real-ip") ??
  "anonymous";

export const rateLimitWithPostgresFallback = ({
  upstashLimiter,
  keyPrefix,
  message,
  windowMs,
  maxRequest,
  code = "RATE_LIMIT",
}: {
  upstashLimiter: Ratelimit;
  keyPrefix: string;
  message: string;
  windowMs: number;
  maxRequest: number;
  code?: string;
}) => {
  return async (c: Context, next: Next) => {
    const ip = getClientIp(c);
    const key = `${ip}:${keyPrefix}`;

    // Attempt Upstash first
    try {
      const { success, limit, reset, remaining } =
        await upstashLimiter.limit(key);

      c.header("X-RateLimit-Limit", limit.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header("X-RateLimit-Reset", reset.toString());

      if (!success) {
        console.log(`[Rate Limit] ${keyPrefix} limit hit: ${ip}`);
        return c.json({ message, code }, 429);
      }
      return next();
    } catch (err) {
      console.error(`[Rate Limit] Redis error, falling back to Postgres`, err);
    }

    // Fallback to PostgreSQL
    try {
      const { allowed, remaining, reset } = await postgresRateLimit(
        key,
        maxRequest,
        windowMs,
      );

      const resetInSeconds = Math.ceil(reset / 1000);
      c.header("X-RateLimit-Limit", maxRequest.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header("X-RateLimit-Reset", resetInSeconds.toString());

      if (!allowed) {
        return c.json({ message, code }, 429);
      }
      return next();
    } catch (dbErr) {
      // Even PostgreSQL is unreachable – fail open to prevent total outage
      console.error(`[Rate Limit] PostgreSQL fallback failed`, dbErr);
      return next();
    }
  };
};

export async function postgresRateLimit(
  key: string,
  maxRequest: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const windowExpiry = now + windowMs;

  const result = await adminDb
    .insert(rateLimits)
    .values({ key, count: 1, resetAt: windowExpiry })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE 
          WHEN ${rateLimits.resetAt} <= ${now} THEN 1
          ELSE ${rateLimits.count} + 1
        END`,
        resetAt: sql`CASE 
          WHEN ${rateLimits.resetAt} <= ${now} THEN ${windowExpiry}
          ELSE ${rateLimits.resetAt}
        END`,
      },
    })
    .returning({
      count: rateLimits.count,
      resetAt: rateLimits.resetAt,
    })
    .then((rows) => rows[0]!);

  const allowed = result.count <= maxRequest;
  const reset = Number(result.resetAt);
  const remaining = Math.max(0, maxRequest - result.count);

  return { allowed, remaining, reset };
}
