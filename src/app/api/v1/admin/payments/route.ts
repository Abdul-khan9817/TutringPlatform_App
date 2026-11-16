import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN'], req)
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: {
          student: { select: { name: true, email: true } },
          booking: { include: { service: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count(),
    ])

    return apiSuccess({ payments, total, page, limit })
  } catch (err) {
    return handleApiError(err)
  }
}
