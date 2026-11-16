import { NextRequest } from 'next/server'
import { lessonService, updateLessonSchema } from '@/services/lesson.service'
import { requireSession } from '@/lib/auth'
import { safeParseBody, apiSuccess, apiNotFound } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const lesson = await lessonService.getById(params.id, session)
    if (!lesson) return apiNotFound('Lesson')
    return apiSuccess(lesson)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req)
    const parsed = await safeParseBody(req, updateLessonSchema)
    if ('error' in parsed) return parsed.error
    const lesson = await lessonService.update(params.id, parsed.data, session)
    return apiSuccess(lesson)
  } catch (err) {
    return handleApiError(err)
  }
}
