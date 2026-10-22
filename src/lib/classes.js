// Firestore access for classes — the teacher layer. A class groups the projects
// of one teacher's students: the teacher creates a class (which mints a shareable
// class code), students attach a project to it with that code when they create
// the project, and the teacher's dashboard then reads every attached project's
// fairness. Mirrors projects.js (code reservation, atomic batch write).

import { collection, doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase.js'
import { generateJoinCode } from './joinCode.js'

const MAX_CODE_ATTEMPTS = 5

export const classesCollection = collection(db, 'classes')

/** Reference to a single class document. */
export function classRef(classId) {
  return doc(db, 'classes', classId)
}

/** Reference to a class-code lookup doc (codes stored uppercased). */
export function classCodeRef(code) {
  return doc(db, 'classCodes', code.toUpperCase())
}

/** Find a class code that isn't already taken (same approach as join codes). */
async function reserveUniqueClassCode() {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateJoinCode()
    const existing = await getDoc(classCodeRef(code))
    if (!existing.exists()) return code
  }
  throw new Error('Could not generate a unique class code. Please try again.')
}

/**
 * Create a class owned by `user` (the teacher). Writes the class doc and its
 * code lookup atomically so a class always has a resolvable code.
 *
 * @param {{ uid: string }} user
 * @param {string} name  class name (already trimmed by the caller)
 * @returns {Promise<{ id: string, classCode: string }>}
 */
export async function createClass(user, name) {
  const classCode = await reserveUniqueClassCode()
  const newClassRef = doc(classesCollection)
  const batch = writeBatch(db)

  batch.set(newClassRef, {
    name,
    teacherId: user.uid,
    classCode,
    createdAt: serverTimestamp(),
  })
  batch.set(classCodeRef(classCode), { classId: newClassRef.id })

  await batch.commit()
  return { id: newClassRef.id, classCode }
}

/**
 * Resolve a class code to a class id via the public classCodes lookup.
 * @param {string} code
 * @returns {Promise<string|null>}
 */
export async function lookupClassCode(code) {
  const snapshot = await getDoc(classCodeRef(code))
  return snapshot.exists() ? snapshot.data().classId : null
}
