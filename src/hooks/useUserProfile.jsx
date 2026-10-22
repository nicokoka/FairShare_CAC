import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { useAuth } from './useAuth.jsx'
import { ROLES, upsertUserProfile, userRef } from '../lib/users.js'

/*
 * Live view of the signed-in user's profile doc (role + display info), plus a
 * setRole action. This is what makes the app role-aware.
 *
 * Resilience is deliberate: FairShare worked fine before this collection existed,
 * so nothing core may depend on it. If the profile can't be read (e.g. rules not
 * yet deployed, or offline) we surface role = null with loading = false and let
 * callers default to the student experience — the app never blocks on it.
 *
 * On first sign-in we also seed the profile doc (name/photo, no role yet) so the
 * document exists; the role stays undefined until the user picks one.
 */
export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const uid = user?.uid

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setLoading(false)
      return undefined
    }

    setLoading(true)
    // Seed the doc with name/photo on sign-in (no role). Best-effort.
    upsertUserProfile(user).catch(() => {})

    const unsubscribe = onSnapshot(
      userRef(uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null)
        setLoading(false)
      },
      () => {
        // Read denied/offline — fall back to "no profile" so callers default to
        // the student experience instead of hanging.
        setProfile(null)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Note: this intentionally does NOT swallow errors, so callers can surface a
  // failure (e.g. the role picker). A denied write usually means the users/{uid}
  // security rule hasn't been published to the live database yet.
  const setRole = (role) => {
    if (!user) return Promise.reject(new Error('Not signed in'))
    return upsertUserProfile(user, role)
  }

  // Treat a missing/denied profile as a student so the app always has a role.
  const role = profile?.role || null
  const isTeacher = role === ROLES.TEACHER

  return { profile, role, isTeacher, loading, setRole }
}
