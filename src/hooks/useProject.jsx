import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { projectRef } from '../lib/projects.js'

/*
 * Live subscription to a single project document. Returns { project, loading,
 * notFound, error }. `notFound` covers both "no such project" and "you're not a
 * member" — the security rules deny reads to non-members, which surfaces here as
 * a permission error, and we present both the same friendly way.
 */
export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return undefined

    setLoading(true)
    setNotFound(false)
    setError(null)

    const unsubscribe = onSnapshot(
      projectRef(projectId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setProject(null)
          setNotFound(true)
        } else {
          setProject({ id: snapshot.id, ...snapshot.data() })
          setNotFound(false)
        }
        setLoading(false)
      },
      (err) => {
        // Rules deny non-members → permission-denied. Show the not-found state.
        if (err.code === 'permission-denied') {
          setNotFound(true)
        } else {
          setError(err)
        }
        setLoading(false)
      },
    )

    return unsubscribe
  }, [projectId])

  return { project, loading, notFound, error }
}
