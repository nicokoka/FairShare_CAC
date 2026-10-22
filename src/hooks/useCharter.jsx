import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { charterRef } from '../lib/charter.js'

/*
 * Live view of a project's team charter (the single agreement doc). Returns the
 * stored items (or an empty list when none exist yet). Errors fall back to empty
 * so the project page never breaks on it.
 */
export function useCharter(projectId) {
  const [charter, setCharter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setCharter(null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      charterRef(projectId),
      (snapshot) => {
        setCharter(snapshot.exists() ? snapshot.data() : { items: [] })
        setLoading(false)
      },
      () => {
        setCharter({ items: [] })
        setLoading(false)
      },
    )
    return unsubscribe
  }, [projectId])

  return { charter, loading }
}
