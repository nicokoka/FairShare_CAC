import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isValidProofUrl, markTaskDone } from '../../lib/tasks.js'
import '../dashboard/create-project-modal.css'
import './board.css'

/*
 * Modal for marking a task done (F6). Marking done isn't free — you have to
 * show your work — so we require a proof link (a Google Doc, a GitHub link, a
 * photo of the finished poster…). The link is validated as a real http(s) URL
 * before we write it, because a teammate will click it to verify the task and
 * it later appears on the fairness report. Mirrors AddTaskModal: rendered in a
 * portal, focuses the field on open, closes on Escape, reuses the modal-* CSS.
 */
export default function MarkDoneModal({ projectId, task, onClose }) {
  const [proofUrl, setProofUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const trimmed = proofUrl.trim()
  const canSubmit = trimmed.length > 0 && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    if (!isValidProofUrl(trimmed)) {
      setError("That doesn't look like a web link — it should start with http:// or https://")
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await markTaskDone(projectId, task.id, trimmed)
      onClose()
    } catch {
      setError("We couldn't submit that. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-done-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji" aria-hidden="true">🎉</p>
        <h2 id="mark-done-title" className="modal-title">Show your work</h2>
        <p className="modal-sub">
          Add a link to “{task.title}” so a teammate can check it off.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="proof-url">Proof link</label>
          <input
            id="proof-url"
            ref={inputRef}
            className="modal-input"
            type="url"
            inputMode="url"
            value={proofUrl}
            onChange={(event) => setProofUrl(event.target.value)}
            placeholder="https://docs.google.com/…"
            autoComplete="off"
          />
          <p className="modal-hint">
            A Google Doc, a GitHub link, a shared photo — anything a teammate can open.
          </p>

          {error && (
            <p className="modal-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? 'Submitting…' : 'Mark done'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
