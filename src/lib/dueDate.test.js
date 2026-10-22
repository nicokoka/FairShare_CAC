// Unit tests for the due-date helper. `now` is injected everywhere so the tests
// are deterministic (they never depend on the real clock) — the same discipline
// the function was written for.

import { describe, it, expect } from 'vitest'
import { toDateString, formatDueLabel } from './dueDate.js'

// A fixed "today" for every relative-label test: Oct 15, 2026, mid-morning local.
const NOW = new Date(2026, 9, 15, 10, 0, 0)

describe('toDateString', () => {
  it('formats a Date as local YYYY-MM-DD with zero-padding', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateString(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('formatDueLabel', () => {
  it('returns null when there is no due date', () => {
    expect(formatDueLabel(null, NOW)).toBeNull()
    expect(formatDueLabel(undefined, NOW)).toBeNull()
    expect(formatDueLabel('not-a-date', NOW)).toBeNull()
  })

  it('flags overdue days with singular/plural wording', () => {
    expect(formatDueLabel('2026-10-14', NOW)).toEqual({ label: 'Overdue by 1 day', tone: 'overdue' })
    expect(formatDueLabel('2026-10-12', NOW)).toEqual({ label: 'Overdue by 3 days', tone: 'overdue' })
  })

  it('labels today and tomorrow', () => {
    expect(formatDueLabel('2026-10-15', NOW)).toEqual({ label: 'Due today', tone: 'today' })
    expect(formatDueLabel('2026-10-16', NOW)).toEqual({ label: 'Due tomorrow', tone: 'soon' })
  })

  it('treats within-3-days as soon and further out as a calm date', () => {
    expect(formatDueLabel('2026-10-18', NOW)).toEqual({ label: 'Due in 3 days', tone: 'soon' })
    const far = formatDueLabel('2026-10-25', NOW)
    expect(far.tone).toBe('ok')
    expect(far.label).toMatch(/^Due /)
  })
})
