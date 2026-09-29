import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { createProject } from '../../lib/projects.js'
import Icon from '../ui/Icon.jsx'
import './create-project-modal.css'

const MAX_NAME_LENGTH = 60

/*
 * Modal for naming and creating a new project. It owns the form state and the
 * write; on success it tells the parent the new project id so the dashboard can
 * jump straight into it. Rendered through a portal so the overlay sits above
 * everything regardless of where it's mounted.
 */
export default function CreateProjectModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Focus the name field on open and close the modal on Escape.
  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const trimmedName = name.trim()
  const canSubmit = trimmedName.length > 0 && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      const { id } = await createProject(user, trimmedName)
      onCreated(id)
    } catch (err) {
      setError(err?.message || "We couldn't create your project. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <p className="modal-emoji"><Icon name="rocket" size={38} /></p>
        <h2 id="create-project-title" className="modal-title">
          Start a new project
        </h2>
        <p className="modal-sub">
          Give it a name your teammates will recognize. You'll get a join code to
          share right after.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            ref={inputRef}
            className="modal-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Bio Ecosystems Poster"
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
          />

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
              {submitting ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
