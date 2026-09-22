// Join codes let a teammate find a project to join (see F3). They're short,
// typed by hand, and read aloud in class — so the alphabet deliberately drops
// characters people confuse: no 0/O, no 1/I, no L. Pure function, no Firebase.

// 24 letters (A–Z minus I, O, L) + 8 digits (2–9). 32 symbols, easy to say.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

/**
 * Generate a random 6-character join code from the unambiguous alphabet.
 * Uniqueness is not guaranteed here — the caller checks Firestore and retries
 * on the (very rare) collision.
 * @returns {string} e.g. "K7P2WM"
 */
export function generateJoinCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * CODE_ALPHABET.length)
    code += CODE_ALPHABET[index]
  }
  return code
}

export { CODE_ALPHABET, CODE_LENGTH }
