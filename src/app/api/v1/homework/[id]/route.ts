import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'
import { apiSuccess, apiNotFound, safeParseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

const updateHomeworkSchema = z.object({
  status: z.enum(['ASSIGNED', 'SUBMITTED', 'REVIEWED', 'OVERDUE']).optional(),
  feedback: z.string().max(5000).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const hw = await prisma.homework.findUnique({ where: { id: params.id } })
    if (!hw) return apiNotFound('Homework')

    const parsed = await safeParseBody(req, updateHomeworkSchema)
    if ('error' in parsed) return parsed.error

    const updated = await prisma.homework.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return apiSuccess(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
