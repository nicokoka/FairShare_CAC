// Unit tests for isReviewComplete — the guard that keeps the peer-review submit
// button disabled until every teammate has a full 1–5 rating on all three
// criteria (comments stay optional).

import { describe, it, expect } from 'vitest'
import { isReviewComplete } from './reviews.js'

const full = { effort: 4, quality: 5, teamwork: 3 }

describe('isReviewComplete', () => {
  it('is true only when every teammate has all three criteria rated', () => {
    const ratings = { b: full, c: { effort: 1, quality: 2, teamwork: 3, comment: 'optional' } }
    expect(isReviewComplete(ratings, ['b', 'c'])).toBe(true)
  })

  it('is false when a teammate is missing entirely', () => {
    expect(isReviewComplete({ b: full }, ['b', 'c'])).toBe(false)
  })

  it('is false when a single criterion is missing', () => {
    const ratings = { b: { effort: 4, quality: 5 } }
    expect(isReviewComplete(ratings, ['b'])).toBe(false)
  })

  it('is false for out-of-range star values', () => {
    expect(isReviewComplete({ b: { effort: 0, quality: 3, teamwork: 3 } }, ['b'])).toBe(false)
    expect(isReviewComplete({ b: { effort: 6, quality: 3, teamwork: 3 } }, ['b'])).toBe(false)
  })

  it('is vacuously true when there are no teammates to rate (solo project)', () => {
    expect(isReviewComplete({}, [])).toBe(true)
  })
})
