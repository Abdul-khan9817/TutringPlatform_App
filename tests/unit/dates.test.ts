import { describe, it, expect } from 'vitest'
import { calculateEndTime, hasOverlap } from '../../src/lib/dates'

describe('calculateEndTime', () => {
  it('adds duration to start time', () => {
    const start = new Date('2025-01-15T10:00:00Z')
    const end = calculateEndTime(start, 60)
    expect(end.getTime()).toBe(new Date('2025-01-15T11:00:00Z').getTime())
  })
  it('handles 90 minute lessons', () => {
    const start = new Date('2025-01-15T10:00:00Z')
    const end = calculateEndTime(start, 90)
    expect(end.getTime()).toBe(new Date('2025-01-15T11:30:00Z').getTime())
  })
})

describe('hasOverlap', () => {
  it('detects overlapping slots', () => {
    const a = { start: new Date('2025-01-15T10:00:00Z'), end: new Date('2025-01-15T11:00:00Z') }
    const b = { start: new Date('2025-01-15T10:30:00Z'), end: new Date('2025-01-15T11:30:00Z') }
    expect(hasOverlap(a.start, a.end, b.start, b.end)).toBe(true)
  })
  it('allows adjacent slots', () => {
    const a = { start: new Date('2025-01-15T10:00:00Z'), end: new Date('2025-01-15T11:00:00Z') }
    const b = { start: new Date('2025-01-15T11:00:00Z'), end: new Date('2025-01-15T12:00:00Z') }
    expect(hasOverlap(a.start, a.end, b.start, b.end)).toBe(false)
  })
  it('detects contained slots', () => {
    const outer = { start: new Date('2025-01-15T10:00:00Z'), end: new Date('2025-01-15T12:00:00Z') }
    const inner = { start: new Date('2025-01-15T10:30:00Z'), end: new Date('2025-01-15T11:30:00Z') }
    expect(hasOverlap(outer.start, outer.end, inner.start, inner.end)).toBe(true)
  })
  it('detects non-overlapping slots', () => {
    const a = { start: new Date('2025-01-15T10:00:00Z'), end: new Date('2025-01-15T11:00:00Z') }
    const b = { start: new Date('2025-01-15T12:00:00Z'), end: new Date('2025-01-15T13:00:00Z') }
    expect(hasOverlap(a.start, a.end, b.start, b.end)).toBe(false)
  })
})
