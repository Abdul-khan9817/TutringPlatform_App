import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/auth'
import { apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const materials =
      session.role === 'STUDENT'
        ? await prisma.learningMaterial.findMany({
            where: {
              OR: [
                { isPublic: true },
                { accessGrants: { some: { studentId: session.sub } } },
              ],
            },
            select: {
              id: true,
              title: true,
              description: true,
              mimeType: true,
              fileSize: true,
              language: true,
              createdAt: true,
              // fileKey excluded — student gets signed URL separately
            },
            orderBy: { createdAt: 'desc' },
          })
        : await prisma.learningMaterial.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
          })

    return apiSuccess(materials)
  } catch (err) {
    return handleApiError(err)
  }
}
