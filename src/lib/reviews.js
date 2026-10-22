// Firestore data access for a project's peer reviews (F9). One review document
// per reviewer (doc id = the reviewer's uid), holding their private ratings of
// every teammate. Kept here so field names live in one place, mirroring
// src/lib/tasks.js and src/lib/projects.js. No fairness math lives here — that's
// the pure functions in src/lib/fairness.js (F10).

import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

/*
 * The three things everyone rates each teammate on, 1–5 stars each. Drives both
 * the review form and (later) the report's per-criterion averages, so the list
 * lives in one place.
 */
export const REVIEW_CRITERIA = [
  { key: 'effort', label: 'Effort', hint: 'Showed up and put in the work' },
  { key: 'quality', label: 'Quality', hint: 'Their work was done well' },
  { key: 'teamwork', label: 'Teamwork', hint: 'Communicated and helped out' },
]

export const MIN_RATING = 1
export const MAX_RATING = 5

/** Live collection reference for a project's reviews. */
export function reviewsCollection(projectId) {
  return collection(db, 'projects', projectId, 'reviews')
}

/** Reference to a single reviewer's review document (doc id = reviewer uid). */
export function reviewRef(projectId, reviewerUid) {
  return doc(db, 'projects', projectId, 'reviews', reviewerUid)
}

/*
 * Has this reviewer given every teammate a rating on all three criteria? The
 * submit button stays disabled until this is true. Comments stay optional.
 *
 * @param {Record<string, {effort?: number, quality?: number, teamwork?: number}>} ratings
 * @param {string[]} revieweeUids  the teammates being rated (excludes self)
 * @returns {boolean}
 */
export function isReviewComplete(ratings, revieweeUids) {
  return revieweeUids.every((uid) => {
    const entry = ratings[uid]
    if (!entry) return false
    return REVIEW_CRITERIA.every((criterion) => {
      const value = entry[criterion.key]
      return typeof value === 'number' && value >= MIN_RATING && value <= MAX_RATING
    })
  })
}

/*
 * Submit this user's review of their teammates (F9). One document per reviewer,
 * so the doc id is the reviewer's uid. The rules only allow *create* (never
 * update), which is what makes reviews one-shot: a second submission would be an
 * update and is denied. We only store ratings for the teammates passed in, and
 * default each comment to an empty string so the report math never hits
 * undefined.
 *
 * @param {string} projectId
 * @param {{ uid: string }} user  the reviewer
 * @param {Record<string, {effort: number, quality: number, teamwork: number, comment?: string}>} ratings
 * @param {string[]} revieweeUids  the teammates being rated (excludes self)
 */
export async function submitReview(projectId, user, ratings, revieweeUids) {
  const cleaned = {}
  revieweeUids.forEach((uid) => {
    const entry = ratings[uid] || {}
    cleaned[uid] = {
      effort: entry.effort,
      quality: entry.quality,
      teamwork: entry.teamwork,
      comment: (entry.comment || '').trim(),
    }
  })

  await setDoc(reviewRef(projectId, user.uid), {
    submittedAt: serverTimestamp(),
    ratings: cleaned,
  })
}
