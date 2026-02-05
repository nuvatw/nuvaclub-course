import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  getStepStatusColor,
  getCategoryColor,
} from '../utils'

describe('formatDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2026-02-05')
    const result = formatDate(date)
    expect(result).toMatch(/Feb/)
    expect(result).toMatch(/5/)
    expect(result).toMatch(/2026/)
  })

  it('formats ISO date string correctly', () => {
    const result = formatDate('2026-12-25')
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/25/)
    expect(result).toMatch(/2026/)
  })

  it('formats full ISO datetime string correctly', () => {
    const result = formatDate('2026-01-15T14:30:00Z')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2026/)
  })

  it('returns date in en-US format', () => {
    const result = formatDate('2026-03-10')
    // Should be like "Mar 10, 2026"
    expect(result).toMatch(/Mar\s+10,?\s+2026/)
  })

  it('handles different months correctly', () => {
    expect(formatDate('2026-01-01')).toMatch(/Jan/)
    expect(formatDate('2026-06-15')).toMatch(/Jun/)
    expect(formatDate('2026-11-30')).toMatch(/Nov/)
  })
})

describe('formatDateTime', () => {
  it('formats Date object with time correctly', () => {
    const date = new Date('2026-02-05T14:30:00')
    const result = formatDateTime(date)
    expect(result).toMatch(/Feb/)
    expect(result).toMatch(/5/)
    expect(result).toMatch(/2026/)
    // Should include time (format depends on locale)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('formats ISO datetime string correctly', () => {
    const result = formatDateTime('2026-12-25T09:15:00Z')
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/25/)
    expect(result).toMatch(/2026/)
  })

  it('includes time in the output', () => {
    const result = formatDateTime('2026-03-10T18:45:00')
    // Should contain time portion
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('handles midnight correctly', () => {
    const result = formatDateTime('2026-01-01T00:00:00')
    expect(result).toMatch(/12:00/)
  })

  it('handles noon correctly', () => {
    const result = formatDateTime('2026-01-01T12:00:00')
    expect(result).toMatch(/12:00/)
  })
})

describe('getStepStatusColor', () => {
  it('returns success color for done status', () => {
    expect(getStepStatusColor('done')).toBe('text-success')
  })

  it('returns warning color for in_progress status', () => {
    expect(getStepStatusColor('in_progress')).toBe('text-warning')
  })

  it('returns muted color for not_started status', () => {
    expect(getStepStatusColor('not_started')).toBe('text-muted')
  })

  it('returns muted color as default for unknown status', () => {
    // TypeScript would normally prevent this, but testing defensive coding
    const unknownStatus = 'unknown' as 'not_started' | 'in_progress' | 'done'
    expect(getStepStatusColor(unknownStatus)).toBe('text-muted')
  })
})

describe('getCategoryColor', () => {
  it('returns correct color for Pre-Production', () => {
    expect(getCategoryColor('Pre-Production')).toBe('bg-purple-600')
  })

  it('returns correct color for Research', () => {
    expect(getCategoryColor('Research')).toBe('bg-blue-600')
  })

  it('returns correct color for Planning', () => {
    expect(getCategoryColor('Planning')).toBe('bg-cyan-600')
  })

  it('returns correct color for Content', () => {
    expect(getCategoryColor('Content')).toBe('bg-emerald-600')
  })

  it('returns correct color for Creative', () => {
    expect(getCategoryColor('Creative')).toBe('bg-pink-600')
  })

  it('returns correct color for Production', () => {
    expect(getCategoryColor('Production')).toBe('bg-orange-600')
  })

  it('returns correct color for Post-Production', () => {
    expect(getCategoryColor('Post-Production')).toBe('bg-amber-600')
  })

  it('returns correct color for QA', () => {
    expect(getCategoryColor('QA')).toBe('bg-red-600')
  })

  it('returns correct color for Delivery', () => {
    expect(getCategoryColor('Delivery')).toBe('bg-green-600')
  })

  it('returns correct color for Marketing', () => {
    expect(getCategoryColor('Marketing')).toBe('bg-violet-600')
  })

  it('returns fallback color for unknown category', () => {
    expect(getCategoryColor('Unknown Category')).toBe('bg-muted')
    expect(getCategoryColor('')).toBe('bg-muted')
  })

  it('is case-sensitive', () => {
    // Categories must match exactly
    expect(getCategoryColor('pre-production')).toBe('bg-muted')
    expect(getCategoryColor('PRE-PRODUCTION')).toBe('bg-muted')
    expect(getCategoryColor('research')).toBe('bg-muted')
  })
})
