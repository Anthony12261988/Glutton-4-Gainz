/**
 * Rate limiting utility using in-memory store
 * For production, consider using Redis or Upstash
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  window: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const key = identifier;

  let record = rateLimitStore.get(key);

  // Create new record if doesn't exist or expired
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.window,
    };
    rateLimitStore.set(key, record);
  }

  // Increment count
  record.count++;

  const remaining = Math.max(0, config.limit - record.count);
  const success = record.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    reset: record.resetTime,
  };
}

/**
 * Rate limit configurations for different operations
 */
export const RATE_LIMITS = {
  // Auth operations (per IP)
  login: { limit: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 min
  register: { limit: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
  passwordReset: { limit: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour

  // API operations (per user)
  createWorkout: { limit: 100, window: 60 * 60 * 1000 }, // 100 per hour
  sendMessage: { limit: 50, window: 60 * 60 * 1000 }, // 50 per hour
  buddyRequest: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour

  // General API (per user)
  api: { limit: 1000, window: 60 * 60 * 1000 }, // 1000 requests per hour
  apiStrict: { limit: 100, window: 60 * 1000 }, // 100 requests per minute
} as const;

/**
 * Middleware-style rate limiter for API routes
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimit(request, {
 *     limit: 10,
 *     window: 60 * 1000, // 1 minute
 *   });
 *
 *   if (!rateLimitResult.success) {
 *     return new Response('Too many requests', {
 *       status: 429,
 *       headers: rateLimitResult.headers,
 *     });
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig,
  getUserId?: () => Promise<string | null>
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}> {
  // Try to get user ID first, fallback to IP
  let identifier: string;

  if (getUserId) {
    const userId = await getUserId();
    identifier = userId || getIP(request);
  } else {
    identifier = getIP(request);
  }

  const result = checkRateLimit(identifier, config);

  // Create rate limit headers
  const headers = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };

  if (!result.success) {
    headers["Retry-After"] = String(
      Math.ceil((result.reset - Date.now()) / 1000)
    );
  }

  return {
    ...result,
    headers,
  };
}

/**
 * Extract IP address from request
 */
function getIP(request: Request): string {
  // Try various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (not ideal, but prevents crashes)
  return "unknown";
}

/**
 * Create a standardized rate limit error response
 */
export function rateLimitResponse(
  headers: Record<string, string>,
  message: string = "Too many requests. Please try again later."
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: "RATE_LIMIT_EXCEEDED",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}
