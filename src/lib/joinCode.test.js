// Tests for the pure join-code helpers. generateJoinCode is random, so we test
// its shape (right length, only unambiguous characters) rather than a value.

import { describe, it, expect } from 'vitest'
import { generateJoinCode, inviteUrl, CODE_ALPHABET, CODE_LENGTH } from './joinCode.js'

describe('generateJoinCode', () => {
  it('is CODE_LENGTH characters drawn only from the unambiguous alphabet', () => {
    for (let i = 0; i < 50; i += 1) {
      const code = generateJoinCode()
      expect(code).toHaveLength(CODE_LENGTH)
      expect([...code].every((char) => CODE_ALPHABET.includes(char))).toBe(true)
    }
  })

  it('never contains the confusable characters 0/O/1/I/L', () => {
    const confusable = /[01OIL]/
    for (let i = 0; i < 50; i += 1) {
      expect(confusable.test(generateJoinCode())).toBe(false)
    }
  })
})

describe('inviteUrl', () => {
  it('builds a /join/<code> link under the origin', () => {
    expect(inviteUrl('K7P2WM', 'https://fairshare-3d5c2.web.app')).toBe(
      'https://fairshare-3d5c2.web.app/join/K7P2WM',
    )
  })

  it('trims a trailing slash on the origin', () => {
    expect(inviteUrl('K7P2WM', 'http://localhost:5173/')).toBe('http://localhost:5173/join/K7P2WM')
  })
})
