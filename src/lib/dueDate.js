// Pure helpers for task due dates (F15). A due date is a plain calendar day the
// user picks, stored as a 'YYYY-MM-DD' string — NOT a moment in time. That
// choice keeps everything timezone-safe: we never turn the stored string into a
// UTC instant, we only compare day-to-day against *today's local date*. It also
// means "is this overdue?" is a one-line string/day comparison the student can
// read and explain. Pure (no Firebase) so the add-task modal, the task card, and
// later features can all reuse it and it's trivially unit-testable.

const MS_PER_DAY = 24 * 60 * 60 * 1000

// How many days out still counts as "due soon" (warm chip, gentle pressure).
const SOON_WINDOW_DAYS = 3

/**
 * Format a Date as a local 'YYYY-MM-DD' string. Uses the local date parts (not
 * toISOString, which is UTC) so a user picking "today" always gets their own day.
 *
 * @param {Date} date
 * @returns {string}
 */
export function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a 'YYYY-MM-DD' string into a Date at LOCAL midnight. Returns null for
 * anything that isn't a well-formed date string. (We build the Date from parts
 * rather than `new Date(str)`, which would parse the string as UTC.)
 *
 * @param {unknown} value
 * @returns {Date | null}
 */
function parseDateString(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/**
 * A friendly relative label for a task's due date, plus a "tone" the card uses
 * to color the chip. Everything is day-level: it compares the due day to today.
 *
 * @param {string | null | undefined} dueDate  a 'YYYY-MM-DD' string, or nothing
 * @param {Date} [now]  defaults to the current time; injectable for tests
 * @returns {{ label: string, tone: 'ok' | 'soon' | 'today' | 'overdue' } | null}
 *   null when the task has no due date at all.
 */
export function formatDueLabel(dueDate, now = new Date()) {
  const due = parseDateString(dueDate)
  if (!due) return null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY)

  if (diffDays < 0) {
    const overdueBy = Math.abs(diffDays)
    return {
      label: overdueBy === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueBy} days`,
      tone: 'overdue',
    }
  }
  if (diffDays === 0) return { label: 'Due today', tone: 'today' }
  if (diffDays === 1) return { label: 'Due tomorrow', tone: 'soon' }
  if (diffDays <= SOON_WINDOW_DAYS) return { label: `Due in ${diffDays} days`, tone: 'soon' }

  // Further out: show the actual date, calmly (no urgency color).
  return { label: `Due ${formatShortDate(due)}`, tone: 'ok' }
}

/** e.g. "Oct 9" — the reader's own locale, month + day only. */
function formatShortDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}
