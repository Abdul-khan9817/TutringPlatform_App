import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/auth'
import { apiSuccess, safeParseBody, paginationSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

const createHomeworkSchema = z.object({
  lessonId: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  title: z.string().min(1).max(200),
  instructions: z.string().min(1).max(5000),
  dueAt: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
    const skip = (page - 1) * limit

    const where =
      session.role === 'STUDENT'
        ? { studentId: session.sub }
        : session.role === 'TUTOR'
          ? { assignedById: session.sub }
          : {}

    const [homework, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        include: {
          submission: { select: { id: true, submittedAt: true, feedback: true } },
          assignedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.homework.count({ where }),
    ])

    return apiSuccess({ homework, total, page, limit })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['TUTOR', 'ADMIN'], req)
    const parsed = await safeParseBody(req, createHomeworkSchema)
    if ('error' in parsed) return parsed.error

    const hw = await prisma.homework.create({
      data: {
        ...parsed.data,
        assignedById: session.sub,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      },
    })
    return apiSuccess(hw, 'Homework assigned', 201)
  } catch (err) {
    return handleApiError(err)
  }
}
