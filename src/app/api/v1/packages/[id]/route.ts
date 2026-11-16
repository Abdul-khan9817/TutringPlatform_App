import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { apiSuccess, apiNotFound, safeParseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

const updatePackageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  lessonCount: z.number().int().positive().optional(),
  validityDays: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: params.id } })
    if (!pkg || !pkg.isActive) return apiNotFound('Package')
    return apiSuccess(pkg)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN'], req)
    const parsed = await safeParseBody(req, updatePackageSchema)
    if ('error' in parsed) return parsed.error

    const pkg = await prisma.package.update({ where: { id: params.id }, data: parsed.data as never })
    return apiSuccess(pkg)
  } catch (err) {
    return handleApiError(err)
  }
}
