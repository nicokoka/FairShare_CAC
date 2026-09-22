import { useEffect, useState } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import { projectsCollection } from '../lib/projects.js'

/*
 * Live list of every project the given user belongs to. Uses an onSnapshot
 * listener (not a one-time get) so the dashboard updates the instant a project
 * is created or the user joins one from another tab — that real-time behavior is
 * the whole point of FairShare's demo.
 *
 * We sort newest-first in JavaScript rather than with orderBy() so we don't need
 * a composite Firestore index (array-contains + orderBy would require one).
 */
export function useProjects(uid) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) {
      setProjects([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const projectsQuery = query(
      projectsCollection,
      where('memberIds', 'array-contains', uid),
    )

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        rows.sort(byNewestFirst)
        setProjects(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [uid])

  return { projects, loading, error }
}

// createdAt can briefly be null between a local write and the server timestamp
// resolving; treat a missing timestamp as "just now" so it floats to the top.
function byNewestFirst(a, b) {
  const aMs = a.createdAt?.toMillis?.() ?? Infinity
  const bMs = b.createdAt?.toMillis?.() ?? Infinity
  return bMs - aMs
}
