import { prisma } from '@/lib/prisma'
import { sendEmail, assessmentConfirmationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import type { CreateAssessmentInput } from '@/schemas/assessment.schema'
import type { JWTPayload } from '@/lib/auth'

export const assessmentService = {
  async create(input: CreateAssessmentInput) {
    const preferredDate = input.preferredDate ? new Date(input.preferredDate) : undefined

    const assessment = await prisma.assessmentRequest.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        language: input.language,
        currentLevel: input.currentLevel,
        learningGoals: input.learningGoals,
        deliveryMode: input.deliveryMode,
        preferredDate,
        preferredTime: input.preferredTime,
        message: input.message,
      },
    })

    // Confirm to visitor
    sendEmail({
      to: input.email,
      ...assessmentConfirmationEmail({
        name: input.name,
        language: input.language === 'PORTUGUESE' ? 'Portuguese' : input.language === 'ENGLISH' ? 'English' : 'Portuguese and English',
        preferredDate: input.preferredDate,
      }),
    }).catch((e) => logger.error('Failed to send assessment confirmation', { error: String(e) }))

    // Notify admin
    const adminEmail = process.env.EMAIL_ADMIN
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New Assessment Request — ${input.name}`,
        html: `<p>New assessment request from <strong>${input.name}</strong> (${input.email}) for <strong>${input.language}</strong> lessons.</p><p>Please log in to the management dashboard to review.</p>`,
      }).catch((e) => logger.error('Failed to notify admin', { error: String(e) }))
    }

    logger.info('Assessment request created', { id: assessment.id, email: input.email })
    return assessment
  },

  async list(session: JWTPayload, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 20
    const skip = (page - 1) * limit

    const where = filters?.status ? { status: filters.status as never } : {}

    const [assessments, total] = await Promise.all([
      prisma.assessmentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          assignedTutor: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.assessmentRequest.count({ where }),
    ])

    return { assessments, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string, session: JWTPayload) {
    const assessment = await prisma.assessmentRequest.findUnique({
      where: { id },
      include: { assignedTutor: { select: { id: true, name: true, email: true } } },
    })
    return assessment
  },

  async update(id: string, data: { status?: string; assignedTutorId?: string | null; internalNotes?: string }, session: JWTPayload) {
    return prisma.assessmentRequest.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status as never } : {}),
        ...(data.assignedTutorId !== undefined ? { assignedTutorId: data.assignedTutorId } : {}),
        ...(data.internalNotes !== undefined ? { internalNotes: data.internalNotes } : {}),
      },
    })
  },
}
