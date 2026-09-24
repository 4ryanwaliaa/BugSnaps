/**
 * In-memory fixed-window rate limiter for public, unauthenticated routes.
 *
 * Scope and limits: this holds counters in the process, so it protects a
 * single instance. On a multi-instance or serverless deploy each instance
 * keeps its own window, and the effective limit is (limit x instances) - * still a hard ceiling on any one attacker, but move to a shared store
 * (Upstash/Redis, or the platform's WAF) if this ever needs to be exact.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Bound the map so a flood of unique keys can't grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    // Opportunistically drop expired entries before inserting a new one.
    if (windows.size >= MAX_TRACKED_KEYS) {
      for (const [k, w] of windows) if (now >= w.resetAt) windows.delete(k);
      // Still full of live windows: we are under a distributed flood, so
      // refuse new keys rather than let the map grow unbounded.
      if (windows.size >= MAX_TRACKED_KEYS) {
        return { allowed: false, remaining: 0, limit, retryAfterSeconds: Math.ceil(windowMs / 1000) };
      }
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, limit, retryAfterSeconds };
  }

  return { allowed: true, remaining: limit - existing.count, limit, retryAfterSeconds };
}

/**
 * Client identity for throttling.
 *
 * `x-forwarded-for` is a list that each proxy APPENDS to, so the left-most
 * entry is whatever the caller sent - attacker-controlled, and rotating it
 * defeats any limit keyed on it. The trustworthy value is the entry your
 * nearest trusted proxy appended: the RIGHT-most one. This assumes exactly
 * one trusted proxy in front of the app (Vercel, or a single reverse proxy);
 * behind N proxies, take the (N+1)th from the right instead.
 *
 * Requests we cannot attribute share one bucket. That is deliberate: it
 * fails closed, so an unidentifiable flood is still capped.
 */
const TRUSTED_PROXY_DEPTH = 1;

export function clientKey(request: Request): string {
  // Set by the platform (Vercel, nginx) and not appendable by the caller.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const chain = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const client = chain[chain.length - TRUSTED_PROXY_DEPTH];
  return client || "unattributed";
}
