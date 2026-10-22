// Firestore access for the per-user profile document (users/{uid}). This is the
// backbone of the role-aware app: it stores whether someone is using FairShare as
// a 'student' or a 'teacher', plus their display name/photo for showing in lists.
//
// Field names live here so the rest of the app never hardcodes them (mirrors the
// style of projects.js / tasks.js). Everything is best-effort: the core app never
// blocks on these reads/writes, so a denied read just falls back to 'student'.

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

export const ROLES = { STUDENT: 'student', TEACHER: 'teacher' }

/** Reference to a user's profile document (doc id = their uid). */
export function userRef(uid) {
  return doc(db, 'users', uid)
}

/**
 * Create or refresh the signed-in user's profile. Name/photo are always synced
 * from their Google account; `role` is written only when provided (the first-run
 * picker or a later switch), so routine sign-ins never clobber a chosen role.
 * Uses merge so it's safe to call on every sign-in.
 *
 * @param {{ uid: string, displayName?: string, photoURL?: string }} user
 * @param {string} [role]  'student' | 'teacher'
 */
export async function upsertUserProfile(user, role) {
  const data = {
    name: user.displayName || 'Anonymous',
    photoURL: user.photoURL || null,
    updatedAt: serverTimestamp(),
  }
  if (role) data.role = role
  await setDoc(userRef(user.uid), data, { merge: true })
}

/**
 * Read a user's profile once, or null if it doesn't exist / can't be read.
 * @param {string} uid
 * @returns {Promise<{ role?: string, name?: string, photoURL?: string } | null>}
 */
export async function getUserProfile(uid) {
  try {
    const snapshot = await getDoc(userRef(uid))
    return snapshot.exists() ? snapshot.data() : null
  } catch {
    return null
  }
}
