import { NextRequest } from 'next/server'
import { assessmentService } from '@/services/assessment.service'
import { updateAssessmentSchema } from '@/schemas/assessment.schema'
import { safeParseBody, apiSuccess, apiNotFound } from '@/lib/validation'
import { requireRole } from '@/lib/auth'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['ADMIN', 'TUTOR'], req)
    const assessment = await assessmentService.getById(params.id, session)
    if (!assessment) return apiNotFound('Assessment')
    return apiSuccess(assessment)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['ADMIN', 'TUTOR'], req)
    const parsed = await safeParseBody(req, updateAssessmentSchema)
    if ('error' in parsed) return parsed.error

    const assessment = await assessmentService.update(params.id, parsed.data, session)
    return apiSuccess(assessment)
  } catch (err) {
    return handleApiError(err)
  }
}
