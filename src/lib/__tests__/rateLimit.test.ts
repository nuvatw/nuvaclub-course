import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  checkRateLimit,
  createRateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from '../rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset timers and use fake timers
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows first request', () => {
    const result = checkRateLimit('user1', 'test-endpoint', {
      limit: 5,
      windowMs: 60000,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('tracks remaining requests correctly', () => {
    const config = { limit: 5, windowMs: 60000 }

    // First request
    let result = checkRateLimit('user2', 'test-endpoint', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)

    // Second request
    result = checkRateLimit('user2', 'test-endpoint', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(3)

    // Third request
    result = checkRateLimit('user2', 'test-endpoint', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('blocks requests when limit is exceeded', () => {
    const config = { limit: 3, windowMs: 60000 }
    const identifier = 'user-block-test'

    // Make 3 requests (should all succeed)
    checkRateLimit(identifier, 'test-endpoint', config)
    checkRateLimit(identifier, 'test-endpoint', config)
    checkRateLimit(identifier, 'test-endpoint', config)

    // 4th request should be blocked
    const result = checkRateLimit(identifier, 'test-endpoint', config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('isolates different identifiers', () => {
    const config = { limit: 2, windowMs: 60000 }

    // User A uses both requests
    checkRateLimit('userA', 'endpoint', config)
    checkRateLimit('userA', 'endpoint', config)
    const resultA = checkRateLimit('userA', 'endpoint', config)

    // User B should still have access
    const resultB = checkRateLimit('userB', 'endpoint', config)

    expect(resultA.success).toBe(false)
    expect(resultB.success).toBe(true)
    expect(resultB.remaining).toBe(1)
  })

  it('isolates different endpoints', () => {
    const config = { limit: 2, windowMs: 60000 }
    const user = 'user-endpoint-test'

    // Use both requests on endpoint1
    checkRateLimit(user, 'endpoint1', config)
    checkRateLimit(user, 'endpoint1', config)
    const result1 = checkRateLimit(user, 'endpoint1', config)

    // Endpoint2 should still have access
    const result2 = checkRateLimit(user, 'endpoint2', config)

    expect(result1.success).toBe(false)
    expect(result2.success).toBe(true)
  })

  it('resets after window expires', () => {
    const config = { limit: 2, windowMs: 60000 }
    const identifier = 'user-reset-test'

    // Use both requests
    checkRateLimit(identifier, 'test-endpoint', config)
    checkRateLimit(identifier, 'test-endpoint', config)
    let result = checkRateLimit(identifier, 'test-endpoint', config)
    expect(result.success).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(61000)

    // Should be able to make requests again
    result = checkRateLimit(identifier, 'test-endpoint', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('provides correct reset timestamp', () => {
    const config = { limit: 2, windowMs: 60000 }
    const now = Date.now()

    const result = checkRateLimit('user-reset-ts', 'test-endpoint', config)

    // Reset should be approximately now + windowMs
    expect(result.reset).toBeGreaterThanOrEqual(now + config.windowMs)
  })

  it('provides correct reset timestamp when blocked', () => {
    const config = { limit: 1, windowMs: 60000 }
    const identifier = 'user-blocked-reset'

    // Make one request
    const firstResult = checkRateLimit(identifier, 'test-endpoint', config)
    const firstTimestamp = Date.now()

    // Advance time slightly
    vi.advanceTimersByTime(5000)

    // Second request should be blocked
    const result = checkRateLimit(identifier, 'test-endpoint', config)

    expect(result.success).toBe(false)
    // Reset should be based on the first request's timestamp
    expect(result.reset).toBe(firstTimestamp + config.windowMs)
  })
})

describe('createRateLimitResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 429 status', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 30000,
    }

    const response = createRateLimitResponse(result)
    expect(response.status).toBe(429)
  })

  it('includes error message in body', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 30000,
    }

    const response = createRateLimitResponse(result)
    expect(response.body.error).toBeDefined()
    expect(typeof response.body.error).toBe('string')
  })

  it('calculates retryAfter in seconds', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 30000, // 30 seconds from now
    }

    const response = createRateLimitResponse(result)
    expect(response.body.retryAfter).toBe(30)
  })

  it('includes Retry-After header', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 45000,
    }

    const response = createRateLimitResponse(result)
    expect(response.headers['Retry-After']).toBe('45')
  })

  it('includes X-RateLimit-Remaining header', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 30000,
    }

    const response = createRateLimitResponse(result)
    expect(response.headers['X-RateLimit-Remaining']).toBe('0')
  })

  it('includes X-RateLimit-Reset header', () => {
    const resetTime = Date.now() + 30000
    const result = {
      success: false,
      remaining: 0,
      reset: resetTime,
    }

    const response = createRateLimitResponse(result)
    expect(response.headers['X-RateLimit-Reset']).toBe(String(resetTime))
  })

  it('rounds retryAfter up to nearest second', () => {
    const result = {
      success: false,
      remaining: 0,
      reset: Date.now() + 30500, // 30.5 seconds
    }

    const response = createRateLimitResponse(result)
    expect(response.body.retryAfter).toBe(31)
  })
})

describe('RATE_LIMIT_CONFIGS', () => {
  it('has imagePresign config with correct values', () => {
    expect(RATE_LIMIT_CONFIGS.imagePresign).toEqual({
      limit: 10,
      windowMs: 60000,
    })
  })

  it('has imageConfirm config with correct values', () => {
    expect(RATE_LIMIT_CONFIGS.imageConfirm).toEqual({
      limit: 10,
      windowMs: 60000,
    })
  })

  it('has imageDelete config with correct values', () => {
    expect(RATE_LIMIT_CONFIGS.imageDelete).toEqual({
      limit: 20,
      windowMs: 60000,
    })
  })
})
