import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCheckins } from '../../hooks/useCheckins.jsx'
import {
  submitCheckin,
  summarizeCheckins,
  MIN_FEELING,
  MAX_FEELING,
} from '../../lib/checkins.js'
import Icon from '../ui/Icon.jsx'

const SCALE = Array.from({ length: MAX_FEELING - MIN_FEELING + 1 }, (_, i) => MIN_FEELING + i)

/*
 * The fairness pulse card. During the project, each member can quietly rate how
 * fair the workload feels right now (1–5) with an optional note. The team sees an
 * anonymized pulse (average + how many feel things are off) plus the notes — a
 * chance to fix friction before it hardens into an end-of-project complaint.
 *
 * @param {{ projectId: string, locked: boolean }} props
 */
export default function CheckInCard({ projectId, locked }) {
  const { user } = useAuth()
  const { checkins } = useCheckins(projectId)
  const pulse = summarizeCheckins(checkins)

  const mine = checkins.find((checkin) => checkin.uid === user?.uid)
  const [feeling, setFeeling] = useState(mine?.fairnessFeeling || 0)
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Hide on an ended project nobody checked into.
  if (locked && pulse.count === 0) return null

  const notes = checkins
    .map((checkin) => checkin.note)
    .filter((text) => text && text.trim())

  const handleSubmit = async () => {
    if (!feeling || saving) return
    setSaving(true)
    try {
      await submitCheckin(projectId, user, { fairnessFeeling: feeling, note })
      setOpen(false)
      setNote('')
    } catch {
      // Best-effort; the live snapshot reflects it if it landed.
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="pulse" aria-label="Fairness pulse">
      <div className="pulse-head">
        <h2 className="pulse-title">
          <Icon name="hand" size={20} className="icon-inline" /> Fairness pulse
        </h2>
        {pulse.count > 0 ? (
          <span className="pulse-stat">
            <strong>{pulse.avgFeeling.toFixed(1)}</strong>/5 · {pulse.count}{' '}
            {pulse.count === 1 ? 'check-in' : 'check-ins'}
          </span>
        ) : (
          <span className="pulse-stat pulse-stat--empty">No check-ins yet</span>
        )}
      </div>

      {pulse.lowCount > 0 && (
        <p className="pulse-flag" role="note">
          {pulse.lowCount} {pulse.lowCount === 1 ? 'teammate feels' : 'teammates feel'} the workload
          isn't fair right now.
        </p>
      )}

      {notes.length > 0 && (
        <ul className="pulse-notes">
          {notes.map((text, index) => (
            <li key={index} className="pulse-note">“{text}”</li>
          ))}
        </ul>
      )}

      {!locked && (
        <div className="pulse-action">
          {!open ? (
            <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
              {mine ? 'Update your check-in' : 'How fair does it feel?'}
            </button>
          ) : (
            <div className="pulse-form">
              <div className="pulse-scale" role="group" aria-label="Fairness, 1 to 5">
                {SCALE.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`pulse-dot ${feeling === value ? 'pulse-dot--on' : ''}`}
                    onClick={() => setFeeling(value)}
                    aria-pressed={feeling === value}
                  >
                    {value}
                  </button>
                ))}
                <span className="pulse-scale-ends">1 = unfair · 5 = very fair</span>
              </div>
              <textarea
                className="pulse-note-input"
                rows={2}
                value={note}
                placeholder="Optional: what would make it fairer?"
                onChange={(event) => setNote(event.target.value)}
              />
              <div className="pulse-form-actions">
                <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={!feeling || saving}
                >
                  {saving ? 'Saving…' : 'Submit check-in'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
