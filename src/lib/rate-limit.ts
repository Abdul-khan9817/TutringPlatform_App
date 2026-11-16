import { NextRequest } from 'next/server'
import { apiError } from './validation'
import { NextResponse } from 'next/server'

// ─── In-memory store (dev/single-instance) ────────────────────────────────────
// For production multi-instance, replace with Redis (ioredis + sliding window)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }, 60_000)
}

// ─── Core function ────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  limit: number      // max requests
  windowMs: number   // window in milliseconds
  keyPrefix: string
}

export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const key = `${config.keyPrefix}:${ip}`
  const now = Date.now()
  const resetAt = now + config.windowMs

  let entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    entry = { count: 1, resetAt }
    store.set(key, entry)
    return { allowed: true, remaining: config.limit - 1, resetAt }
  }

  entry.count++

  if (entry.count > config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

// ─── Middleware helper ────────────────────────────────────────────────────────

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await checkRateLimit(req, config)

  if (!result.allowed) {
    const response = apiError(
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      429
    )
    response.headers.set('Retry-After', String(Math.ceil((result.resetAt - Date.now()) / 1000)))
    response.headers.set('X-RateLimit-Limit', String(config.limit))
    response.headers.set('X-RateLimit-Remaining', '0')
    return response
  }

  return null
}

// ─── Preset configs ───────────────────────────────────────────────────────────

export const rateLimits = {
  auth: { limit: 30, windowMs: 15 * 60 * 1000, keyPrefix: 'auth' },
  assessment: { limit: 5, windowMs: 60 * 60 * 1000, keyPrefix: 'assessment' },
  booking: { limit: 20, windowMs: 60 * 60 * 1000, keyPrefix: 'booking' },
  passwordReset: { limit: 5, windowMs: 60 * 60 * 1000, keyPrefix: 'pwd-reset' },
  checkout: { limit: 10, windowMs: 60 * 60 * 1000, keyPrefix: 'checkout' },
  api: { limit: 100, windowMs: 60 * 1000, keyPrefix: 'api' },
}
