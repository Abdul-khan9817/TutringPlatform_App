import { NextRequest } from 'next/server'
import { bookingService } from '@/services/booking.service'
import { requireSession } from '@/lib/auth'
import { apiSuccess, apiNotFound } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const booking = await bookingService.getById(params.id, session)
    if (!booking) return apiNotFound('Booking')
    return apiSuccess(booking)
  } catch (err) {
    return handleApiError(err)
  }
}
