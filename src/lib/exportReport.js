// Report → CSV export. The report is already a printable page; this adds a
// spreadsheet a teacher can sort, filter, or paste into a gradebook. The string
// building is a PURE function (buildReportCsv) so it's unit-tested in isolation;
// the thin download wrapper is the only part that touches the browser.

/**
 * Escape one CSV field per RFC 4180: wrap in quotes when it contains a comma,
 * quote, or newline, and double any embedded quotes.
 *
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const round1 = (value) => (value === null || value === undefined ? '' : value.toFixed(1))

/**
 * Build the per-member CSV for a finished project's report. One row per member
 * with the two headline numbers broken out into their parts, mirroring exactly
 * what the on-screen report shows — no new math here.
 *
 * @param {object} args
 * @param {{ name?: string }} args.project
 * @param {string[]} args.ranked  member uids, already sorted for display
 * @param {{ byMember: Record<string, { verifiedTasks: number, points: number, share: number }> }} args.contrib
 * @param {Record<string, { perCriterion: { effort: number|null, quality: number|null, teamwork: number|null }, overall: number|null, reviewCount: number }>} args.ratingByMember
 * @param {(uid: string) => string} args.nameFor
 * @returns {string} CSV text with a header row
 */
export function buildReportCsv({ project, ranked, contrib, ratingByMember, nameFor }) {
  const header = [
    'Member',
    'Verified tasks',
    'Points',
    'Share of verified work (%)',
    'Effort',
    'Quality',
    'Teamwork',
    'Overall rating',
    'Reviews received',
  ]

  const rows = ranked.map((uid) => {
    const c = contrib.byMember[uid]
    const r = ratingByMember[uid]
    return [
      nameFor(uid),
      c.verifiedTasks,
      c.points,
      Math.round(c.share),
      round1(r.perCriterion.effort),
      round1(r.perCriterion.quality),
      round1(r.perCriterion.teamwork),
      round1(r.overall),
      r.reviewCount,
    ]
  })

  const title = [`FairShare report: ${project?.name || 'Project'}`]

  return [title, header, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')
}

/** A filesystem-friendly slug for the download filename. */
function slugify(name) {
  return (name || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project'
}

/**
 * Build the CSV and trigger a browser download. Side-effecting wrapper around the
 * pure builder above; kept tiny so the testable logic stays in buildReportCsv.
 */
export function downloadReportCsv(args) {
  const csv = buildReportCsv(args)
  // Prepend a UTF-8 BOM so Excel opens accented names correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fairshare-${slugify(args.project?.name)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
