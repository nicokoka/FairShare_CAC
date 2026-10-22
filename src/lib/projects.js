// Firestore data access for projects. Everything that reads/writes the
// `projects` and `joinCodes` collections lives here, so components and hooks
// never talk to Firestore field names directly.

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase.js'
import { generateJoinCode } from './joinCode.js'

// How many times to re-roll a join code if it's already taken before giving up.
const MAX_CODE_ATTEMPTS = 5

export const projectsCollection = collection(db, 'projects')

/** Reference to a single project document. */
export function projectRef(projectId) {
  return doc(db, 'projects', projectId)
}

/** Reference to a join-code lookup document. Codes are stored uppercased. */
export function joinCodeRef(code) {
  return doc(db, 'joinCodes', code.toUpperCase())
}

/**
 * Find a join code that isn't already in use. Collisions are astronomically
 * unlikely (32^6 ≈ 1 billion codes) but we check anyway so two projects can
 * never share a code.
 * @returns {Promise<string>}
 */
async function reserveUniqueCode() {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateJoinCode()
    const existing = await getDoc(joinCodeRef(code))
    if (!existing.exists()) return code
  }
  throw new Error('Could not generate a unique join code. Please try again.')
}

/**
 * Create a new project owned by `user`. Writes the project document and its
 * join-code lookup together in one atomic batch, so we never end up with a
 * project that has no code (or vice-versa). The creator is the first member.
 *
 * An optional `classId` attaches the project to a teacher's class (T4), which is
 * what lets that class's teacher see it on their dashboard. It's stored as null
 * when omitted so every project keeps a stable, predictable shape.
 *
 * @param {{ uid: string, displayName?: string, photoURL?: string }} user
 * @param {string} name  Project name (already trimmed by the caller)
 * @param {{ classId?: string|null }} [options]
 * @returns {Promise<{ id: string, joinCode: string }>}
 */
export async function createProject(user, name, { classId = null } = {}) {
  const joinCode = await reserveUniqueCode()
  const newProjectRef = doc(projectsCollection) // pre-generate the id
  const batch = writeBatch(db)

  batch.set(newProjectRef, {
    name,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    status: 'active',
    endedAt: null,
    joinCode,
    classId: classId || null,
    memberIds: [user.uid],
    members: {
      [user.uid]: {
        name: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
      },
    },
  })

  batch.set(joinCodeRef(joinCode), { projectId: newProjectRef.id })

  await batch.commit()
  return { id: newProjectRef.id, joinCode }
}

/**
 * Resolve a join code to a project id via the public `joinCodes` lookup.
 * Non-members can't read project docs (rules), but they can read this lookup —
 * that's the whole reason it exists.
 * @param {string} code
 * @returns {Promise<string|null>} the project id, or null if the code is unknown
 */
export async function lookupJoinCode(code) {
  const snapshot = await getDoc(joinCodeRef(code))
  return snapshot.exists() ? snapshot.data().projectId : null
}

/**
 * Join a project straight from a shared /join/:code link. Wraps the same lookup
 * and self-join the modal uses, but figures out membership WITHOUT a prepared
 * project list: it probes the project doc, which the rules let only members read.
 * A permission-denied read therefore means "not a member yet" — so we join.
 *
 * Returns a status the caller maps to UI, never throwing for the expected cases:
 *   'not-found'      — the code matches no project
 *   'already-member' — the user can already read it; just go there
 *   'joined'         — we added them as a new member
 *   'ended'          — the project has ended (self-join is blocked once ended)
 *
 * @param {{ uid: string, displayName?: string, photoURL?: string }} user
 * @param {string} code
 * @returns {Promise<{ status: string, projectId?: string }>}
 */
export async function joinByCode(user, code) {
  const projectId = await lookupJoinCode(code)
  if (!projectId) return { status: 'not-found' }

  // Can we already read it? Only members can — so a successful read means we're
  // in, and a permission-denied means we still need to join.
  try {
    const snapshot = await getDoc(projectRef(projectId))
    if (snapshot.exists()) return { status: 'already-member', projectId }
  } catch (err) {
    if (err?.code !== 'permission-denied') throw err
  }

  try {
    await joinProject(user, projectId)
    return { status: 'joined', projectId }
  } catch (err) {
    // The self-join rule only permits active projects; an ended one denies here.
    if (err?.code === 'permission-denied') return { status: 'ended', projectId }
    throw err
  }
}

/**
 * End a project (F8): flip it from "active" to "ended" and stamp when. Only the
 * creator may do this (enforced by the rules). Ending locks the board — task
 * writes are denied once status is "ended" — and opens the peer-review phase.
 *
 * @param {string} projectId
 */
export async function endProject(projectId) {
  await updateDoc(projectRef(projectId), {
    status: 'ended',
    endedAt: serverTimestamp(),
  })
}

/**
 * Add `user` to a project as a new member. This is a self-join: the security
 * rules only permit a signed-in user to add *their own* uid, and only while the
 * project is still active. The write uses arrayUnion so it's idempotent on the
 * memberIds list, and sets the caller's own entry in the members map.
 *
 * @param {{ uid: string, displayName?: string, photoURL?: string }} user
 * @param {string} projectId
 */
export async function joinProject(user, projectId) {
  await updateDoc(projectRef(projectId), {
    memberIds: arrayUnion(user.uid),
    [`members.${user.uid}`]: {
      name: user.displayName || 'Anonymous',
      photoURL: user.photoURL || null,
      joinedAt: serverTimestamp(),
    },
  })
}
