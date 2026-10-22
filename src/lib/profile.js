// Personal Fairness Profile math. FairShare used to forget you the moment a
// project ended; the profile aggregates your record ACROSS every finished project
// into a few lifetime numbers plus a timeline. Like fairness.js this is a PURE
// function with zero Firebase imports — given the same per-project rows in, it
// always returns the same summary, so it's easy to read, explain, and unit-test.
//
// Each row is one finished project as seen *from one person's side*:
//   { projectId, name, endedAt, myShare, myPoints, myRating }
// (myShare is a 0–100 percentage; myRating is a 1–5 average or null if unrated.)

/** Mean of a numeric list, or null when it's empty. */
function mean(values) {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Roll per-project rows up into a lifetime summary.
 *
 * @param {Array<{ projectId: string, name?: string, endedAt?: number|null, myShare?: number, myPoints?: number, myRating?: number|null }>} perProject
 * @returns {{
 *   projectsCount: number,
 *   totalPoints: number,
 *   avgShare: number|null,
 *   avgRating: number|null,
 *   ratedProjects: number,
 *   timeline: Array<object>
 * }}
 */
export function summarizeProfile(perProject) {
  const projectsCount = perProject.length
  const totalPoints = perProject.reduce((sum, row) => sum + (row.myPoints || 0), 0)

  const shares = perProject
    .map((row) => row.myShare)
    .filter((value) => typeof value === 'number')
  const ratings = perProject
    .map((row) => row.myRating)
    .filter((value) => typeof value === 'number')

  // Oldest finished project first, so the timeline reads left-to-right. A missing
  // endedAt (timestamp not resolved yet) sorts to the end.
  const timeline = [...perProject].sort(
    (a, b) => (a.endedAt ?? Infinity) - (b.endedAt ?? Infinity),
  )

  return {
    projectsCount,
    totalPoints,
    avgShare: mean(shares),
    avgRating: mean(ratings),
    ratedProjects: ratings.length,
    timeline,
  }
}
