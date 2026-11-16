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
    const search = req.nextUrl.searchParams.get('search') ?? ''
    const skip = (page - 1) * limit

    const where = search
      ? { role: 'STUDENT' as const, OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ]}
      : { role: 'STUDENT' as const }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, isActive: true, createdAt: true,
          studentProfile: { select: { preferredLanguage: true, currentLevel: true, phone: true } },
          _count: { select: { bookingsAsStudent: true, packagePurchases: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return apiSuccess({ students, total, page, limit })
  } catch (err) {
    return handleApiError(err)
  }
}
