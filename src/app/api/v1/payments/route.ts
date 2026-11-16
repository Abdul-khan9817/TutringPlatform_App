import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
    const skip = (page - 1) * limit

    const where = session.role === 'STUDENT' ? { studentId: session.sub } : {}

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: { include: { service: { select: { name: true } } } },
          packagePurchase: { include: { package: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    return apiSuccess({ payments, total, page, limit })
  } catch (err) {
    return handleApiError(err)
  }
}
