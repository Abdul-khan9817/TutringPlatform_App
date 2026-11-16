import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess, apiNotFound } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['TUTOR', 'ADMIN'], req)
    const avail = await prisma.availability.findUnique({ where: { id: params.id } })
    if (!avail) return apiNotFound('Availability')
    if (session.role === 'TUTOR' && avail.tutorId !== session.sub) {
      const { apiForbidden } = await import('@/lib/validation')
      return apiForbidden('You can only update your own availability')
    }

    let body: Record<string, unknown>
    try { body = await req.json() } catch { body = {} }

    const updated = await prisma.availability.update({ where: { id: params.id }, data: body as never })
    return apiSuccess(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['TUTOR', 'ADMIN'], req)
    const avail = await prisma.availability.findUnique({ where: { id: params.id } })
    if (!avail) return apiNotFound('Availability')
    if (session.role === 'TUTOR' && avail.tutorId !== session.sub) {
      const { apiForbidden } = await import('@/lib/validation')
      return apiForbidden('You can only delete your own availability')
    }

    await prisma.availability.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Availability deleted')
  } catch (err) {
    return handleApiError(err)
  }
}
