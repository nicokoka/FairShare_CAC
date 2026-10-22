// Unit tests for the two pure guards in tasks.js: the proof-URL validator (also a
// security control — it keeps javascript:/data: links off the board and report)
// and the size→points lookup.

import { describe, it, expect } from 'vitest'
import { isValidProofUrl, sizePoints } from './tasks.js'

describe('isValidProofUrl', () => {
  it('accepts http and https links', () => {
    expect(isValidProofUrl('https://docs.google.com/document/d/abc')).toBe(true)
    expect(isValidProofUrl('http://example.com/proof.png')).toBe(true)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidProofUrl('  https://github.com/me/repo  ')).toBe(true)
  })

  it('rejects empty, missing, or non-string input', () => {
    expect(isValidProofUrl('')).toBe(false)
    expect(isValidProofUrl('   ')).toBe(false)
    expect(isValidProofUrl(null)).toBe(false)
    expect(isValidProofUrl(undefined)).toBe(false)
    expect(isValidProofUrl(42)).toBe(false)
  })

  it('rejects dangerous and non-web schemes so they can never reach an <a href>', () => {
    expect(isValidProofUrl('javascript:alert(1)')).toBe(false)
    expect(isValidProofUrl('data:text/html,<script>bad()</script>')).toBe(false)
    expect(isValidProofUrl('ftp://files.example.com/x')).toBe(false)
    expect(isValidProofUrl('just some text')).toBe(false)
  })
})

describe('sizePoints', () => {
  it('maps the three sizes and falls back to 0 for unknown', () => {
    expect(sizePoints('S')).toBe(1)
    expect(sizePoints('M')).toBe(2)
    expect(sizePoints('L')).toBe(3)
    expect(sizePoints('???')).toBe(0)
  })
})
