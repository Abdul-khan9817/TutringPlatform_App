import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { apiSuccess } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('ws_refresh')?.value
  await authService.logout(refreshToken)

  const response = apiSuccess(null, 'Logged out successfully')
  response.cookies.delete('ws_access')
  response.cookies.delete('ws_refresh')
  return response
}
