import type { Role } from '@prisma/client'
import type { JWTPayload } from './auth'

// ─── Role checks ──────────────────────────────────────────────────────────────

export function isAdmin(session: JWTPayload): boolean {
  return session.role === 'ADMIN'
}

export function isTutor(session: JWTPayload): boolean {
  return session.role === 'TUTOR'
}

export function isStudent(session: JWTPayload): boolean {
  return session.role === 'STUDENT'
}

export function isManagement(session: JWTPayload): boolean {
  return session.role === 'ADMIN' || session.role === 'TUTOR'
}

// ─── Object ownership ─────────────────────────────────────────────────────────

export function canAccessStudentRecord(session: JWTPayload, studentId: string): boolean {
  if (session.role === 'ADMIN') return true
  if (session.role === 'TUTOR') return true // tutors can access any student; further scope in service layer
  return session.sub === studentId // students only own records
}

export function canAccessBooking(
  session: JWTPayload,
  booking: { studentId: string; tutorId: string }
): boolean {
  if (session.role === 'ADMIN') return true
  if (session.role === 'TUTOR') return session.sub === booking.tutorId
  return session.sub === booking.studentId
}

export function canAccessPayment(session: JWTPayload, payment: { studentId: string }): boolean {
  if (session.role === 'ADMIN') return true
  return session.sub === payment.studentId
}

export function canAccessLesson(
  session: JWTPayload,
  lesson: { tutorId: string; studentId: string }
): boolean {
  if (session.role === 'ADMIN') return true
  if (session.role === 'TUTOR') return session.sub === lesson.tutorId
  return session.sub === lesson.studentId
}

// ─── RBAC definitions ─────────────────────────────────────────────────────────

export type Permission =
  | 'assessment:read'
  | 'assessment:write'
  | 'assessment:assign'
  | 'booking:read:own'
  | 'booking:read:any'
  | 'booking:create'
  | 'booking:cancel:own'
  | 'booking:cancel:any'
  | 'booking:reschedule:any'
  | 'student:read:own'
  | 'student:read:any'
  | 'student:write:any'
  | 'tutor:read'
  | 'tutor:write'
  | 'availability:read'
  | 'availability:write'
  | 'lesson:read:own'
  | 'lesson:read:any'
  | 'lesson:write'
  | 'attendance:write'
  | 'material:read:own'
  | 'material:read:any'
  | 'material:write'
  | 'homework:read:own'
  | 'homework:read:any'
  | 'homework:write'
  | 'progress:read:own'
  | 'progress:read:any'
  | 'progress:write'
  | 'payment:read:own'
  | 'payment:read:any'
  | 'report:read'
  | 'settings:read'
  | 'settings:write'
  | 'admin:users'

const rolePermissions: Record<Role, Permission[]> = {
  STUDENT: [
    'booking:read:own',
    'booking:create',
    'booking:cancel:own',
    'student:read:own',
    'lesson:read:own',
    'material:read:own',
    'homework:read:own',
    'progress:read:own',
    'payment:read:own',
  ],
  TUTOR: [
    'assessment:read',
    'assessment:assign',
    'booking:read:any',
    'booking:cancel:any',
    'booking:reschedule:any',
    'student:read:any',
    'tutor:read',
    'availability:read',
    'availability:write',
    'lesson:read:any',
    'lesson:write',
    'attendance:write',
    'material:read:any',
    'material:write',
    'homework:read:any',
    'homework:write',
    'progress:read:any',
    'progress:write',
    'payment:read:any',
  ],
  ADMIN: [
    'assessment:read',
    'assessment:write',
    'assessment:assign',
    'booking:read:any',
    'booking:create',
    'booking:cancel:any',
    'booking:reschedule:any',
    'student:read:any',
    'student:write:any',
    'tutor:read',
    'tutor:write',
    'availability:read',
    'availability:write',
    'lesson:read:any',
    'lesson:write',
    'attendance:write',
    'material:read:any',
    'material:write',
    'homework:read:any',
    'homework:write',
    'progress:read:any',
    'progress:write',
    'payment:read:any',
    'report:read',
    'settings:read',
    'settings:write',
    'admin:users',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function requirePermission(session: JWTPayload, permission: Permission): void {
  if (!hasPermission(session.role, permission)) {
    throw Object.assign(new Error(`Missing permission: ${permission}`), {
      code: 'FORBIDDEN',
      statusCode: 403,
    })
  }
}
