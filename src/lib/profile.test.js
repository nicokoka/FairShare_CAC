import { describe, it, expect } from 'vitest'
import { summarizeProfile } from './profile.js'

const rows = [
  { projectId: 'p1', name: 'History', endedAt: 300, myShare: 50, myPoints: 6, myRating: 4 },
  { projectId: 'p2', name: 'Science', endedAt: 100, myShare: 30, myPoints: 3, myRating: null },
  { projectId: 'p3', name: 'Art', endedAt: 200, myShare: 70, myPoints: 7, myRating: 5 },
]

describe('summarizeProfile', () => {
  it('sums points and averages shares across all projects', () => {
    const s = summarizeProfile(rows)
    expect(s.projectsCount).toBe(3)
    expect(s.totalPoints).toBe(16)
    expect(s.avgShare).toBeCloseTo((50 + 30 + 70) / 3)
  })

  it('averages ratings only over projects that were rated', () => {
    const s = summarizeProfile(rows)
    expect(s.ratedProjects).toBe(2)
    expect(s.avgRating).toBe(4.5) // (4 + 5) / 2, p2 ignored
  })

  it('orders the timeline oldest-ended first', () => {
    const s = summarizeProfile(rows)
    expect(s.timeline.map((r) => r.projectId)).toEqual(['p2', 'p3', 'p1'])
  })

  it('returns null averages and zero totals for an empty history', () => {
    expect(summarizeProfile([])).toEqual({
      projectsCount: 0,
      totalPoints: 0,
      avgShare: null,
      avgRating: null,
      ratedProjects: 0,
      timeline: [],
    })
  })
})
