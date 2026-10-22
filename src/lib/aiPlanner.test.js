import { describe, it, expect } from 'vitest'
import { buildPlannerPrompt, parseTaskPlan } from './aiPlanner.js'

describe('buildPlannerPrompt', () => {
  it('includes the description and asks for a JSON array of title/size', () => {
    const prompt = buildPlannerPrompt('Make a volcano model')
    expect(prompt).toContain('Make a volcano model')
    expect(prompt).toMatch(/JSON array/i)
    expect(prompt).toMatch(/"size"/)
  })
})

describe('parseTaskPlan', () => {
  it('parses a clean JSON array', () => {
    const out = parseTaskPlan('[{"title":"Research","size":"M"},{"title":"Build","size":"L"}]')
    expect(out).toEqual([
      { title: 'Research', size: 'M' },
      { title: 'Build', size: 'L' },
    ])
  })

  it('tolerates markdown fences and surrounding prose', () => {
    const raw = 'Sure! Here you go:\n```json\n[{"title":"Write intro","size":"s"}]\n```'
    expect(parseTaskPlan(raw)).toEqual([{ title: 'Write intro', size: 'S' }])
  })

  it('defaults an unknown size to M and drops titleless items', () => {
    const out = parseTaskPlan('[{"title":"A","size":"XL"},{"size":"M"},{"title":"  "}]')
    expect(out).toEqual([{ title: 'A', size: 'M' }])
  })

  it('returns an empty array for junk or non-arrays', () => {
    expect(parseTaskPlan('not json')).toEqual([])
    expect(parseTaskPlan('{"title":"x"}')).toEqual([])
    expect(parseTaskPlan(null)).toEqual([])
  })

  it('caps the number of tasks at 12', () => {
    const many = JSON.stringify(
      Array.from({ length: 20 }, (_, i) => ({ title: `T${i}`, size: 'S' })),
    )
    expect(parseTaskPlan(many)).toHaveLength(12)
  })
})
