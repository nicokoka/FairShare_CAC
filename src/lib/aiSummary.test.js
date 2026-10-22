// Tests for the pure prompt builder. The live generateAiSummary call isn't tested
// (it needs the network + an enabled API); the logic that matters — that we feed
// Gemini the report's own facts and constrain it — lives in buildPrompt.

import { describe, it, expect } from 'vitest'
import { buildPrompt } from './aiSummary.js'

const args = {
  projectName: 'History Project',
  insights: [
    { tone: 'watch', text: 'Alex did 80% of the verified work.' },
    { tone: 'info', text: 'Sam didn\'t submit a peer review.' },
  ],
  memberLines: ['Alex: 80% of verified work (8 pts), avg rating 4.2/5', 'Sam: 20% of verified work (2 pts), avg rating 3.0/5'],
}

describe('buildPrompt', () => {
  it('names the project', () => {
    expect(buildPrompt(args)).toContain('History Project')
  })

  it('includes every computed insight and member line as facts', () => {
    const prompt = buildPrompt(args)
    expect(prompt).toContain('Alex did 80% of the verified work.')
    expect(prompt).toContain("Sam didn't submit a peer review.")
    expect(prompt).toContain('Alex: 80% of verified work (8 pts), avg rating 4.2/5')
  })

  it('constrains the model to the given facts and a neutral tone', () => {
    const prompt = buildPrompt(args)
    expect(prompt).toMatch(/use only the facts above/i)
    expect(prompt).toMatch(/invent no new numbers/i)
    expect(prompt).toMatch(/do not accuse/i)
  })
})
