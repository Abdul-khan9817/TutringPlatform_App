import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '../../src/lib/auth'

describe('Password hashing', () => {
  it('hashes a password', async () => {
    const hash = await hashPassword('TestPassword1')
    expect(hash).not.toBe('TestPassword1')
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true)
  })

  it('verifies correct password', async () => {
    const hash = await hashPassword('TestPassword1')
    expect(await verifyPassword('TestPassword1', hash)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('TestPassword1')
    expect(await verifyPassword('WrongPassword1', hash)).toBe(false)
  })

  it('produces different hashes for same password', async () => {
    const h1 = await hashPassword('TestPassword1')
    const h2 = await hashPassword('TestPassword1')
    expect(h1).not.toBe(h2) // bcrypt uses random salt
  })
})

describe('Secure token generation', () => {
  it('generates a hex token', () => {
    const token = generateSecureToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('generates unique tokens', () => {
    const t1 = generateSecureToken()
    const t2 = generateSecureToken()
    expect(t1).not.toBe(t2)
  })

  it('hash is consistent', () => {
    const token = generateSecureToken()
    expect(hashToken(token)).toBe(hashToken(token))
  })

  it('different tokens produce different hashes', () => {
    expect(hashToken(generateSecureToken())).not.toBe(hashToken(generateSecureToken()))
  })
})
