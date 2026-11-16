import { NextRequest } from 'next/server'
import { authService } from '@/services/auth.service'
import { resetPasswordSchema } from '@/schemas/auth.schema'
import { safeParseBody, apiSuccess } from '@/lib/validation'
import { handleApiError } from '@/lib/security'

export async function POST(req: NextRequest) {
  const parsed = await safeParseBody(req, resetPasswordSchema)
  if ('error' in parsed) return parsed.error

  try {
    await authService.resetPassword(parsed.data.token, parsed.data.password)
    return apiSuccess(null, 'Password reset successfully. Please log in.')
  } catch (err) {
    return handleApiError(err)
  }
}
