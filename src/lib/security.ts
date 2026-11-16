import { NextRequest, NextResponse } from 'next/server'

// ─── Origin verification for state-changing requests ─────────────────────────

export function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'

  if (!origin) {
    // Allow same-origin requests without Origin header (e.g., server-side)
    return true
  }

  const allowedOrigins = [
    appUrl,
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ].filter(Boolean)

  return allowedOrigins.some((allowed) => origin === allowed)
}

export function originGuard(req: NextRequest): NextResponse | null {
  if (!verifyOrigin(req)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin not allowed' } },
      { status: 403 }
    )
  }
  return null
}

// ─── Sanitize input ───────────────────────────────────────────────────────────

export function sanitizeString(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '') // remove control chars
}

// ─── IP extraction ────────────────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ─── Error handler wrapper ────────────────────────────────────────────────────

import { logger } from './logger'
import { AuthError } from './auth'
import { apiError, apiUnauthorized, apiForbidden, apiServerError } from './validation'

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    if (error.statusCode === 401) return apiUnauthorized(error.message)
    if (error.statusCode === 403) return apiForbidden(error.message)
    return apiError(error.code, error.message, error.statusCode)
  }

  const anyError = error as { code?: string; statusCode?: number; message?: string }
  if (anyError?.code === 'FORBIDDEN') return apiForbidden(anyError.message)
  if (anyError?.statusCode === 404) return apiError('NOT_FOUND', anyError.message ?? 'Not found', 404)

  logger.error('Unhandled API error', {
    message: error instanceof Error ? error.message : 'unknown',
    stack: error instanceof Error ? error.stack : undefined,
  })

  return apiServerError()
}
