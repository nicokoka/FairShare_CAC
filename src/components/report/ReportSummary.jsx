import { useState } from 'react'
import { isAiSummaryEnabled } from '../../lib/firebase.js'
import { generateAiSummary } from '../../lib/aiSummary.js'

/*
 * The report's "at a glance" summary. It always shows the rule-based insights
 * from src/lib/insights.js — the reliable, local source of truth. When the
 * optional AI layer is enabled (VITE_AI_SUMMARY=on + the Firebase AI Logic API
 * turned on in the console), a "Polish with AI" button appears that asks Gemini
 * to rephrase those same facts into a paragraph. If AI is off or errors, nothing
 * breaks — the insight list below is the whole feature on its own.
 *
 * @param {object} props
 * @param {Array<{ tone: 'positive'|'watch'|'info', text: string }>} props.insights
 * @param {{ name?: string }} props.project
 * @param {{ byMember: Record<string, { points: number, share: number }> }} props.contrib
 * @param {(uid: string) => string} props.nameFor
 * @param {string[]} props.ranked
 * @param {Record<string, { overall: number|null }>} props.ratingByMember
 */
export default function ReportSummary({ insights, project, contrib, nameFor, ranked, ratingByMember }) {
  const [aiText, setAiText] = useState('')
  const [aiState, setAiState] = useState('idle') // idle | loading | done | error
  const aiEnabled = isAiSummaryEnabled()

  if (!insights || insights.length === 0) return null

  // One compact fact line per member, feeding the AI prompt (same numbers the
  // report shows — the model only rephrases, never recomputes).
  const memberLines = ranked.map((uid) => {
    const c = contrib.byMember[uid]
    const overall = ratingByMember[uid]?.overall
    return (
      `${nameFor(uid)}: ${Math.round(c.share)}% of verified work (${c.points} pts), ` +
      `avg rating ${overall === null || overall === undefined ? 'n/a' : `${overall.toFixed(1)}/5`}`
    )
  })

  const handlePolish = async () => {
    setAiState('loading')
    const text = await generateAiSummary({ projectName: project?.name || 'Project', insights, memberLines })
    if (text) {
      setAiText(text)
      setAiState('done')
    } else {
      setAiState('error')
    }
  }

  return (
    <section className="report-summary" aria-label="Fairness insights">
      <div className="report-summary-head">
        <h2 className="report-h2">At a glance</h2>
        {aiEnabled && aiState !== 'done' && (
          <button
            type="button"
            className="btn-ghost report-ai-btn"
            onClick={handlePolish}
            disabled={aiState === 'loading'}
          >
            {aiState === 'loading' ? 'Thinking…' : '✨ Polish with AI'}
          </button>
        )}
      </div>

      {aiState === 'done' && (
        <div className="report-ai" role="note">
          <p className="report-ai-label">✨ AI-assisted summary</p>
          <p className="report-ai-text">{aiText}</p>
          <p className="report-ai-foot">
            Written by Gemini from the numbers below — the figures themselves are computed locally.
          </p>
        </div>
      )}

      {aiState === 'error' && (
        <p className="report-ai-error" role="status">
          Couldn't reach the AI just now — here's the summary from the numbers.
        </p>
      )}

      <ul className="insight-list">
        {insights.map((insight, index) => (
          <li key={index} className={`insight insight--${insight.tone}`}>
            <span className="insight-dot" aria-hidden="true" />
            <span className="insight-text">{insight.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
