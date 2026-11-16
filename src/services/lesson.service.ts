import { prisma } from '@/lib/prisma'
import { canAccessLesson } from '@/lib/permissions'
import { AuthError } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { JWTPayload } from '@/lib/auth'
import { z } from 'zod'

export const updateLessonSchema = z.object({
  topic: z.string().max(200).optional(),
  privateNotes: z.string().max(5000).optional(),
  studentFeedback: z.string().max(5000).optional(),
  attendanceStatus: z
    .enum(['PRESENT', 'ABSENT', 'LATE', 'CANCELLED_BY_STUDENT', 'CANCELLED_BY_TUTOR'])
    .optional(),
  durationMinutes: z.number().int().positive().optional(),
  completedAt: z.string().datetime().optional(),
})

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>

export const lessonService = {
  async list(session: JWTPayload, filters?: { page?: number; limit?: number }) {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 20
    const skip = (page - 1) * limit

    const where =
      session.role === 'STUDENT'
        ? { studentId: session.sub }
        : session.role === 'TUTOR'
          ? { tutorId: session.sub }
          : {}

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: {
          booking: {
            select: { startAt: true, endAt: true, deliveryMode: true },
          },
          tutor: { select: { id: true, name: true } },
          homework: { select: { id: true, title: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ])

    // Strip privateNotes from student responses
    const sanitised = lessons.map((l) => {
      if (session.role === 'STUDENT') {
        const { privateNotes: _stripped, ...rest } = l
        return rest
      }
      return l
    })

    return { lessons: sanitised, total, page, limit }
  },

  async getById(id: string, session: JWTPayload) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        booking: { select: { startAt: true, endAt: true, service: { select: { name: true } } } },
        tutor: { select: { id: true, name: true } },
      },
    })

    if (!lesson) return null
    if (!canAccessLesson(session, lesson)) {
      throw new AuthError('FORBIDDEN', 'Access denied', 403)
    }

    // Students never see privateNotes
    if (session.role === 'STUDENT') {
      const { privateNotes: _stripped, ...safe } = lesson
      return safe
    }

    return lesson
  },

  async update(id: string, input: UpdateLessonInput, session: JWTPayload) {
    const lesson = await prisma.lesson.findUnique({ where: { id } })
    if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 })
    if (!canAccessLesson(session, lesson)) {
      throw new AuthError('FORBIDDEN', 'Access denied', 403)
    }

    // Students cannot update lesson records
    if (session.role === 'STUDENT') {
      throw new AuthError('FORBIDDEN', 'Students cannot update lesson records', 403)
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(input.topic !== undefined ? { topic: input.topic } : {}),
        ...(input.privateNotes !== undefined ? { privateNotes: input.privateNotes } : {}),
        ...(input.studentFeedback !== undefined ? { studentFeedback: input.studentFeedback } : {}),
        ...(input.attendanceStatus !== undefined
          ? {
              attendanceStatus: input.attendanceStatus,
              attendanceMarkedBy: session.sub,
              attendanceMarkedAt: new Date(),
            }
          : {}),
        ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
        ...(input.completedAt !== undefined ? { completedAt: new Date(input.completedAt) } : {}),
      },
    })

    logger.info('Lesson updated', { lessonId: id, updatedBy: session.sub })
    return updated
  },

  /** Create lesson record when booking is completed */
  async createFromBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { studentId: true, tutorId: true },
    })
    if (!booking) throw new Error('Booking not found')

    // Idempotent — don't create duplicate
    const existing = await prisma.lesson.findUnique({ where: { bookingId } })
    if (existing) return existing

    return prisma.lesson.create({
      data: {
        bookingId,
        tutorId: booking.tutorId,
        studentId: booking.studentId,
      },
    })
  },
}
