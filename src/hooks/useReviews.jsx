import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { reviewsCollection } from '../lib/reviews.js'

/*
 * Live list of ALL peer-review documents for a project (F11, for the report).
 * The security rules only let a member read teammates' reviews once the project
 * has "ended", so this is meant to run on the ended report page — pass
 * `enabled` = whether the project has ended to avoid a permission-denied read on
 * an active project. Each row is tagged with `reviewerUid` (the doc id) so the
 * pure functions in src/lib/fairness.js can average the ratings and work out who
 * never submitted a review.
 */
export function useReviews(projectId, enabled = true) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId || !enabled) {
      setReviews([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      reviewsCollection(projectId),
      (snapshot) => {
        setReviews(
          snapshot.docs.map((docSnap) => ({
            reviewerUid: docSnap.id,
            ...docSnap.data(),
          })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setReviews([])
        setLoading(false)
      },
    )

    return unsubscribe
  }, [projectId, enabled])

  return { reviews, loading, error }
}
