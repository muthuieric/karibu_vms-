import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitType = "auth" | "api";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds or remaining seconds
}

// In-memory sliding window fallback for local development or when Redis env vars are omitted
class MemorySlidingWindowLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up stale timestamps
    const timestamps = (this.requests.get(identifier) || []).filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: resetSeconds,
      };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - timestamps.length,
      reset: Math.ceil(this.windowMs / 1000),
    };
  }
}

// Check if Upstash credentials exist
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isUpstashConfigured = Boolean(upstashUrl && upstashToken && upstashUrl.startsWith("http"));

let upstashRedis: Redis | null = null;
let upstashAuthLimiter: Ratelimit | null = null;
let upstashApiLimiter: Ratelimit | null = null;

if (isUpstashConfigured) {
  try {
    upstashRedis = new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    });

    // 5 requests per 1 minute for authentication & sensitive security routes
    upstashAuthLimiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "karibu:rl:auth",
    });

    // 60 requests per 1 minute for general API endpoints
    upstashApiLimiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "karibu:rl:api",
    });
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis rate limiter, falling back to memory:", err);
    upstashAuthLimiter = null;
    upstashApiLimiter = null;
  }
}

// Fallback in-memory limiters
const memoryAuthLimiter = new MemorySlidingWindowLimiter(5, 60);
const memoryApiLimiter = new MemorySlidingWindowLimiter(60, 60);

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "api"
): Promise<RateLimitResult> {
  const safeId = String(identifier || "anonymous").trim();

  // If Upstash is configured, use distributed Redis
  if (type === "auth" && upstashAuthLimiter) {
    try {
      const res = await upstashAuthLimiter.limit(safeId);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
      };
    } catch (err) {
      console.warn("Upstash auth rate limit check failed, using fallback:", err);
    }
  }

  if (type === "api" && upstashApiLimiter) {
    try {
      const res = await upstashApiLimiter.limit(safeId);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
      };
    } catch (err) {
      console.warn("Upstash API rate limit check failed, using fallback:", err);
    }
  }

  // Use in-memory sliding window fallback
  if (type === "auth") {
    return memoryAuthLimiter.limit(safeId);
  }

  return memoryApiLimiter.limit(safeId);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const candidate = forwarded.split(",")[0]?.trim();
    if (candidate) return candidate;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const vercelIp = headers.get("x-vercel-ip");
  if (vercelIp) return vercelIp.trim();

  return "127.0.0.1";
}

