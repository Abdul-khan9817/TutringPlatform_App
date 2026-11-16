import { NextRequest } from 'next/server'
import { authService } from '@/services/auth.service'
import { registerSchema } from '@/schemas/auth.schema'
import { safeParseBody, apiSuccess, apiError } from '@/lib/validation'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { originGuard, handleApiError } from '@/lib/security'

export async function POST(req: NextRequest) {
  const origin = originGuard(req)
  if (origin) return origin

  const throttle = await rateLimit(req, rateLimits.auth)
  if (throttle) return throttle

  const parsed = await safeParseBody(req, registerSchema)
  if ('error' in parsed) return parsed.error

  try {
    const user = await authService.register(parsed.data)
    return apiSuccess(
      { id: user.id, email: user.email, name: user.name },
      'Registration successful. Please verify your email.',
      201
    )
  } catch (err) {
    const anyErr = err as { code?: string; statusCode?: number; message?: string }
    if (anyErr?.statusCode === 409) return apiError('EMAIL_TAKEN', anyErr.message ?? 'Email taken', 409)
    return handleApiError(err)
  }
}
