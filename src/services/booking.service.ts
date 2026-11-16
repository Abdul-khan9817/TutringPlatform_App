import { prisma } from '@/lib/prisma'
import { calculateEndTime } from '@/lib/dates'
import { sendEmail, bookingConfirmationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import { canAccessBooking } from '@/lib/permissions'
import { AuthError } from '@/lib/auth'
import type { JWTPayload } from '@/lib/auth'
import type { CreateBookingInput } from '@/schemas/booking.schema'
import { formatBookingTime } from '@/lib/dates'

const BOOKING_EXPIRY_MINUTES = 15

export const bookingService = {
  /** Check real-time availability — always server-side */
  async getAvailableSlots(params: {
    tutorId: string
    serviceId: string
    date: string // YYYY-MM-DD in Lisbon time
  }) {
    const service = await prisma.service.findUnique({
      where: { id: params.serviceId, isActive: true },
      select: { durationMinutes: true },
    })
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 })

    // Get tutor availability for the requested weekday
    const requestedDate = new Date(params.date + 'T00:00:00+01:00') // Lisbon offset (simplified)
    const weekdayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const weekDay = weekdayNames[requestedDate.getDay()] as never

    const availabilities = await prisma.availability.findMany({
      where: {
        tutorId: params.tutorId,
        weekDay,
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: requestedDate } },
        ],
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gte: requestedDate } }] },
        ],
      },
    })

    if (availabilities.length === 0) return []

    // Get existing confirmed/pending bookings for that tutor on that day
    const dayStart = new Date(params.date + 'T00:00:00Z')
    const dayEnd = new Date(params.date + 'T23:59:59Z')

    const existingBookings = await prisma.booking.findMany({
      where: {
        tutorId: params.tutorId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        startAt: { gte: dayStart, lte: dayEnd },
      },
      select: { startAt: true, endAt: true },
    })

    // Build slot list from availability windows
    const slots: { startAt: string; endAt: string }[] = []
    const duration = service.durationMinutes

    for (const avail of availabilities) {
      const [startHour, startMin] = avail.startTime.split(':').map(Number)
      const [endHour, endMin] = avail.endTime.split(':').map(Number)

      let slotStart = new Date(params.date + 'T00:00:00Z')
      slotStart.setUTCHours(startHour - 1, startMin, 0, 0) // rough UTC (simplified)

      const availEnd = new Date(params.date + 'T00:00:00Z')
      availEnd.setUTCHours(endHour - 1, endMin, 0, 0)

      while (slotStart < availEnd) {
        const slotEnd = calculateEndTime(slotStart, duration)
        if (slotEnd > availEnd) break

        // Check no overlap with existing bookings
        const hasConflict = existingBookings.some(
          (b) => slotStart < b.endAt && slotEnd > b.startAt
        )

        if (!hasConflict && slotStart > new Date()) {
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
          })
        }

        slotStart = calculateEndTime(slotStart, duration)
      }
    }

    return slots
  },

  /** Create a pending booking (before payment) */
  async create(input: CreateBookingInput, session: JWTPayload) {
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId, isActive: true },
      select: { id: true, durationMinutes: true, name: true, price: true },
    })
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 })

    const tutor = await prisma.user.findUnique({
      where: { id: input.tutorId, role: 'TUTOR', isActive: true },
      select: { id: true, name: true },
    })
    if (!tutor) throw Object.assign(new Error('Tutor not found'), { statusCode: 404 })

    const startAt = new Date(input.startAt)
    const endAt = calculateEndTime(startAt, service.durationMinutes)

    // ── Concurrency-safe availability check using serializable transaction ──
    const booking = await prisma.$transaction(
      async (tx) => {
        // Lock: check for overlapping CONFIRMED/PENDING bookings
        const conflict = await tx.booking.findFirst({
          where: {
            tutorId: input.tutorId,
            status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
            AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
          },
        })

        if (conflict) {
          throw Object.assign(
            new Error('This time slot is no longer available'),
            { code: 'SLOT_TAKEN', statusCode: 409 }
          )
        }

        const expiresAt = new Date(Date.now() + BOOKING_EXPIRY_MINUTES * 60 * 1000)

        return tx.booking.create({
          data: {
            studentId: session.sub,
            tutorId: input.tutorId,
            serviceId: input.serviceId,
            startAt,
            endAt,
            deliveryMode: input.deliveryMode,
            status: 'PENDING_PAYMENT',
            expiresAt,
            packagePurchaseId: input.packagePurchaseId,
          },
        })
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    )

    logger.info('Booking created (pending)', { bookingId: booking.id, studentId: session.sub })
    return booking
  },

  async list(session: JWTPayload, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 20
    const skip = (page - 1) * limit

    const isStudent = session.role === 'STUDENT'
    const isTutor = session.role === 'TUTOR'

    const where: Record<string, unknown> = {
      ...(isStudent ? { studentId: session.sub } : {}),
      ...(isTutor ? { tutorId: session.sub } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: { select: { name: true, language: true, durationMinutes: true } },
          student: { select: { id: true, name: true, email: true } },
          tutor: { select: { id: true, name: true } },
        },
        orderBy: { startAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return { bookings, total, page, limit }
  },

  async getById(id: string, session: JWTPayload) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true } },
        payment: { select: { id: true, status: true, amount: true, paidAt: true } },
      },
    })

    if (!booking) return null

    if (!canAccessBooking(session, booking)) {
      throw new AuthError('FORBIDDEN', 'Access denied', 403)
    }

    return booking
  },

  async cancel(id: string, reason: string | undefined, session: JWTPayload) {
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 })

    if (!canAccessBooking(session, booking)) {
      throw new AuthError('FORBIDDEN', 'Access denied', 403)
    }

    if (!['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status)) {
      throw Object.assign(new Error('Booking cannot be cancelled in its current state'), { statusCode: 422 })
    }

    return prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledBy: session.sub,
        cancelledAt: new Date(),
      },
    })
  },

  /** Release expired unpaid bookings */
  async releaseExpired() {
    const result = await prisma.booking.updateMany({
      where: {
        status: 'PENDING_PAYMENT',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })
    if (result.count > 0) {
      logger.info('Expired bookings released', { count: result.count })
    }
    return result.count
  },

  async confirmBooking(bookingId: string) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        student: { select: { name: true, email: true } },
        service: { select: { name: true } },
        tutor: { select: { name: true } },
      },
    })

    // Send confirmation email
    sendEmail({
      to: booking.student.email,
      ...bookingConfirmationEmail({
        studentName: booking.student.name,
        service: booking.service.name,
        startAt: formatBookingTime(booking.startAt, booking.endAt),
        deliveryMode: booking.deliveryMode === 'ONLINE' ? 'Online' : 'In-Person',
        meetingLink: booking.meetingLink ?? undefined,
      }),
    }).catch((e) => logger.error('Booking confirmation email failed', { error: String(e) }))

    return booking
  },
}
