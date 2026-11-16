import { NextRequest } from 'next/server'
import { bookingService } from '@/services/booking.service'
import { createBookingSchema } from '@/schemas/booking.schema'
import { safeParseBody, apiSuccess, paginationSchema } from '@/lib/validation'
import { requireSession } from '@/lib/auth'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const parsed = paginationSchema.extend({ status: z.string().optional() }).safeParse(params)
    const filters = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const result = await bookingService.list(session, filters)
    return apiSuccess(result)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  const throttle = await rateLimit(req, rateLimits.booking)
  if (throttle) return throttle

  try {
    const session = await requireSession(req)
    const parsed = await safeParseBody(req, createBookingSchema)
    if ('error' in parsed) return parsed.error

    const booking = await bookingService.create(parsed.data, session)
    return apiSuccess(booking, 'Booking created. Please complete payment.', 201)
  } catch (err) {
    const anyErr = err as { code?: string; statusCode?: number; message?: string }
    if (anyErr?.statusCode === 409) {
      const { apiError } = await import('@/lib/validation')
      return apiError('SLOT_TAKEN', anyErr.message ?? 'Slot not available', 409)
    }
    return handleApiError(err)
  }
}
