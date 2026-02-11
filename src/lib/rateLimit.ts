/**
 * Simple in-memory rate limiter using sliding window algorithm
 * For production use, consider Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  /** Number of remaining requests in current window */
  remaining: number
  /** Timestamp when the rate limit resets */
  reset: number
}

// In-memory store for rate limit data
// Key format: "identifier:endpoint"
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

let cleanupScheduled = false

function scheduleCleanup(): void {
  if (cleanupScheduled) return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()
    const oldestAllowedTimestamp = now - 10 * 60 * 1000 // Remove entries older than 10 minutes

    for (const [key, entry] of rateLimitStore.entries()) {
      // Filter out old timestamps
      entry.timestamps = entry.timestamps.filter((ts) => ts > oldestAllowedTimestamp)

      // Remove entry if no timestamps remain
      if (entry.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
}

/**
 * Check rate limit for a given identifier and endpoint
 * Uses sliding window algorithm for accurate rate limiting
 *
 * @param identifier - Unique identifier (usually user ID or IP)
 * @param endpoint - Endpoint being rate limited
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  scheduleCleanup()

  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or create entry
  let entry = rateLimitStore.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    rateLimitStore.set(key, entry)
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  // Check if limit exceeded
  if (entry.timestamps.length >= config.limit) {
    const oldestTimestamp = entry.timestamps[0] ?? now
    const reset = oldestTimestamp + config.windowMs

    return {
      success: false,
      remaining: 0,
      reset,
    }
  }

  // Add current timestamp
  entry.timestamps.push(now)

  return {
    success: true,
    remaining: config.limit - entry.timestamps.length,
    reset: now + config.windowMs,
  }
}

// Preset configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  /** Image presign: 10 requests per minute */
  imagePresign: { limit: 10, windowMs: 60 * 1000 },
  /** Image confirm: 10 requests per minute */
  imageConfirm: { limit: 10, windowMs: 60 * 1000 },
  /** Image delete: 20 requests per minute */
  imageDelete: { limit: 20, windowMs: 60 * 1000 },
  /** Notify engineer: 10 emails per hour */
  notifyEngineer: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const

/**
 * Helper to create a rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult): {
  body: { error: string; retryAfter: number }
  status: 429
  headers: Record<string, string>
} {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

  return {
    body: {
      error: '請求太頻繁，請稍後再試',
      retryAfter,
    },
    status: 429,
    headers: {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
    },
  }
}
