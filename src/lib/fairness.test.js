// Unit tests for the fairness math — the numbers the whole report is built on.
// These lock in the behavior the comments in fairness.js describe in prose, so a
// future change that quietly breaks the math fails here instead of on a teacher's
// printout. The worked examples mirror the hand-checkable cases from PLAN.md F10.

import { describe, it, expect } from 'vitest'
import { taskPoints, contributionShares, ratingAverages, SIZE_POINTS } from './fairness.js'

// A tiny helper so the tests read like the board does: one verified task worth
// `size`, assigned to `assignee`.
const verified = (size, assignee) => ({ size, status: 'verified', assignee })

describe('taskPoints', () => {
  it('maps S/M/L to 1/2/3', () => {
    expect(taskPoints('S')).toBe(1)
    expect(taskPoints('M')).toBe(2)
    expect(taskPoints('L')).toBe(3)
  })

  it('scores unknown or missing sizes as 0 so a stray task cannot inflate a total', () => {
    expect(taskPoints('XL')).toBe(0)
    expect(taskPoints(undefined)).toBe(0)
    expect(taskPoints(null)).toBe(0)
  })

  it('agrees with the exported SIZE_POINTS table', () => {
    expect(SIZE_POINTS).toEqual({ S: 1, M: 2, L: 3 })
  })
})

describe('contributionShares', () => {
  it('returns everyone at 0% with no divide-by-zero when nothing is verified', () => {
    const tasks = [
      { size: 'L', status: 'doing', assignee: 'a' },
      { size: 'M', status: 'todo', assignee: null },
    ]
    const result = contributionShares(tasks, ['a', 'b'])
    expect(result.totalPoints).toBe(0)
    expect(result.byMember.a).toEqual({ verifiedTasks: 0, points: 0, share: 0 })
    expect(result.byMember.b).toEqual({ verifiedTasks: 0, points: 0, share: 0 })
  })

  it('counts only verified work and splits the share by points', () => {
    // a: L(3) + S(1) = 4 pts; b: M(2) = 2 pts. Total verified = 6.
    const tasks = [
      verified('L', 'a'),
      verified('S', 'a'),
      verified('M', 'b'),
      { size: 'L', status: 'done', assignee: 'b' }, // done-but-unverified: worth 0
    ]
    const result = contributionShares(tasks, ['a', 'b'])
    expect(result.totalPoints).toBe(6)
    expect(result.byMember.a).toEqual({ verifiedTasks: 2, points: 4, share: (4 / 6) * 100 })
    expect(result.byMember.b).toEqual({ verifiedTasks: 1, points: 2, share: (2 / 6) * 100 })
    // The two members' shares cover the whole project (nobody left out here).
    expect(result.byMember.a.share + result.byMember.b.share).toBeCloseTo(100)
  })

  it('credits a verified task assigned to a non-member to nobody, so shares sum under 100%', () => {
    // 'ghost' is not in memberIds (e.g. someone who left). Their 2 pts still
    // count toward the project total but go to no member — the honest picture.
    const tasks = [verified('M', 'a'), verified('M', 'ghost')]
    const result = contributionShares(tasks, ['a'])
    expect(result.totalPoints).toBe(4)
    expect(result.byMember.a.share).toBe(50)
    expect(result.byMember.ghost).toBeUndefined()
  })
})

describe('ratingAverages', () => {
  it('averages each criterion across reviewers and ignores a self-rating', () => {
    const reviews = [
      // b and c rate a; a's own doc should never count toward a's average.
      { reviewerUid: 'b', ratings: { a: { effort: 4, quality: 4, teamwork: 4 } } },
      { reviewerUid: 'c', ratings: { a: { effort: 2, quality: 2, teamwork: 2 } } },
      { reviewerUid: 'a', ratings: { a: { effort: 5, quality: 5, teamwork: 5 } } },
    ]
    const { byMember } = ratingAverages(reviews, ['a', 'b', 'c'])
    expect(byMember.a.perCriterion).toEqual({ effort: 3, quality: 3, teamwork: 3 })
    expect(byMember.a.overall).toBe(3)
    expect(byMember.a.reviewCount).toBe(2) // only b and c rated a
  })

  it('reports null (not 0) for a member nobody rated', () => {
    const { byMember } = ratingAverages([], ['a'])
    expect(byMember.a.perCriterion).toEqual({ effort: null, quality: null, teamwork: null })
    expect(byMember.a.overall).toBeNull()
    expect(byMember.a.reviewCount).toBe(0)
  })

  it('lists members who never submitted a review', () => {
    const reviews = [
      { reviewerUid: 'a', ratings: { b: { effort: 5, quality: 5, teamwork: 5 } } },
    ]
    const { didNotSubmit } = ratingAverages(reviews, ['a', 'b', 'c'])
    expect(didNotSubmit).toEqual(['b', 'c'])
  })

  it('weights each criterion equally in the overall even when one is skipped', () => {
    // One reviewer rated effort/quality but left teamwork out. Overall should be
    // the mean of the criterion means that exist: (5 + 3) / 2 = 4, not (5+3)/3.
    const reviews = [{ reviewerUid: 'b', ratings: { a: { effort: 5, quality: 3 } } }]
    const { byMember } = ratingAverages(reviews, ['a', 'b'])
    expect(byMember.a.perCriterion).toEqual({ effort: 5, quality: 3, teamwork: null })
    expect(byMember.a.overall).toBe(4)
  })
})
