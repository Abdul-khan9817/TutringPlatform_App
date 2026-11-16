import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN'], req)
    const period = req.nextUrl.searchParams.get('period') ?? 'month'

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const [
      revenue, bookingsCount, completedLessons,
      cancelledBookings, newStudents, packageSales,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED', paidAt: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.booking.count({ where: { createdAt: { gte: startDate } } }),
      prisma.lesson.count({ where: { completedAt: { gte: startDate } } }),
      prisma.booking.count({ where: { status: 'CANCELLED', cancelledAt: { gte: startDate } } }),
      prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: startDate } } }),
      prisma.packagePurchase.count({ where: { purchasedAt: { gte: startDate } } }),
    ])

    return apiSuccess({
      period,
      startDate,
      endDate: now,
      revenue: {
        total: revenue._sum.amount?.toNumber() ?? 0,
        transactionCount: revenue._count,
      },
      bookings: {
        total: bookingsCount,
        completed: completedLessons,
        cancelled: cancelledBookings,
        cancellationRate: bookingsCount > 0 ? Math.round((cancelledBookings / bookingsCount) * 100) : 0,
      },
      students: { new: newStudents },
      packages: { sold: packageSales },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
