// A one-glance fairness snapshot of a single project, for the teacher's class
// dashboard. It reuses the exact report math (contributionShares, ratingAverages)
// plus the check-in pulse, then distills it to the few things a teacher scanning
// a whole class cares about: how lopsided the work was, the average rating, the
// pulse, and any flags worth a closer look. Pure and unit-tested.

import { contributionShares, ratingAverages } from './fairness.js'
import { summarizeCheckins } from './checkins.js'

// One member did at least this % of the verified work → flag as imbalanced
// (matches the insights engine's threshold so the two never disagree).
const DOMINANT_SHARE_PCT = 55

/**
 * @param {object} args
 * @param {Array} args.tasks
 * @param {Array} args.reviews
 * @param {Array} args.checkins
 * @param {string[]} args.memberIds
 * @returns {{
 *   memberCount: number, verifiedPoints: number, verifiedTasks: number,
 *   topShare: number, bottomShare: number, spread: number,
 *   avgRating: number|null, pulse: object, flags: string[]
 * }}
 */
export function buildSnapshot({ tasks = [], reviews = [], checkins = [], memberIds = [] }) {
  const contrib = contributionShares(tasks, memberIds)
  const shares = memberIds.map((uid) => contrib.byMember[uid]?.share ?? 0)
  const topShare = shares.length ? Math.max(...shares) : 0
  const bottomShare = shares.length ? Math.min(...shares) : 0

  const { byMember: ratingByMember } = ratingAverages(reviews, memberIds)
  const ratings = memberIds
    .map((uid) => ratingByMember[uid]?.overall)
    .filter((value) => typeof value === 'number')
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null

  const pulse = summarizeCheckins(checkins)
  const verifiedTasks = tasks.filter((task) => task.status === 'verified').length

  const flags = []
  if (contrib.totalPoints === 0) flags.push('no-verified-work')
  if (contrib.totalPoints > 0 && topShare >= DOMINANT_SHARE_PCT) flags.push('imbalanced')
  if (pulse.lowCount > 0) flags.push('low-pulse')

  return {
    memberCount: memberIds.length,
    verifiedPoints: contrib.totalPoints,
    verifiedTasks,
    topShare,
    bottomShare,
    spread: topShare - bottomShare,
    avgRating,
    pulse,
    flags,
  }
}
