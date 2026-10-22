import { describe, it, expect } from 'vitest'
import { summarizeCheckins } from './checkins.js'

describe('summarizeCheckins', () => {
  it('returns an empty pulse when nobody has checked in', () => {
    expect(summarizeCheckins([])).toEqual({ count: 0, avgFeeling: null, lowCount: 0 })
  })

  it('averages the feelings and counts the low ones', () => {
    const pulse = summarizeCheckins([
      { fairnessFeeling: 5 },
      { fairnessFeeling: 4 },
      { fairnessFeeling: 2 }, // low
      { fairnessFeeling: 1 }, // low
    ])
    expect(pulse.count).toBe(4)
    expect(pulse.avgFeeling).toBe(3)
    expect(pulse.lowCount).toBe(2)
  })

  it('ignores entries without a numeric feeling', () => {
    const pulse = summarizeCheckins([{ fairnessFeeling: 4 }, { note: 'no rating' }, {}])
    expect(pulse.count).toBe(1)
    expect(pulse.avgFeeling).toBe(4)
  })
})
