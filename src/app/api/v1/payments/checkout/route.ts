import { NextRequest } from 'next/server'
import { paymentService } from '@/services/payment.service'
import { checkoutSchema } from '@/schemas/payment.schema'
import { requireSession } from '@/lib/auth'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/security'

export async function POST(req: NextRequest) {
  const throttle = await rateLimit(req, rateLimits.checkout)
  if (throttle) return throttle

  try {
    const session = await requireSession(req)
    const parsed = await safeParseBody(req, checkoutSchema)
    if ('error' in parsed) return parsed.error

    const result = await paymentService.createCheckoutSession(parsed.data, session)
    return apiSuccess(result)
  } catch (err) {
    return handleApiError(err)
  }
}
