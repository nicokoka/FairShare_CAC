import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { reviewRef } from '../lib/reviews.js'

/*
 * Live subscription to the current user's own review document (F9). Tells the
 * review page whether they've already submitted, so it can flip from the form to
 * a read-only "you rated" summary. An onSnapshot listener (not a one-time get)
 * so the switch happens the instant the write lands. Reading your own review is
 * always permitted by the rules, so this never hits a permission error.
 */
export function useMyReview(projectId, uid) {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !uid) {
      setReview(null)
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      reviewRef(projectId, uid),
      (snapshot) => {
        setReview(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
        setLoading(false)
      },
      () => {
        // Reading your own review is always allowed; treat any hiccup as "none".
        setReview(null)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [projectId, uid])

  return { review, loading }
}
