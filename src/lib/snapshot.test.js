import { describe, it, expect } from 'vitest'
import { buildSnapshot } from './snapshot.js'

const v = (size, assignee) => ({ size, status: 'verified', assignee })

describe('buildSnapshot', () => {
  it('summarizes verified work, spread, and rating', () => {
    const snap = buildSnapshot({
      tasks: [v('L', 'a'), v('S', 'a'), v('M', 'b')], // a=4pts, b=2pts, total 6
      reviews: [
        { reviewerUid: 'a', ratings: { b: { effort: 4, quality: 4, teamwork: 4 } } },
        { reviewerUid: 'b', ratings: { a: { effort: 3, quality: 3, teamwork: 3 } } },
      ],
      checkins: [{ fairnessFeeling: 4 }],
      memberIds: ['a', 'b'],
    })
    expect(snap.verifiedPoints).toBe(6)
    expect(snap.verifiedTasks).toBe(3)
    expect(Math.round(snap.topShare)).toBe(67)
    expect(Math.round(snap.bottomShare)).toBe(33)
    expect(snap.avgRating).toBe(3.5) // (4 + 3) / 2
  })

  it('flags an imbalanced project', () => {
    const snap = buildSnapshot({
      tasks: [v('L', 'a'), v('L', 'a'), v('S', 'b')], // a=6, b=1 → a ~86%
      reviews: [],
      checkins: [],
      memberIds: ['a', 'b'],
    })
    expect(snap.flags).toContain('imbalanced')
  })

  it('flags no verified work and a low pulse', () => {
    const snap = buildSnapshot({
      tasks: [{ size: 'M', status: 'doing', assignee: 'a' }],
      reviews: [],
      checkins: [{ fairnessFeeling: 1 }],
      memberIds: ['a', 'b'],
    })
    expect(snap.flags).toContain('no-verified-work')
    expect(snap.flags).toContain('low-pulse')
    expect(snap.verifiedPoints).toBe(0)
  })

  it('does not flag a balanced, healthy project', () => {
    const snap = buildSnapshot({
      tasks: [v('M', 'a'), v('M', 'b')],
      reviews: [],
      checkins: [{ fairnessFeeling: 5 }],
      memberIds: ['a', 'b'],
    })
    expect(snap.flags).toEqual([])
  })
})
