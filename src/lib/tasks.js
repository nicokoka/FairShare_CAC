// Firestore data access for a project's tasks subcollection. Components and
// hooks go through these helpers so Firestore field names live in one place
// (mirrors the shape of src/lib/projects.js).

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

/*
 * Task sizes and their point values. The canonical size→points mapping becomes
 * a pure function in src/lib/fairness.js when F10 lands (the report math the
 * user must deeply understand); until then this small table drives the size
 * picker in the add-task modal and the point chips on task cards.
 */
export const TASK_SIZES = [
  { value: 'S', label: 'Small', points: 1 },
  { value: 'M', label: 'Medium', points: 2 },
  { value: 'L', label: 'Large', points: 3 },
]

const SIZE_VALUES = TASK_SIZES.map((size) => size.value)

/** Points for a size code (S/M/L), or 0 if it's somehow unknown. */
export function sizePoints(size) {
  return TASK_SIZES.find((option) => option.value === size)?.points ?? 0
}

/*
 * Is `url` a proof link we're willing to store and render as a clickable link?
 * A proof is only useful if a teammate can actually open it, so we require a
 * real web address: it must parse as a URL AND use the http/https scheme. This
 * also blocks dangerous schemes like javascript:/data: from ever reaching an
 * <a href> on the board or the report. Pure (no Firebase) so the modal can
 * validate before writing and the card can guard before rendering.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isValidProofUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return false
  try {
    const { protocol } = new URL(url.trim())
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/** Live collection reference for a project's tasks. */
export function tasksCollection(projectId) {
  return collection(db, 'projects', projectId, 'tasks')
}

/** Reference to a single task document. */
export function taskRef(projectId, taskId) {
  return doc(db, 'projects', projectId, 'tasks', taskId)
}

/*
 * Create a task in a project. New tasks always start in the "todo" column. An
 * optional assignee pre-claims the task; otherwise assignee stays null, meaning
 * "anyone can claim" (the claim flow arrives in F5). The proof/verification
 * fields start null and are filled in by F6/F7 — we write them now so every
 * task document has a stable, predictable shape.
 *
 * An optional dueDate (a 'YYYY-MM-DD' calendar-day string, see src/lib/dueDate.js)
 * marks when the task should be finished; it's stored as null when omitted so
 * every task document keeps a stable, predictable shape.
 *
 * @param {string} projectId
 * @param {{ uid: string }} user  the creator
 * @param {{ title: string, size: string, assignee?: string|null, dueDate?: string|null }} input
 */
export async function createTask(projectId, user, { title, size, assignee, dueDate }) {
  if (!SIZE_VALUES.includes(size)) {
    throw new Error(`Unknown task size: ${size}`)
  }
  await addDoc(tasksCollection(projectId), {
    title,
    size,
    status: 'todo',
    assignee: assignee || null,
    dueDate: dueDate || null,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    proofUrl: null,
    submittedAt: null,
    verifiedBy: null,
    verifiedAt: null,
    lastRejection: null,
  })
}

/*
 * Set or clear a task's due date (F15): pass a 'YYYY-MM-DD' string to set it, or
 * a falsy value to clear it. The rules allow this only for the task's assignee or
 * the project creator, while the project is active. Kept as its own single-field
 * write so it can never disturb the title, size, or verification fields.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {string|null} dueDate  a 'YYYY-MM-DD' day, or null to clear
 */
export async function setTaskDueDate(projectId, taskId, dueDate) {
  await updateDoc(taskRef(projectId, taskId), { dueDate: dueDate || null })
}

/*
 * Claim an unclaimed task: assign it to `user` and move it into Doing. A single
 * write sets both fields; the security rules only permit this when the task is
 * still an unclaimed "todo" and the caller is assigning it to themselves.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {{ uid: string }} user
 */
export async function claimTask(projectId, taskId, user) {
  await updateDoc(taskRef(projectId, taskId), {
    assignee: user.uid,
    status: 'doing',
  })
}

/*
 * Start a task already assigned to the current user: To Do → Doing. The rules
 * allow this only when the caller is the current assignee. (Marking a task
 * "done" needs a proof link, which arrives in F6.)
 *
 * @param {string} projectId
 * @param {string} taskId
 */
export async function startTask(projectId, taskId) {
  await updateDoc(taskRef(projectId, taskId), { status: 'doing' })
}

/*
 * Mark a task done and submit its proof: Doing → Done, storing the proof link
 * and a submission timestamp. The task now waits for a teammate to verify it
 * (F7). The rules allow this only when the caller is the current assignee and
 * `proofUrl` is a non-empty string; the http/https check lives in the client
 * (see isValidProofUrl) since Firestore rules can't parse a URL cheaply.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {string} proofUrl  a validated http/https link to the work
 */
export async function markTaskDone(projectId, taskId, proofUrl) {
  await updateDoc(taskRef(projectId, taskId), {
    status: 'done',
    proofUrl,
    submittedAt: serverTimestamp(),
  })
}

/*
 * Approve a done task (F7): Done → Verified, recording who verified it and when
 * so the fairness report can credit the points and name the verifier. The rules
 * only allow this for a member who is NOT the task's assignee — you can't sign
 * off on your own work — and only from the "done" (awaiting-verification) state.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {{ uid: string }} user  the verifying teammate
 */
export async function approveTask(projectId, taskId, user) {
  await updateDoc(taskRef(projectId, taskId), {
    status: 'verified',
    verifiedBy: user.uid,
    verifiedAt: serverTimestamp(),
  })
}

/*
 * Reject a done task with a written reason (F7): Done → back to Doing, storing
 * who rejected it, why, and when. The assignee sees the reason on the card and
 * can fix the work and re-submit. Rules require a non-empty reason and a
 * verifier who isn't the assignee. The proof link is left in place; the assignee
 * overwrites it when they mark the task done again.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {{ uid: string }} user  the rejecting teammate
 * @param {string} reason  a non-empty explanation of what to fix
 */
export async function rejectTask(projectId, taskId, user, reason) {
  await updateDoc(taskRef(projectId, taskId), {
    status: 'doing',
    lastRejection: { by: user.uid, reason, at: serverTimestamp() },
  })
}

/*
 * Reassign a task to another member, or release it back to "anyone can claim"
 * by passing a falsy value. Project-creator-only at the rules level.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @param {string|null} assigneeUid  a member's uid, or null to release
 */
export async function reassignTask(projectId, taskId, assigneeUid) {
  await updateDoc(taskRef(projectId, taskId), { assignee: assigneeUid || null })
}

/*
 * Delete a task entirely. Project-creator-only at the rules level.
 *
 * @param {string} projectId
 * @param {string} taskId
 */
export async function deleteTask(projectId, taskId) {
  await deleteDoc(taskRef(projectId, taskId))
}
