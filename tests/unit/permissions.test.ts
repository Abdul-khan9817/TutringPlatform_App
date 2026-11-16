import { describe, it, expect } from 'vitest'
import { hasPermission, canAccessBooking, canAccessPayment } from '../../src/lib/permissions'
import type { JWTPayload } from '../../src/lib/auth'

const adminSession: JWTPayload = { sub: 'admin-id', role: 'ADMIN', email: 'admin@test.com' }
const tutorSession: JWTPayload = { sub: 'tutor-id', role: 'TUTOR', email: 'tutor@test.com' }
const studentSession: JWTPayload = { sub: 'student-id', role: 'STUDENT', email: 'student@test.com' }

describe('hasPermission', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('ADMIN', 'admin:users')).toBe(true)
    expect(hasPermission('ADMIN', 'payment:read:any')).toBe(true)
    expect(hasPermission('ADMIN', 'settings:write')).toBe(true)
  })
  it('student cannot access admin permissions', () => {
    expect(hasPermission('STUDENT', 'admin:users')).toBe(false)
    expect(hasPermission('STUDENT', 'student:write:any')).toBe(false)
    expect(hasPermission('STUDENT', 'report:read')).toBe(false)
  })
  it('tutor can access student records', () => {
    expect(hasPermission('TUTOR', 'student:read:any')).toBe(true)
  })
})

describe('canAccessBooking', () => {
  const booking = { studentId: 'student-id', tutorId: 'tutor-id' }
  it('student can access own booking', () => expect(canAccessBooking(studentSession, booking)).toBe(true))
  it('student cannot access other booking', () => {
    const other: JWTPayload = { sub: 'other-id', role: 'STUDENT', email: 'x@t.com' }
    expect(canAccessBooking(other, booking)).toBe(false)
  })
  it('tutor can access own booking', () => expect(canAccessBooking(tutorSession, booking)).toBe(true))
  it('admin can access any booking', () => expect(canAccessBooking(adminSession, booking)).toBe(true))
})

describe('canAccessPayment', () => {
  const payment = { studentId: 'student-id' }
  it('student can access own payment', () => expect(canAccessPayment(studentSession, payment)).toBe(true))
  it('student cannot access other payment', () => {
    const other: JWTPayload = { sub: 'other-id', role: 'STUDENT', email: 'x@t.com' }
    expect(canAccessPayment(other, payment)).toBe(false)
  })
  it('admin can access any payment', () => expect(canAccessPayment(adminSession, payment)).toBe(true))
})
