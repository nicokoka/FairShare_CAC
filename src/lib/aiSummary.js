// Optional AI layer for the report summary. It takes the SAME facts the
// rule-based insights are built from and asks Gemini to rephrase them into one
// short, teacher-facing paragraph. It never introduces new numbers or judgments
// — the prompt pins it to the supplied facts — so the AI output can't disagree
// with the report. On any failure it returns null and the UI keeps the
// rule-based list, which is why the whole feature is safe to ship.
//
// buildPrompt is PURE (and unit-tested); generateAiSummary is the thin wrapper
// that actually calls the model.

import { getAiModel } from './firebase.js'

// Keep the output short enough to skim and grounded in the given facts only.
const MAX_WORDS = 110

/**
 * Compose the prompt from the report's own facts.
 *
 * @param {object} args
 * @param {string} args.projectName
 * @param {Array<{ tone: string, text: string }>} args.insights  rule-based notes
 * @param {string[]} args.memberLines  one "Name: X% of work, avg rating Y/5" line each
 * @returns {string}
 */
export function buildPrompt({ projectName, insights, memberLines }) {
  const facts = insights.map((insight) => `- ${insight.text}`).join('\n')
  const members = memberLines.map((line) => `- ${line}`).join('\n')

  return [
    `You are helping a teacher read a fairness report for the group project "${projectName}".`,
    '',
    'Per-member numbers:',
    members,
    '',
    'Observations already computed from the data:',
    facts,
    '',
    `Write ONE encouraging, neutral paragraph (at most ${MAX_WORDS} words) that summarizes how fairly the work and ratings came out, for the teacher.`,
    'Rules: use only the facts above, invent no new numbers or names, do not accuse anyone, and suggest a conversation rather than a grade. Plain text only, no markdown.',
  ].join('\n')
}

/**
 * Generate the AI paragraph, or return null if AI is unavailable or errors.
 *
 * @param {Parameters<typeof buildPrompt>[0]} args
 * @returns {Promise<string|null>}
 */
export async function generateAiSummary(args) {
  const model = getAiModel()
  if (!model) return null
  try {
    const result = await model.generateContent(buildPrompt(args))
    const text = result?.response?.text?.()
    return typeof text === 'string' && text.trim() ? text.trim() : null
  } catch {
    // API disabled, offline, quota, anything — the caller falls back silently.
    return null
  }
}
