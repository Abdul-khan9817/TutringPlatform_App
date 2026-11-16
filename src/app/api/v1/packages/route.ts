import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, getSession } from '@/lib/auth'
import { apiSuccess, safeParseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    })
    return apiSuccess(packages)
  } catch (err) {
    return handleApiError(err)
  }
}

const createPackageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  language: z.enum(['PORTUGUESE', 'ENGLISH', 'BOTH']),
  lessonCount: z.number().int().positive(),
  validityDays: z.number().int().positive(),
  price: z.number().positive(),
  sortOrder: z.number().int().optional(),
})

export async function POST(req: NextRequest) {
  try {
    await requireRole(['ADMIN'], req)
    const parsed = await safeParseBody(req, createPackageSchema)
    if ('error' in parsed) return parsed.error

    const pkg = await prisma.package.create({ data: parsed.data as never })
    return apiSuccess(pkg, 'Package created', 201)
  } catch (err) {
    return handleApiError(err)
  }
}
