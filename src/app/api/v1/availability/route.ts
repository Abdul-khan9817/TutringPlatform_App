import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, requireSession, getSession } from '@/lib/auth'
import { apiSuccess, safeParseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'
import { bookingService } from '@/services/booking.service'

const createAvailSchema = z.object({
  weekDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().default('Europe/Lisbon'),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams
    const tutorId = params.get('tutorId')
    const serviceId = params.get('serviceId')
    const date = params.get('date') // YYYY-MM-DD

    // Public slot query
    if (tutorId && serviceId && date) {
      const slots = await bookingService.getAvailableSlots({ tutorId, serviceId, date })
      return apiSuccess(slots)
    }

    // Tutor/admin: get own availability
    const session = await requireRole(['TUTOR', 'ADMIN'], req)
    const targetId = (session.role === 'ADMIN' && params.get('tutorId')) ? params.get('tutorId')! : session.sub

    const avail = await prisma.availability.findMany({
      where: { tutorId: targetId, isActive: true },
      orderBy: { weekDay: 'asc' },
    })
    return apiSuccess(avail)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['TUTOR', 'ADMIN'], req)
    const parsed = await safeParseBody(req, createAvailSchema)
    if ('error' in parsed) return parsed.error

    const avail = await prisma.availability.create({
      data: { ...parsed.data, tutorId: session.sub },
    })
    return apiSuccess(avail, 'Availability added', 201)
  } catch (err) {
    return handleApiError(err)
  }
}
