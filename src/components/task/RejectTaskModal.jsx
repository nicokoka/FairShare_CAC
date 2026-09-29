import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { rejectTask } from '../../lib/tasks.js'
import Icon from '../ui/Icon.jsx'
import '../dashboard/create-project-modal.css'
import './board.css'

/*
 * Modal for rejecting a task during verification (F7). Rejecting isn't a silent
 * thumbs-down — the assignee needs to know what to fix — so we require a written
 * reason before sending the task back to Doing. Mirrors MarkDoneModal: rendered
 * in a portal, focuses the field on open, closes on Escape, reuses the modal-*
 * CSS. The verifier (current user) is recorded so the card can show who asked
 * for changes.
 */
export default function RejectTaskModal({ projectId, task, members, onClose }) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
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

  const assigneeName = (task.assignee && members?.[task.assignee]?.name) || 'your teammate'
  const trimmed = reason.trim()
  const canSubmit = trimmed.length > 0 && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      await rejectTask(projectId, task.id, user, trimmed)
      onClose()
    } catch {
      setError("We couldn't send that back. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji"><Icon name="undo" size={38} /></p>
        <h2 id="reject-task-title" className="modal-title">Send it back</h2>
        <p className="modal-sub">
          Tell {assigneeName} what to fix on “{task.title}”. It’ll return to Doing.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="reject-reason">Reason</label>
          <textarea
            id="reject-reason"
            ref={inputRef}
            className="modal-input modal-textarea"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. The link isn’t shared — I can’t open it."
            rows={3}
          />
          <p className="modal-hint">
            Be specific and kind — this is the note your teammate acts on.
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
              {submitting ? 'Sending…' : 'Send back'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
