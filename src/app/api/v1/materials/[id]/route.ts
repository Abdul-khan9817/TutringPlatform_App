import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'
import { apiSuccess, apiNotFound, apiForbidden } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const material = await prisma.learningMaterial.findUnique({ where: { id: params.id } })
    if (!material) return apiNotFound('Material')

    // Check student access
    if (session.role === 'STUDENT') {
      if (!material.isPublic) {
        const access = await prisma.materialAccess.findUnique({
          where: { studentId_materialId: { studentId: session.sub, materialId: params.id } },
        })
        if (!access) return apiForbidden('You do not have access to this material')
        if (access.expiresAt && access.expiresAt < new Date()) {
          return apiForbidden('Your access to this material has expired')
        }
      }
      // Return metadata only - signed URL generation requires storage config
      const { fileKey: _stripped, ...safe } = material
      return apiSuccess({ ...safe, downloadUrl: null, note: 'Configure STORAGE_* env vars to enable downloads' })
    }

    return apiSuccess(material)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    if (session.role === 'STUDENT') return apiForbidden()

    const material = await prisma.learningMaterial.findUnique({ where: { id: params.id } })
    if (!material) return apiNotFound('Material')
    if (session.role === 'TUTOR' && material.uploadedById !== session.sub) {
      return apiForbidden('You can only delete materials you uploaded')
    }

    await prisma.learningMaterial.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Material deleted')
  } catch (err) {
    return handleApiError(err)
  }
}
