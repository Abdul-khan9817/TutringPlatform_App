import { NextRequest } from 'next/server'
import { lessonService } from '@/services/lesson.service'
import { requireSession } from '@/lib/auth'
import { apiSuccess, paginationSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const filters = paginationSchema.safeParse(params)
    const result = await lessonService.list(session, filters.success ? filters.data : {})
    return apiSuccess(result)
  } catch (err) {
    return handleApiError(err)
  }
}
