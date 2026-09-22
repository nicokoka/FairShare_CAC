import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { createTask, TASK_SIZES } from '../../lib/tasks.js'
import '../dashboard/create-project-modal.css'
import './board.css'

const MAX_TITLE_LENGTH = 100
const DEFAULT_SIZE = 'M'

/*
 * Modal for adding a task: a title, a size (S/M/L shown as chips with their
 * point values), and an optional assignee. Leaving the assignee on "Anyone can
 * claim" creates an unclaimed task a teammate can pick up in F5. Mirrors the
 * create/join project modals — rendered in a portal, closes on Escape, focuses
 * the title field on open — and reuses their shared `modal-*` styles.
 */
export default function AddTaskModal({ projectId, members, onClose }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [assignee, setAssignee] = useState('')
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

  const memberEntries = Object.entries(members || {})
  const trimmedTitle = title.trim()
  const canSubmit = trimmedTitle.length > 0 && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      await createTask(projectId, user, {
        title: trimmedTitle,
        size,
        assignee: assignee || null,
      })
      onClose()
    } catch {
      setError("We couldn't add that task. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji" aria-hidden="true">✏️</p>
        <h2 id="add-task-title" className="modal-title">Add a task</h2>
        <p className="modal-sub">
          What needs doing? Pick a size so effort counts fairly later.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="task-title">Task</label>
          <input
            id="task-title"
            ref={inputRef}
            className="modal-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Draft the intro slide"
            maxLength={MAX_TITLE_LENGTH}
            autoComplete="off"
          />

          <fieldset className="size-picker">
            <legend className="modal-label">Size</legend>
            {TASK_SIZES.map((option) => (
              <label
                key={option.value}
                className={`size-option${size === option.value ? ' size-option--on' : ''}`}
              >
                <input
                  type="radio"
                  name="task-size"
                  value={option.value}
                  checked={size === option.value}
                  onChange={() => setSize(option.value)}
                />
                <span className="size-option-label">{option.label}</span>
                <span className="size-option-points">
                  {option.points} {option.points === 1 ? 'pt' : 'pts'}
                </span>
              </label>
            ))}
          </fieldset>

          <label className="modal-label" htmlFor="task-assignee">Assign to</label>
          <select
            id="task-assignee"
            className="modal-input"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          >
            <option value="">Anyone can claim</option>
            {memberEntries.map(([uid, member]) => (
              <option key={uid} value={uid}>
                {member.name || 'Teammate'}
              </option>
            ))}
          </select>

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
              {submitting ? 'Adding…' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
