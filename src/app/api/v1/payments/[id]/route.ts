import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'
import { apiSuccess, apiNotFound } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { canAccessPayment } from '@/lib/permissions'
import { AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: { include: { service: { select: { name: true } } } },
        packagePurchase: { include: { package: { select: { name: true } } } },
      },
    })

    if (!payment) return apiNotFound('Payment')
    if (!canAccessPayment(session, payment)) {
      throw new AuthError('FORBIDDEN', 'Access denied', 403)
    }

    return apiSuccess(payment)
  } catch (err) {
    return handleApiError(err)
  }
}
