
import { jwtVerify } from 'jose'
import type { Role } from '@prisma/client'

const VALID_ROLES: readonly Role[] = [
  'STUDENT',
  'TUTOR',
  'ADMIN',
]

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }

  return new TextEncoder().encode(secret)
}

export interface JWTPayload {
  sub: string
  role: Role
  email: string
}

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    })

    if (
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      typeof payload.email !== 'string' ||
      payload.email.length === 0 ||
      typeof payload.role !== 'string' ||
      !VALID_ROLES.includes(payload.role as Role)
    ) {
      return null
    }

    return {
      sub: payload.sub,
      role: payload.role as Role,
      email: payload.email,
    }
  } catch {
    return null
  }
}
