import { NextRequest } from 'next/server'
import { authService } from '@/services/auth.service'
import { forgotPasswordSchema } from '@/schemas/auth.schema'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/security'

export async function POST(req: NextRequest) {
  const throttle = await rateLimit(req, rateLimits.passwordReset)
  if (throttle) return throttle

  const parsed = await safeParseBody(req, forgotPasswordSchema)
  if ('error' in parsed) return parsed.error

  try {
    await authService.forgotPassword(parsed.data.email)
    // Always return success — prevent email enumeration
    return apiSuccess(null, 'If that email exists, a reset link has been sent.')
  } catch (err) {
    return handleApiError(err)
  }
}
