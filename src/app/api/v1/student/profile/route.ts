import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'
import { apiSuccess, safeParseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'
import { phoneSchema } from '@/lib/validation'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema,
  preferredLanguage: z.enum(['PORTUGUESE', 'ENGLISH', 'BOTH']).optional(),
  currentLevel: z.string().max(50).optional(),
  learningGoals: z.string().max(1000).optional(),
  timezone: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true, emailVerifiedAt: true,
        studentProfile: true,
      },
    })
    return apiSuccess(user)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const parsed = await safeParseBody(req, updateProfileSchema)
    if ('error' in parsed) return parsed.error

    const { name, ...profileData } = parsed.data

    await prisma.$transaction([
      ...(name ? [prisma.user.update({ where: { id: session.sub }, data: { name } })] : []),
      prisma.studentProfile.update({
        where: { userId: session.sub },
        data: profileData,
      }),
    ])

    return apiSuccess(null, 'Profile updated')
  } catch (err) {
    return handleApiError(err)
  }
}
