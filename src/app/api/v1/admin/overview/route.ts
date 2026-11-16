import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'TUTOR'], req)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalStudents,
      newStudentsThisMonth,
      upcomingLessons,
      pendingAssessments,
      pendingBookings,
      monthlyRevenue,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({
        where: { role: 'STUDENT', createdAt: { gte: startOfMonth } },
      }),
      prisma.booking.count({
        where: { status: 'CONFIRMED', startAt: { gte: now } },
      }),
      prisma.assessmentRequest.count({ where: { status: 'NEW' } }),
      prisma.booking.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ])

    return apiSuccess({
      totalStudents,
      newStudentsThisMonth,
      upcomingLessons,
      pendingAssessments,
      pendingBookings,
      monthlyRevenue: monthlyRevenue._sum.amount?.toNumber() ?? 0,
      totalRevenue: totalRevenue._sum.amount?.toNumber() ?? 0,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
