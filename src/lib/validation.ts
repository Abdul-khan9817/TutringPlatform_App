import { z } from 'zod'
import { NextResponse } from 'next/server'
import { logger } from './logger'

// ─── Common field validators ──────────────────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long') // bcrypt limit
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v))

export const uuidSchema = z.string().uuid('Invalid ID format')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Safe JSON parse helper ───────────────────────────────────────────────────

export async function safeParseBody<T>(
  request: Request,
  schema: z.ZodType<T, any, any>
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown

  try {
    raw = await request.json()
  } catch {
    return {
      error: NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } },
        { status: 400 }
      ),
    }
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }))

    logger.debug('Validation failed', { issues })

    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please check your submitted information',
            details: issues,
          },
        },
        { status: 422 }
      ),
    }
  }

  return { data: result.data }
}

// ─── Standard API response helpers ───────────────────────────────────────────

export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, message: message ?? 'OK' }, { status })
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  )
}

export function apiUnauthorized(message = 'Authentication required'): NextResponse {
  return apiError('UNAUTHENTICATED', message, 401)
}

export function apiForbidden(message = 'Insufficient permissions'): NextResponse {
  return apiError('FORBIDDEN', message, 403)
}

export function apiNotFound(resource = 'Resource'): NextResponse {
  return apiError('NOT_FOUND', `${resource} not found`, 404)
}

export function apiServerError(context?: string): NextResponse {
  if (context) logger.error('Internal server error', { context })
  return apiError('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}
