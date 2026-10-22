// Team charter: a short list of expectations the team agrees on at the START of
// a project ("reply within a day", "bring a draft to each meeting"). It reframes
// FairShare from end-of-project judgment toward setting the team up to be fair in
// the first place. Stored as a single doc per project so it's trivial to read and
// edit. Firestore field names live here, mirroring tasks.js / reviews.js.

import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

const MAX_ITEMS = 10
const MAX_ITEM_LENGTH = 120

/** The single charter document for a project. */
export function charterRef(projectId) {
  return doc(db, 'projects', projectId, 'charter', 'agreement')
}

/**
 * Clean a raw list of charter items: trim, drop blanks, cap length and count.
 * Pure so it can be reused and tested; the UI calls it before saving.
 *
 * @param {string[]} items
 * @returns {string[]}
 */
export function normalizeCharterItems(items) {
  if (!Array.isArray(items)) return []
  return items
    .map((item) => (typeof item === 'string' ? item.trim().slice(0, MAX_ITEM_LENGTH) : ''))
    .filter((item) => item.length > 0)
    .slice(0, MAX_ITEMS)
}

/**
 * Save the team's charter. Any member may edit it while the project is active
 * (enforced by the rules). Stored with who last touched it and when.
 *
 * @param {string} projectId
 * @param {{ uid: string }} user
 * @param {string[]} items
 */
export async function saveCharter(projectId, user, items) {
  await setDoc(charterRef(projectId), {
    items: normalizeCharterItems(items),
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  })
}

export { MAX_ITEMS, MAX_ITEM_LENGTH }
