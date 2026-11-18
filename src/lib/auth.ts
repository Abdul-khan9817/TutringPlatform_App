import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from './prisma'
import { logger } from './logger'
import type { Role } from '@prisma/client'

const ACCESS_COOKIE = 'ws_access'
const REFRESH_COOKIE = 'ws_refresh'
const BCRYPT_ROUNDS = 12

// ─── JWT ──────────────────────────────────────────────────────────────────────

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export interface JWTPayload {
  sub: string   // userId
  role: Role
  email: string
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  const expiresIn = parseInt(process.env.JWT_ACCESS_EXPIRES_IN ?? '900', 10)
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret())
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '604800', 10)
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      sub: payload.sub as string,
      role: payload.role as Role,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

// ─── Cookies ──────────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production'

export function setAuthCookies(accessToken: string, refreshToken: string) {
  try {
    const cookieStore = cookies()
    const accessExp = parseInt(process.env.JWT_ACCESS_EXPIRES_IN ?? '900', 10)
    const refreshExp = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '604800', 10)

    cookieStore.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessExp,
      path: '/',
    })

    cookieStore.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: refreshExp,
      path: '/api/v1/auth/refresh',
    })
  } catch {
    // Graceful fallback outside Next.js request scope (e.g. testing or scripts)
  }
}

export function clearAuthCookies() {
  try {
    const cookieStore = cookies()
    cookieStore.delete(ACCESS_COOKIE)
    cookieStore.delete(REFRESH_COOKIE)
  } catch {
    // Graceful fallback outside Next.js request scope
  }
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function getSession(req?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined

  if (req) {
    token = req.cookies.get(ACCESS_COOKIE)?.value
  } else {
    token = cookies().get(ACCESS_COOKIE)?.value
  }

  if (!token) return null
  return verifyToken(token)
}

export async function requireSession(req?: NextRequest): Promise<JWTPayload> {
  const session = await getSession(req)
  if (!session) {
    throw new AuthError('UNAUTHENTICATED', 'Authentication required', 401)
  }
  return session
}

export async function requireRole(roles: Role[], req?: NextRequest): Promise<JWTPayload> {
  const session = await requireSession(req)
  if (!roles.includes(session.role)) {
    throw new AuthError('FORBIDDEN', 'Insufficient permissions', 403)
  }
  return session
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Secure tokens ────────────────────────────────────────────────────────────

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// ─── Custom error class ───────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// ─── Refresh session management ───────────────────────────────────────────────

export async function createRefreshSession(
  userId: string,
  refreshToken: string,
  metadata?: { userAgent?: string; ipAddress?: string }
) {
  try {
    const tokenHash = hashToken(refreshToken)
    const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '604800', 10)

    await prisma.refreshSession.create({
      data: {
        userId,
        tokenHash,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    })
  } catch (err) {
    logger.warn('Failed to persist refresh session to database (running in fallback)', { error: String(err) })
  }
}

export async function invalidateRefreshSession(refreshToken: string) {
  try {
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshSession.deleteMany({ where: { tokenHash } })
  } catch (err) {
    logger.warn('Failed to delete refresh session from database', { error: String(err) })
  }
}

export async function invalidateAllUserSessions(userId: string) {
  try {
    await prisma.refreshSession.deleteMany({ where: { userId } })
    logger.info('All sessions invalidated', { userId })
  } catch (err) {
    logger.warn('Failed to delete user sessions from database', { error: String(err) })
  }
}

// ─── Get full user from session ───────────────────────────────────────────────

export async function getAuthenticatedUser(session: JWTPayload) {
  // The system administrator is authenticated from configured credentials and
  // does not have a corresponding row in the application database. Skip the
  // database lookup (which can be slow when a hosted database is waking up).
  if (session.role === 'ADMIN' && session.sub === 'admin-system-master') {
    let adminName = process.env.ADMIN_NAME ?? 'Administrator'
    let adminEmail = session.email
    let adminAvatar = ''
    let adminTitle = 'Lead Administrator'
    try {
      const { getAdminProfile } = await import('./admin-data')
      const profile = await getAdminProfile()
      if (profile.name) adminName = profile.name
      if (profile.email) adminEmail = profile.email
      if (profile.avatarUrl) adminAvatar = profile.avatarUrl
      if (profile.title) adminTitle = profile.title
    } catch {}

    return {
      id: session.sub,
      email: adminEmail,
      name: adminName,
      role: 'ADMIN' as Role,
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      studentProfile: null,
      tutorProfile: null,
      avatarUrl: adminAvatar,
      title: adminTitle,
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        studentProfile: true,
        tutorProfile: true,
      },
    })

    if (user) return user
  } catch (err) {
    logger.warn('Database query failed for authenticated user', { error: String(err) })
  }

  // Local development can run without DATABASE_URL. In that case, allow
  // students authenticated from the in-memory account store to load the app.
  if (session.role === 'STUDENT') {
    try {
      const { findStudentById } = await import('./admin-data')
      const student = await findStudentById(session.sub)
      if (student?.status === 'ACTIVE') {
        return {
          id: student.id,
          email: student.email,
          name: student.name,
          role: 'STUDENT' as Role,
          isActive: true,
          emailVerifiedAt: new Date(),
          createdAt: new Date(student.joinedAt),
          studentProfile: {
            id: student.id,
            userId: student.id,
            createdAt: new Date(student.joinedAt),
            updatedAt: new Date(student.joinedAt),
            phone: student.phone || null,
            preferredLanguage: student.preferredLanguage,
            currentLevel: student.currentLevel,
            learningGoals: null,
            timezone: 'Europe/Lisbon',
            companyName: null,
            notes: student.notes ?? null,
          },
          tutorProfile: null,
        }
      }
    } catch {}
  }

  // Resilient fallback for ADMIN session (e.g. system admin credentials)
  if (session.role === 'ADMIN') {
    let adminName = process.env.ADMIN_NAME ?? 'Administrator'
    let adminEmail = session.email
    let adminAvatar = ''
    let adminTitle = 'Lead Administrator'
    try {
      const { getAdminProfile } = await import('./admin-data')
      const profile = await getAdminProfile()
      if (profile.name) adminName = profile.name
      if (profile.email) adminEmail = profile.email
      if (profile.avatarUrl) adminAvatar = profile.avatarUrl
      if (profile.title) adminTitle = profile.title
    } catch {}

    return {
      id: session.sub,
      email: adminEmail,
      name: adminName,
      role: 'ADMIN' as Role,
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      studentProfile: null,
      tutorProfile: null,
      avatarUrl: adminAvatar,
      title: adminTitle,
    }
  }

  throw new AuthError('USER_NOT_FOUND', 'User account not found or deactivated', 401)
}
