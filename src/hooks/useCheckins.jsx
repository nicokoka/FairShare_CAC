import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { checkinsCollection } from '../lib/checkins.js'

/*
 * Live list of a project's check-ins (one doc per member, id = their uid). Used
 * for the team pulse on the project page and, later, the teacher snapshot.
 */
export function useCheckins(projectId) {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setCheckins([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      checkinsCollection(projectId),
      (snapshot) => {
        setCheckins(snapshot.docs.map((docSnap) => ({ uid: docSnap.id, ...docSnap.data() })))
        setLoading(false)
      },
      () => {
        setCheckins([])
        setLoading(false)
      },
    )
    return unsubscribe
  }, [projectId])

  return { checkins, loading }
}
