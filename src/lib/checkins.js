// Mid-project check-ins: a quick pulse on "does the workload feel fair right
// now?" taken DURING the project, not only at the end. Each member has one
// check-in doc (id = their uid) holding their latest feeling (1–5) and an
// optional note; submitting again updates it. The team sees an anonymized pulse,
// which also feeds the report and the teacher's class snapshot — so problems can
// surface while there's still time to fix them.

import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

export const MIN_FEELING = 1
export const MAX_FEELING = 5
// A feeling at or below this is a quiet flag that someone feels things are unfair.
export const LOW_FEELING = 2

/** Live collection of a project's check-ins. */
export function checkinsCollection(projectId) {
  return collection(db, 'projects', projectId, 'checkins')
}

/** One member's check-in doc (id = their uid, so there's one latest per person). */
export function checkinRef(projectId, uid) {
  return doc(db, 'projects', projectId, 'checkins', uid)
}

/**
 * Record (or update) the current user's check-in.
 * @param {string} projectId
 * @param {{ uid: string }} user
 * @param {{ fairnessFeeling: number, note?: string }} input
 */
export async function submitCheckin(projectId, user, { fairnessFeeling, note }) {
  await setDoc(checkinRef(projectId, user.uid), {
    fairnessFeeling,
    note: (note || '').trim(),
    at: serverTimestamp(),
  })
}

/**
 * Summarize a project's check-ins into a team pulse. Pure, so it's unit-tested
 * and shared by the project page, the report, and the teacher snapshot.
 *
 * @param {Array<{ fairnessFeeling?: number }>} checkins
 * @returns {{ count: number, avgFeeling: number|null, lowCount: number }}
 */
export function summarizeCheckins(checkins) {
  const feelings = (checkins || [])
    .map((checkin) => checkin.fairnessFeeling)
    .filter((value) => typeof value === 'number')

  if (feelings.length === 0) {
    return { count: 0, avgFeeling: null, lowCount: 0 }
  }

  const sum = feelings.reduce((total, value) => total + value, 0)
  const lowCount = feelings.filter((value) => value <= LOW_FEELING).length
  return {
    count: feelings.length,
    avgFeeling: sum / feelings.length,
    lowCount,
  }
}
