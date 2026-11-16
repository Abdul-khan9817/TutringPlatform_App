import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

const PROTECTED_STUDENT = /^\/student/
const PROTECTED_MANAGEMENT = /^\/management/

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── CSP and security headers (additional to next.config.mjs) ──
  const response = NextResponse.next()

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://api.stripe.com",
    ].join('; ')
  )

  // ── Route protection ──────────────────────────────────────────
  const needsAuth = PROTECTED_STUDENT.test(pathname) || PROTECTED_MANAGEMENT.test(pathname)

  if (!needsAuth) return response

  const token = req.cookies.get('ws_access')?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyToken(token)

  if (!payload) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('ws_access')
    return res
  }

  // Role-based path protection
  // Students cannot access management portal
  if (PROTECTED_MANAGEMENT.test(pathname) && payload.role === 'STUDENT') {
    return NextResponse.redirect(new URL('/student/dashboard', req.url))
  }

  // Tutors cannot access student-specific learning portal
  // (Admins have full access to both portals)
  if (PROTECTED_STUDENT.test(pathname) && payload.role === 'TUTOR') {
    return NextResponse.redirect(new URL('/management/dashboard', req.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|api/v1/payments/webhook).*)',
  ],
}
