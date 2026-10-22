import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { createClass } from '../../lib/classes.js'
import Icon from '../ui/Icon.jsx'
import '../dashboard/create-project-modal.css'

const MAX_NAME_LENGTH = 60

/*
 * Modal for a teacher to create a class. On success it returns the new class id
 * so the teacher home can jump straight into the class dashboard. Reuses the
 * shared modal styling.
 */
export default function CreateClassModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
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

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0 && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      const { id } = await createClass(user, trimmed)
      onCreated(id)
    } catch (err) {
      setError(err?.message || "We couldn't create your class. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-class-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji"><Icon name="team" size={38} /></p>
        <h2 id="create-class-title" className="modal-title">Create a class</h2>
        <p className="modal-sub">
          You'll get a class code to share. Students attach their projects to it,
          and each project's fairness lands on your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="class-name">Class name</label>
          <input
            id="class-name"
            ref={inputRef}
            className="modal-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Period 3 Biology"
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
          />

          {error && <p className="modal-error" role="alert">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? 'Creating…' : 'Create class'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
