import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client only if environment variables are set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit tiers
export const rateLimiters = {
  // Public endpoints: 10 requests per 10 seconds
  public: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'ratelimit:public',
      })
    : null,

  // Authenticated endpoints: 30 requests per 10 seconds
  authenticated: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '10 s'),
        analytics: true,
        prefix: 'ratelimit:auth',
      })
    : null,

  // Sensitive endpoints (checkout, admin): 5 requests per minute
  sensitive: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '60 s'),
        analytics: true,
        prefix: 'ratelimit:sensitive',
      })
    : null,

  // Waitlist: 3 requests per hour
  waitlist: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '3600 s'),
        analytics: true,
        prefix: 'ratelimit:waitlist',
      })
    : null,
};

export type RateLimitTier = keyof typeof rateLimiters;

/**
 * Check rate limit for a given identifier and tier
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'authenticated'
) {
  const limiter = rateLimiters[tier];

  // If rate limiting is not configured (missing env vars), allow all requests
  if (!limiter) {
    console.warn('[Rate Limit] Upstash not configured - rate limiting disabled');
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return result;
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error('[Rate Limit] Error checking rate limit:', error);
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    };
  }
}

/**
 * Get rate limit identifier from request
 * Combines IP and user ID for better tracking
 */
export function getRateLimitIdentifier(
  ip: string,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip}`;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Try various headers in order of preference
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const cfConnectingIP = headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  
  return 'unknown';
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}


