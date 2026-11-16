import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { safeParseBody, apiSuccess, apiNotFound } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'
import { calculateEndTime } from '@/lib/dates'

const rescheduleSchema = z.object({ startAt: z.string().datetime() })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['ADMIN', 'TUTOR'], req)
    const parsed = await safeParseBody(req, rescheduleSchema)
    if ('error' in parsed) return parsed.error

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { service: { select: { durationMinutes: true } } },
    })
    if (!booking) return apiNotFound('Booking')

    const startAt = new Date(parsed.data.startAt)
    const endAt = calculateEndTime(startAt, booking.service.durationMinutes)

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        tutorId: booking.tutorId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        id: { not: booking.id },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    })

    if (conflict) {
      const { apiError } = await import('@/lib/validation')
      return apiError('SLOT_TAKEN', 'That time slot is not available', 409)
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { startAt, endAt },
    })

    return apiSuccess(updated, 'Booking rescheduled')
  } catch (err) {
    return handleApiError(err)
  }
}
