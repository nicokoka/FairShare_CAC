// Unit tests for the rule-based insights engine. Each test constructs the report
// numbers that should trip exactly one rule, then asserts the insight shows up
// with the right tone — so the "smart summary" stays honest as the rules evolve.

import { describe, it, expect } from 'vitest'
import { buildInsights } from './insights.js'

// Name stub so the pure function stays testable without any UI.
const nameFor = (uid) => ({ a: 'Alex', b: 'Sam', c: 'Jo' }[uid] || uid)

// Small builders to keep each scenario readable.
const contribOf = (shares) => {
  const byMember = {}
  let totalPoints = 0
  Object.entries(shares).forEach(([uid, share]) => {
    byMember[uid] = { verifiedTasks: 1, points: share, share }
    totalPoints += share
  })
  return { totalPoints, byMember }
}
const rating = (overall, teamwork = overall) => ({
  perCriterion: { effort: overall, quality: overall, teamwork },
  overall,
  reviewCount: 1,
})

const texts = (insights) => insights.map((i) => i.text).join(' | ')

describe('buildInsights', () => {
  it('flags a dominant contributor', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 80, b: 20 }),
      ratingByMember: { a: rating(4), b: rating(4) },
      didNotSubmit: [],
      tasks: [],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => i.tone === 'watch' && /Alex did 80%/.test(i.text))).toBe(true)
  })

  it('celebrates an even split', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 52, b: 48 }),
      ratingByMember: { a: rating(4), b: rating(4) },
      didNotSubmit: [],
      tasks: [],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => i.tone === 'positive' && /shared evenly/.test(i.text))).toBe(true)
  })

  it('surfaces a contribution-vs-teamwork mismatch as friction', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 70, b: 30 }),
      ratingByMember: { a: rating(4, 2), b: rating(4) }, // a carried work, low teamwork
      didNotSubmit: [],
      tasks: [],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => i.tone === 'watch' && /teamwork rating \(2\.0\/5\)/.test(i.text))).toBe(true)
  })

  it('names a near-absent contributor', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 95, b: 5 }),
      ratingByMember: { a: rating(4), b: rating(4) },
      didNotSubmit: [],
      tasks: [],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => /Sam has little to no verified work/.test(i.text))).toBe(true)
  })

  it('reports rework and unverified tasks', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 50, b: 50 }),
      ratingByMember: { a: rating(4), b: rating(4) },
      didNotSubmit: [],
      tasks: [
        { status: 'verified', lastRejection: { reason: 'fix typo' } },
        { status: 'done', lastRejection: null },
      ],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(texts(insights)).toMatch(/sent back for rework/)
    expect(texts(insights)).toMatch(/never reached "verified"/)
  })

  it('notes who did not submit a peer review', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 50, b: 50 }),
      ratingByMember: { a: rating(4), b: rating(4) },
      didNotSubmit: ['b'],
      tasks: [],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => /Sam didn't submit a peer review/.test(i.text))).toBe(true)
  })

  it('handles a project with no verified work without dividing by zero', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 0, b: 0 }),
      ratingByMember: { a: rating(null), b: rating(null) },
      didNotSubmit: [],
      tasks: [{ status: 'todo', lastRejection: null }],
      memberIds: ['a', 'b'],
      nameFor,
    })
    expect(insights.some((i) => /No tasks were verified/.test(i.text))).toBe(true)
  })

  it('leads with a reassuring note when nothing is wrong', () => {
    const insights = buildInsights({
      contrib: contribOf({ a: 34, b: 33, c: 33 }),
      ratingByMember: { a: rating(4), b: rating(4), c: rating(4) },
      didNotSubmit: [],
      tasks: [{ status: 'verified', lastRejection: null }],
      memberIds: ['a', 'b', 'c'],
      nameFor,
    })
    // Even split already yields a positive; make sure we don't double up.
    const positives = insights.filter((i) => i.tone === 'positive')
    expect(positives.length).toBe(1)
    expect(insights.every((i) => i.tone !== 'watch')).toBe(true)
  })
})
