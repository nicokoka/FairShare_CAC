import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { tasksCollection } from '../lib/tasks.js'

/*
 * Live list of a project's tasks. Like useProjects, this is an onSnapshot
 * listener (not a one-time get) so a task created in one browser appears in
 * another instantly — the headline moment of the Milestone 1 demo.
 *
 * Tasks are sorted oldest-first in JavaScript rather than with orderBy() so a
 * just-written task whose server timestamp hasn't resolved yet still slots in
 * without needing a Firestore index.
 */
export function useTasks(projectId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) {
      setTasks([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      tasksCollection(projectId),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        rows.sort(byOldestFirst)
        setTasks(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [projectId])

  return { tasks, loading, error }
}

// A freshly-created task's createdAt is briefly null before the server
// timestamp resolves; treat that as "just now" so it sorts to the bottom.
function byOldestFirst(a, b) {
  const aMs = a.createdAt?.toMillis?.() ?? Infinity
  const bMs = b.createdAt?.toMillis?.() ?? Infinity
  return aMs - bMs
}
