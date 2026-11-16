import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { emailSchema, passwordSchema, phoneSchema } from '../../src/lib/validation'

describe('emailSchema', () => {
  it('accepts valid email', () => expect(emailSchema.parse('test@example.com')).toBe('test@example.com'))
  it('lowercases email', () => expect(emailSchema.parse('Test@Example.COM')).toBe('test@example.com'))
  it('rejects invalid email', () => expect(() => emailSchema.parse('notanemail')).toThrow())
})

describe('passwordSchema', () => {
  it('accepts strong password', () => expect(() => passwordSchema.parse('SecurePass1')).not.toThrow())
  it('rejects short password', () => expect(() => passwordSchema.parse('Short1')).toThrow())
  it('rejects no uppercase', () => expect(() => passwordSchema.parse('lowercase1')).toThrow())
  it('rejects no number', () => expect(() => passwordSchema.parse('NoNumbers')).toThrow())
})
