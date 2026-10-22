// AI Project Planner. Fairness at the START of a project: describe the
// assignment and Gemini proposes a balanced, right-sized starter task list you
// can drop onto the board. Like the AI summary, it's optional and fully guarded —
// if AI is unavailable the planner button simply doesn't appear and you add tasks
// by hand as before.
//
// The model only ever SUGGESTS; the student reviews and accepts. The prompt
// builder and the response parser are PURE (and unit-tested) — only
// generateTaskPlan touches the network.

import { getAiModel } from './firebase.js'

const VALID_SIZES = ['S', 'M', 'L']
const MAX_TASKS = 12
const MAX_TITLE = 80

/**
 * Build the planner prompt. Asks for a strict JSON array so the response is easy
 * to parse and can't smuggle prose onto the board.
 * @param {string} description
 * @returns {string}
 */
export function buildPlannerPrompt(description) {
  return [
    'You help students break a group school project into fair, right-sized tasks.',
    '',
    'Project description:',
    description,
    '',
    `Return 4 to ${MAX_TASKS} tasks as a JSON array; each item is`,
    '{"title": string, "size": "S" | "M" | "L"}.',
    'Size is effort: S ≈ an hour, M ≈ half a day, L ≈ a day or more.',
    'Cover the whole project, keep titles short and concrete, and balance the sizes.',
    'Output ONLY the JSON array — no prose, no markdown code fences.',
  ].join('\n')
}

/**
 * Parse (defensively) the model's text into a clean task list. Tolerates code
 * fences and surrounding prose, drops anything malformed, normalizes sizes to
 * S/M/L (defaulting to M), trims/caps titles, and caps the count. Always returns
 * an array — never throws.
 *
 * @param {string} raw  the model's raw text output
 * @returns {Array<{ title: string, size: string }>}
 */
export function parseTaskPlan(raw) {
  if (typeof raw !== 'string') return []

  // Isolate the JSON array even if wrapped in ```json fences or chatter.
  let text = raw.trim()
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return []
  text = text.slice(start, end + 1)

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const tasks = []
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, MAX_TITLE) : ''
    if (!title) continue
    let size = typeof item.size === 'string' ? item.size.trim().toUpperCase() : 'M'
    if (!VALID_SIZES.includes(size)) size = 'M'
    tasks.push({ title, size })
    if (tasks.length >= MAX_TASKS) break
  }
  return tasks
}

/**
 * Ask the model for a task plan, or return null if AI is unavailable / errors /
 * produces nothing usable.
 * @param {string} description
 * @returns {Promise<Array<{ title: string, size: string }>|null>}
 */
export async function generateTaskPlan(description) {
  const model = getAiModel()
  if (!model) return null
  try {
    const result = await model.generateContent(buildPlannerPrompt(description))
    const tasks = parseTaskPlan(result?.response?.text?.() || '')
    return tasks.length ? tasks : null
  } catch {
    return null
  }
}
