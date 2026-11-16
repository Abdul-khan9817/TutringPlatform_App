import { NextRequest } from 'next/server'
import { assessmentService } from '@/services/assessment.service'
import { createAssessmentSchema } from '@/schemas/assessment.schema'
import { safeParseBody, apiSuccess, paginationSchema } from '@/lib/validation'
import { rateLimit, rateLimits } from '@/lib/rate-limit'
import { getSession } from '@/lib/auth'
import { handleApiError } from '@/lib/security'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const throttle = await rateLimit(req, rateLimits.assessment)
  if (throttle) return throttle

  const parsed = await safeParseBody(req, createAssessmentSchema)
  if ('error' in parsed) return parsed.error

  try {
    const assessment = await assessmentService.create(parsed.data)
    return apiSuccess({ id: assessment.id }, 'Assessment request received', 201)
  } catch (err) {
    return handleApiError(err)
  }
}

const listSchema = paginationSchema.extend({
  status: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TUTOR')) {
      return apiSuccess(null, 'Unauthorized', 401)
    }

    const params = Object.fromEntries(req.nextUrl.searchParams)
    const parsed = listSchema.safeParse(params)
    const filters = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const result = await assessmentService.list(session, filters)
    return apiSuccess(result)
  } catch (err) {
    return handleApiError(err)
  }
}
