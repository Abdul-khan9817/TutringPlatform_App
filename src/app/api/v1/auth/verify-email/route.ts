import { NextRequest } from 'next/server'
import { authService } from '@/services/auth.service'
import { z } from 'zod'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const parsed = await safeParseBody(req, schema)
  if ('error' in parsed) return parsed.error

  try {
    await authService.verifyEmail(parsed.data.token)
    return apiSuccess(null, 'Email verified successfully.')
  } catch (err) {
    return handleApiError(err)
  }
}
