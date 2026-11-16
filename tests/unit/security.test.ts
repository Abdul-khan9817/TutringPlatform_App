import { describe, it, expect, vi } from 'vitest'
import { getClientIp, sanitizeString } from '../../src/lib/security'

describe('getClientIp', () => {
  function makeReq(headers: Record<string, string>) {
    return {
      headers: { get: (key: string) => headers[key] ?? null },
    } as unknown as import('next/server').NextRequest
  }

  it('extracts IP from x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const req = makeReq({ 'x-real-ip': '9.10.11.12' })
    expect(getClientIp(req)).toBe('9.10.11.12')
  })

  it('returns unknown when no IP headers', () => {
    const req = makeReq({})
    expect(getClientIp(req)).toBe('unknown')
  })
})

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('removes control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld')
    expect(sanitizeString('test\x1Fstring')).toBe('teststring')
  })

  it('preserves normal text', () => {
    expect(sanitizeString('Hello, World!')).toBe('Hello, World!')
  })
})
