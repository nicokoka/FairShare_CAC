// Fairness insights (the "smart summary" of a report). This turns the raw report
// numbers into a short, ordered list of plain-English observations a teacher can
// skim — "who carried the project", "where effort and ratings disagree", "who
// didn't participate". It is deliberately RULE-BASED: every sentence comes from a
// threshold you can read below, not from a black box. That makes it defensible
// (the logic is yours), testable (pure function, no Firebase), and reliable (it
// can't fail or cost anything). The optional AI layer in aiSummary.js only ever
// *rephrases* these same facts; it never invents new ones.
//
// Pure: given the same report numbers in, it always returns the same insights.

// --- Thresholds (named so there are no magic numbers in the logic) ------------

// One person did at least this % of the verified work → the project leaned on them.
const DOMINANT_SHARE_PCT = 55
// A member did at most this % (while real work existed) → near-absent contributor.
const ABSENT_SHARE_PCT = 10
// If the gap between the top and bottom contributor is within this many points,
// the split counts as "even".
const BALANCED_SPREAD_PCT = 20
// Peer-rating cutoffs on the 1–5 scale.
const LOW_RATING = 3
const HIGH_RATING = 4

const round = (n) => Math.round(n)

/**
 * Build the ordered insight list for a report.
 *
 * All inputs are the already-computed report numbers, so this function does no
 * math of its own beyond comparisons — it just reads the story out of them.
 *
 * @param {object}   args
 * @param {{ totalPoints: number, byMember: Record<string, { verifiedTasks: number, points: number, share: number }> }} args.contrib
 * @param {Record<string, { perCriterion: { effort: number|null, quality: number|null, teamwork: number|null }, overall: number|null, reviewCount: number }>} args.ratingByMember
 * @param {string[]} args.didNotSubmit  members who never submitted a peer review
 * @param {Array<{ status: string, lastRejection: object|null }>} args.tasks
 * @param {string[]} args.memberIds
 * @param {(uid: string) => string} args.nameFor  resolves a uid to a display name
 * @returns {Array<{ tone: 'positive'|'watch'|'info', text: string }>}
 */
export function buildInsights({ contrib, ratingByMember, didNotSubmit, tasks, memberIds, nameFor }) {
  const insights = []
  const memberCount = memberIds.length
  const hasVerifiedWork = contrib.totalPoints > 0

  // Members sorted by verified share, highest first — the backbone of most notes.
  const ranked = [...memberIds].sort(
    (a, b) => (contrib.byMember[b]?.share ?? 0) - (contrib.byMember[a]?.share ?? 0),
  )
  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]

  // 1. Contribution spread: dominant carrier, even split, or a near-absent member.
  if (!hasVerifiedWork) {
    insights.push({
      tone: 'info',
      text: 'No tasks were verified, so there is no verified-work contribution to compare yet.',
    })
  } else if (memberCount > 1) {
    const topShare = contrib.byMember[top].share
    const bottomShare = contrib.byMember[bottom].share
    const spread = topShare - bottomShare

    if (topShare >= DOMINANT_SHARE_PCT) {
      insights.push({
        tone: 'watch',
        text: `${nameFor(top)} did ${round(topShare)}% of the verified work — most of the project rested on one person.`,
      })
    } else if (spread <= BALANCED_SPREAD_PCT) {
      insights.push({
        tone: 'positive',
        text: `Verified work was shared evenly — only ${round(spread)} percentage points separated the top and bottom contributor.`,
      })
    }

    // Call out anyone who did almost nothing (but who DID participate as a member).
    const absent = ranked.filter((uid) => contrib.byMember[uid].share <= ABSENT_SHARE_PCT)
    if (absent.length > 0 && absent.length < memberCount) {
      insights.push({
        tone: 'watch',
        text: `${joinNames(absent, nameFor)} ${absent.length === 1 ? 'has' : 'have'} little to no verified work credited.`,
      })
    }
  }

  // 2. Where effort and ratings disagree — the most useful thing a report surfaces.
  if (hasVerifiedWork && memberCount > 1) {
    const averageShare = 100 / memberCount

    // Carried a lot but scored low on teamwork → possible friction worth a chat.
    const friction = ranked.find((uid) => {
      const share = contrib.byMember[uid].share
      const teamwork = ratingByMember[uid]?.perCriterion.teamwork
      return share >= averageShare && teamwork !== null && teamwork < LOW_RATING
    })
    if (friction) {
      const teamwork = ratingByMember[friction].perCriterion.teamwork
      insights.push({
        tone: 'watch',
        text: `${nameFor(friction)} did an above-average share of the work but got a low teamwork rating (${teamwork.toFixed(1)}/5) — worth a conversation.`,
      })
    }

    // Did little but was rated highly → teammates still valued their contribution.
    const generous = ranked.find((uid) => {
      const share = contrib.byMember[uid].share
      const overall = ratingByMember[uid]?.overall
      return share <= ABSENT_SHARE_PCT && overall !== null && overall >= HIGH_RATING
    })
    if (generous) {
      insights.push({
        tone: 'info',
        text: `${nameFor(generous)} has little verified work but a high peer rating (${ratingByMember[generous].overall.toFixed(1)}/5) — their help may not show up as verified tasks.`,
      })
    }
  }

  // 3. Rework signal — tasks that bounced back at least once shows verification bit.
  const reworked = tasks.filter((task) => task.lastRejection).length
  if (reworked > 0) {
    insights.push({
      tone: 'info',
      text: `${reworked} ${reworked === 1 ? 'task was' : 'tasks were'} sent back for rework before being accepted — the proof-and-verify step caught something.`,
    })
  }

  // 4. Unverified work left on the board when the project ended.
  const unverified = tasks.filter((task) => task.status !== 'verified').length
  if (unverified > 0) {
    insights.push({
      tone: 'info',
      text: `${unverified} ${unverified === 1 ? 'task' : 'tasks'} never reached "verified", so ${unverified === 1 ? 'it counts' : 'they count'} for nobody.`,
    })
  }

  // 5. Peer-review participation — the averages are only as complete as the input.
  if (didNotSubmit.length > 0) {
    insights.push({
      tone: didNotSubmit.length === memberCount ? 'watch' : 'info',
      text: `${joinNames(didNotSubmit, nameFor)} didn't submit a peer review, so their view isn't reflected in the ratings.`,
    })
  }

  // Fallback: a healthy project that tripped no watch rules and earned no positive
  // note yet deserves a reassuring lead line, rather than an empty/all-neutral panel.
  const hasWatch = insights.some((insight) => insight.tone === 'watch')
  const hasPositive = insights.some((insight) => insight.tone === 'positive')
  if (!hasWatch && !hasPositive) {
    insights.unshift({
      tone: 'positive',
      text: 'No fairness red flags stood out — verified work and peer ratings line up reasonably well.',
    })
  }

  return insights
}

// "Alex", "Alex and Sam", or "Alex, Sam and Jo" — a readable name list.
function joinNames(uids, nameFor) {
  const names = uids.map(nameFor)
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
