import { NextRequest } from 'next/server'
import { getSession, getAuthenticatedUser } from '@/lib/auth'
import { apiSuccess, apiUnauthorized } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return apiUnauthorized()
    const user = await getAuthenticatedUser(session)
    return apiSuccess(user)
  } catch (err) {
    return handleApiError(err)
  }
}
