import { useEffect, useState } from 'react'
import { getDocs } from 'firebase/firestore'
import { useProjects } from './useProjects.jsx'
import { tasksCollection } from '../lib/tasks.js'
import { reviewsCollection } from '../lib/reviews.js'
import { contributionShares, ratingAverages } from '../lib/fairness.js'
import { summarizeProfile } from '../lib/profile.js'

/*
 * Data loader for the Personal Fairness Profile (/me). It takes the user's live
 * project list, keeps only the ENDED ones (contribution and ratings only mean
 * something after a project finishes), and for each one reads its tasks and
 * reviews to compute that person's share and average rating — reusing the exact
 * pure functions the report uses, so the profile numbers always match a report.
 *
 * The heavy math stays in src/lib/profile.js (pure, tested); this hook only wires
 * the Firestore reads in. A project that can't be read is skipped, never fatal.
 */
export function useProfileStats(uid) {
  const { projects, loading: projectsLoading } = useProjects(uid)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const endedProjects = projects.filter((project) => project.status === 'ended')
  // A stable dependency key so the effect only re-runs when the set of ended
  // projects actually changes (not on every snapshot of an active one).
  const endedKey = endedProjects.map((project) => project.id).join(',')

  useEffect(() => {
    if (projectsLoading) {
      setLoading(true)
      return undefined
    }
    if (!uid || endedProjects.length === 0) {
      setRows([])
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      const built = []
      for (const project of endedProjects) {
        try {
          const [taskSnap, reviewSnap] = await Promise.all([
            getDocs(tasksCollection(project.id)),
            getDocs(reviewsCollection(project.id)),
          ])
          const tasks = taskSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          const reviews = reviewSnap.docs.map((d) => ({ reviewerUid: d.id, ...d.data() }))
          const memberIds = project.memberIds || Object.keys(project.members || {})

          const contrib = contributionShares(tasks, memberIds).byMember[uid]
          const rating = ratingAverages(reviews, memberIds).byMember[uid]

          built.push({
            projectId: project.id,
            name: project.name,
            endedAt: project.endedAt?.toMillis?.() ?? null,
            myShare: contrib?.share ?? 0,
            myPoints: contrib?.points ?? 0,
            myRating: rating?.overall ?? null,
          })
        } catch {
          // Can't read this project's subcollections — leave it out.
        }
      }
      if (!cancelled) {
        setRows(built)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [uid, endedKey, projectsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return { rows, summary: summarizeProfile(rows), loading: loading || projectsLoading }
}
