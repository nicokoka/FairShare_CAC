// Tests for the pure CSV builder. The download wrapper (DOM + Blob) isn't tested
// here — only the string it would download, which is where all the logic lives.

import { describe, it, expect } from 'vitest'
import { buildReportCsv } from './exportReport.js'

const nameFor = (uid) => ({ a: 'Alex', b: 'Sam, Jr.' }[uid] || uid)

const fixture = {
  project: { name: 'History Project' },
  ranked: ['a', 'b'],
  contrib: {
    byMember: {
      a: { verifiedTasks: 3, points: 6, share: 66.6667 },
      b: { verifiedTasks: 1, points: 3, share: 33.3333 },
    },
  },
  ratingByMember: {
    a: { perCriterion: { effort: 4.5, quality: 4, teamwork: 3 }, overall: 3.8333, reviewCount: 2 },
    b: { perCriterion: { effort: null, quality: null, teamwork: null }, overall: null, reviewCount: 0 },
  },
  nameFor,
}

describe('buildReportCsv', () => {
  it('starts with a title row naming the project and then the header', () => {
    const lines = buildReportCsv(fixture).split('\r\n')
    expect(lines[0]).toBe('FairShare report: History Project')
    expect(lines[1]).toBe(
      'Member,Verified tasks,Points,Share of verified work (%),Effort,Quality,Teamwork,Overall rating,Reviews received',
    )
  })

  it('rounds share to a whole percent and ratings to one decimal', () => {
    const lines = buildReportCsv(fixture).split('\r\n')
    expect(lines[2]).toBe('Alex,3,6,67,4.5,4.0,3.0,3.8,2')
  })

  it('leaves unrated cells blank rather than writing 0', () => {
    const lines = buildReportCsv(fixture).split('\r\n')
    // Sam has no ratings: share 33, then four empty rating cells, then 0 reviews.
    expect(lines[3]).toBe('"Sam, Jr.",1,3,33,,,,,0')
  })

  it('quotes and escapes fields containing commas', () => {
    const csv = buildReportCsv(fixture)
    expect(csv).toContain('"Sam, Jr."')
  })
})
