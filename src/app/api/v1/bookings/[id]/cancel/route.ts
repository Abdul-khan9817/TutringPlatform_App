import { NextRequest } from 'next/server'
import { bookingService } from '@/services/booking.service'
import { cancelBookingSchema } from '@/schemas/booking.schema'
import { requireSession } from '@/lib/auth'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const parsed = await safeParseBody(req, cancelBookingSchema)
    if ('error' in parsed) return parsed.error

    const booking = await bookingService.cancel(params.id, parsed.data.reason, session)
    return apiSuccess(booking, 'Booking cancelled')
  } catch (err) {
    return handleApiError(err)
  }
}
