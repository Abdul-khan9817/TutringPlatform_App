import { describe, it, expect } from 'vitest'
import { formatEuro } from '../../src/lib/money'
import { Decimal } from '@prisma/client/runtime/library'

describe('formatEuro', () => {
  it('formats integer amounts', () => {
    expect(formatEuro(50)).toMatch('50')
    expect(formatEuro(50)).toContain('€')
  })
  it('formats decimal amounts', () => {
    expect(formatEuro(49.99)).toMatch('49')
  })
  it('formats Decimal type', () => {
    expect(formatEuro(new Decimal('75.50'))).toContain('€')
  })
  it('formats string amounts', () => {
    expect(formatEuro('100')).toContain('€')
  })
})
