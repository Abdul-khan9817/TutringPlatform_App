import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'TUTOR'], req)
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
    const status = req.nextUrl.searchParams.get('status')
    const skip = (page - 1) * limit

    const where = status ? { status: status as never } : {}

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          tutor: { select: { id: true, name: true } },
          service: { select: { name: true, language: true } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { startAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return apiSuccess({ bookings, total, page, limit })
  } catch (err) {
    return handleApiError(err)
  }
}
