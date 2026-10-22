// Task due dates → an .ics calendar file. A teammate can download it and import
// every deadline into Google/Apple/Outlook calendar in one go. The .ics text is
// built by a PURE function (buildCalendar) so it's unit-tested; the download
// wrapper is the only browser-touching part.
//
// Tasks store their due date as a 'YYYY-MM-DD' calendar day (see dueDate.js), so
// each event is an all-day VEVENT — no timezone math, which is exactly why the
// string date was chosen in the first place.

const pad = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' → 'YYYYMMDD' (the DATE value form iCalendar wants).
function icsDate(dayString) {
  return dayString.replace(/-/g, '')
}

// The day after `dayString`, as 'YYYYMMDD'. An all-day VEVENT's DTEND is
// exclusive, so a one-day event ends on the following date.
function nextIcsDate(dayString) {
  const [year, month, day] = dayString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + 1)
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
}

// A UTC timestamp in iCalendar's DATE-TIME form, e.g. 20261021T143000Z.
function icsStamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

// Escape per RFC 5545: backslash, semicolon, comma, and newlines are special.
function escapeText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Build an iCalendar (.ics) document with one all-day event per task that has a
 * due date. Tasks without a valid 'YYYY-MM-DD' due date are skipped.
 *
 * @param {string} projectName
 * @param {Array<{ id?: string, title: string, size?: string, status?: string, dueDate?: string|null }>} tasks
 * @param {{ now?: Date }} [options]  now is injectable so tests are deterministic
 * @returns {string} the .ics text (CRLF line endings, per spec)
 */
export function buildCalendar(projectName, tasks, { now = new Date() } = {}) {
  const dated = tasks.filter((task) => typeof task.dueDate === 'string' && DATE_RE.test(task.dueDate))
  const stamp = icsStamp(now)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FairShare//Task Deadlines//EN',
    'CALSCALE:GREGORIAN',
  ]

  dated.forEach((task, index) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(task.id || `task-${index}`)}@fairshare`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(task.dueDate)}`,
      `DTEND;VALUE=DATE:${nextIcsDate(task.dueDate)}`,
      `SUMMARY:${escapeText(`${projectName}: ${task.title}`)}`,
      `DESCRIPTION:${escapeText(`FairShare task · size ${task.size || '?'} · ${task.status || ''}`)}`,
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** How many of these tasks will actually produce a calendar event. */
export function datedTaskCount(tasks) {
  return tasks.filter((task) => typeof task.dueDate === 'string' && DATE_RE.test(task.dueDate)).length
}

/** A filesystem-friendly slug for the download filename. */
function slugify(name) {
  return (
    (name || 'project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'project'
  )
}

/** Build the .ics and trigger a browser download. */
export function downloadCalendar(projectName, tasks) {
  const ics = buildCalendar(projectName, tasks)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fairshare-${slugify(projectName)}-deadlines.ics`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
