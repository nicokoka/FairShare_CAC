import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { endProject } from '../../lib/projects.js'
import Icon from '../ui/Icon.jsx'
import '../dashboard/create-project-modal.css'

/*
 * Confirmation dialog for ending a project (F8). Ending is a one-way door — it
 * locks the board and opens peer reviews — so the creator has to confirm on a
 * dialog that spells out exactly what happens. Only the creator ever sees the
 * button that opens this (and the rules enforce creator-only too). Rendered in a
 * portal, closes on Escape, reuses the shared modal-* CSS.
 */
export default function EndProjectModal({ projectId, projectName, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleEnd = async () => {
    setError('')
    setSubmitting(true)
    try {
      await endProject(projectId)
      onClose()
    } catch {
      setError("We couldn't end the project. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji"><Icon name="flag" size={38} /></p>
        <h2 id="end-project-title" className="modal-title">End “{projectName}”?</h2>
        <p className="modal-sub">
          This wraps up the project. Here’s what happens:
        </p>

        <ul className="modal-list">
          <li>The task board locks — no more claiming, moving, or verifying.</li>
          <li>Everyone can rate their teammates in a private peer review.</li>
          <li>The fairness report becomes available.</li>
        </ul>

        <p className="modal-hint">You can’t reopen a project once it’s ended.</p>

        {error && (
          <p className="modal-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleEnd}
            disabled={submitting}
          >
            {submitting ? 'Ending…' : 'End project'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
