import { NextRequest } from 'next/server'
import { authService } from '@/services/auth.service'
import { loginSchema } from '@/schemas/auth.schema'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { originGuard, handleApiError, getClientIp } from '@/lib/security'

export async function POST(req: NextRequest) {
  const origin = originGuard(req)
  if (origin) return origin

  const throttle = await rateLimit(req, rateLimits.auth)
  if (throttle) return throttle

  const parsed = await safeParseBody(req, loginSchema)
  if ('error' in parsed) return parsed.error

  try {
    const user = await authService.login(parsed.data, {
      userAgent: req.headers.get('user-agent') ?? undefined,
      ipAddress: getClientIp(req),
    })
    return apiSuccess(user, 'Login successful')
  } catch (err) {
    return handleApiError(err)
  }
}
