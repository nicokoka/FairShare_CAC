// The fairness math (F10). These are the numbers the printable report is built
// on, so they live here as PURE FUNCTIONS with ZERO Firebase imports: given the
// same tasks/reviews in, they always give the same numbers out. That's what lets
// you read them, explain them to judges, hand-check them on paper, and (later)
// unit-test them in isolation. Nothing in here talks to the network.
//
// Two questions the report answers, one function each:
//   1. contributionShares — what share of the *verified* work did each person do?
//   2. ratingAverages     — how did teammates rate each person, on average?
// taskPoints is the small effort scale both the board and the report agree on.

/*
 * How much a task is "worth" in effort points, by its size code.
 * Small = 1, Medium = 2, Large = 3. Chosen at task creation.
 *
 * (The task board keeps its own S/M/L table with display labels in
 * src/lib/tasks.js for the size picker; this is the same scale expressed as pure
 * math so the report never has to import anything Firebase-flavored.)
 */
export const SIZE_POINTS = { S: 1, M: 2, L: 3 }

/**
 * Points for a size code (S/M/L). Unknown/missing sizes score 0 so a stray task
 * can never crash the math or inflate a total.
 *
 * @param {string} size  'S' | 'M' | 'L'
 * @returns {number}
 */
export function taskPoints(size) {
  return SIZE_POINTS[size] ?? 0
}

/*
 * "Who did what share of the real work?"
 *
 * Only VERIFIED tasks count — a task a teammate approved after seeing proof.
 * Unverified "done" work, claimed-but-unfinished work, and to-dos are all worth
 * zero here. That's the whole point of FairShare: credit follows verified effort,
 * not talk.
 *
 * For each member we sum the points of the verified tasks assigned to them, then
 * divide by the project's total verified points to get their percentage share.
 * We also hand back the raw counts so the report can show "3 tasks · 6 pts · 40%"
 * instead of just a bare percentage.
 *
 * Edge cases, handled honestly:
 *  - No verified tasks yet → everyone is 0% (we never divide by zero).
 *  - A verified task assigned to someone not in memberIds (e.g. a task whose
 *    assignee later left — out of scope, but possible) still counts toward the
 *    project total but is credited to nobody, so shares can sum to slightly under
 *    100%. That's the truthful picture, not a rounding bug.
 *
 * @param {Array<{ size: string, status: string, assignee: string|null }>} tasks
 * @param {string[]} memberIds
 * @returns {{
 *   totalPoints: number,
 *   byMember: Record<string, { verifiedTasks: number, points: number, share: number }>
 * }}
 */
export function contributionShares(tasks, memberIds) {
  const verified = tasks.filter((task) => task.status === 'verified')
  const totalPoints = verified.reduce((sum, task) => sum + taskPoints(task.size), 0)

  const byMember = {}
  memberIds.forEach((uid) => {
    const own = verified.filter((task) => task.assignee === uid)
    const points = own.reduce((sum, task) => sum + taskPoints(task.size), 0)
    byMember[uid] = {
      verifiedTasks: own.length,
      points,
      // Guard the divide-by-zero: an all-fresh project gives everyone 0%.
      share: totalPoints === 0 ? 0 : (points / totalPoints) * 100,
    }
  })

  return { totalPoints, byMember }
}

/*
 * The three things every teammate rates each other on (1–5 stars). Mirrors
 * REVIEW_CRITERIA in src/lib/reviews.js, but as bare keys — this file stays pure
 * and UI-free, so it carries no labels or hints.
 */
const RATING_CRITERIA = ['effort', 'quality', 'teamwork']

/** Mean of a list of numbers, or null when the list is empty (no ratings yet). */
function mean(values) {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/*
 * "How did teammates rate each person, on average?"
 *
 * Each review document is one reviewer's private ratings of everyone else (they
 * never rate themselves). For each member we gather every rating *about* them
 * across all submitted reviews, average each criterion, then average those three
 * criterion means into a single overall number.
 *
 * We also report who never submitted a review: the report generates regardless,
 * but it names the people who didn't participate (their missing input simply
 * isn't counted — the averages use whatever ratings exist).
 *
 * Design choice: `reviews` is an array of plain objects each carrying a
 * `reviewerUid` and a `ratings` map — NOT raw Firestore snapshots. The report's
 * data hook maps each review doc's id to `reviewerUid` before calling this, which
 * keeps this file decoupled from Firestore's document shape and easy to test.
 *
 * A criterion (or the overall) is `null` when nobody rated that member on it,
 * which the report renders as "—" rather than a misleading 0.
 *
 * @param {Array<{ reviewerUid: string, ratings: Record<string, { effort?: number, quality?: number, teamwork?: number }> }>} reviews
 * @param {string[]} memberIds
 * @returns {{
 *   byMember: Record<string, {
 *     perCriterion: { effort: number|null, quality: number|null, teamwork: number|null },
 *     overall: number|null,
 *     reviewCount: number
 *   }>,
 *   didNotSubmit: string[]
 * }}
 */
export function ratingAverages(reviews, memberIds) {
  const byMember = {}

  memberIds.forEach((uid) => {
    // Collect every score given to this member, bucketed by criterion.
    const collected = { effort: [], quality: [], teamwork: [] }
    let reviewCount = 0

    reviews.forEach((review) => {
      // Ignore a self-rating: nobody grades their own work. The security rules
      // block a reviewer from writing their own uid into `ratings`, but we skip
      // it here too so a stray or injected self-rating can never sway an average.
      if (review.reviewerUid === uid) return
      const rating = review.ratings?.[uid]
      if (!rating) return
      reviewCount += 1
      RATING_CRITERIA.forEach((criterion) => {
        const value = rating[criterion]
        if (typeof value === 'number') collected[criterion].push(value)
      })
    })

    const perCriterion = {
      effort: mean(collected.effort),
      quality: mean(collected.quality),
      teamwork: mean(collected.teamwork),
    }

    // Overall = mean of the criterion means that actually exist. Averaging the
    // three averages (rather than every raw star) keeps each criterion weighted
    // equally even if one person skipped a category.
    const presentMeans = RATING_CRITERIA
      .map((criterion) => perCriterion[criterion])
      .filter((value) => value !== null)

    byMember[uid] = {
      perCriterion,
      overall: mean(presentMeans),
      reviewCount,
    }
  })

  // Who never handed in a review at all.
  const submitted = new Set(reviews.map((review) => review.reviewerUid))
  const didNotSubmit = memberIds.filter((uid) => !submitted.has(uid))

  return { byMember, didNotSubmit }
}
