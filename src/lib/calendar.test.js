// Tests for the pure .ics builder. A fixed `now` keeps the DTSTAMP deterministic.

import { describe, it, expect } from 'vitest'
import { buildCalendar, datedTaskCount } from './calendar.js'

const NOW = new Date(Date.UTC(2026, 9, 21, 14, 30, 0)) // 2026-10-21T14:30:00Z

const tasks = [
  { id: 't1', title: 'Write intro', size: 'M', status: 'doing', dueDate: '2026-10-25' },
  { id: 't2', title: 'Record, edit & upload', size: 'L', status: 'todo', dueDate: '2026-11-02' },
  { id: 't3', title: 'No deadline task', size: 'S', status: 'todo', dueDate: null },
]

describe('buildCalendar', () => {
  it('emits a VCALENDAR with one VEVENT per dated task', () => {
    const ics = buildCalendar('History Project', tasks, { now: NOW })
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2) // t3 has no due date
  })

  it('writes all-day dates with an exclusive next-day DTEND', () => {
    const ics = buildCalendar('History Project', tasks, { now: NOW })
    expect(ics).toContain('DTSTART;VALUE=DATE:20261025')
    expect(ics).toContain('DTEND;VALUE=DATE:20261026')
    // Month rollover: Nov 2 → Nov 3.
    expect(ics).toContain('DTSTART;VALUE=DATE:20261102')
    expect(ics).toContain('DTEND;VALUE=DATE:20261103')
  })

  it('uses the injected now for DTSTAMP', () => {
    const ics = buildCalendar('History Project', tasks, { now: NOW })
    expect(ics).toContain('DTSTAMP:20261021T143000Z')
  })

  it('escapes special characters in the summary', () => {
    const ics = buildCalendar('History Project', tasks, { now: NOW })
    expect(ics).toContain('SUMMARY:History Project: Record\\, edit & upload')
  })

  it('counts only tasks with a valid due date', () => {
    expect(datedTaskCount(tasks)).toBe(2)
    expect(datedTaskCount([])).toBe(0)
  })
})
