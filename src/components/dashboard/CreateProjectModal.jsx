import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { createProject } from '../../lib/projects.js'
import { createTask } from '../../lib/tasks.js'
import { isAiSummaryEnabled } from '../../lib/firebase.js'
import { generateTaskPlan } from '../../lib/aiPlanner.js'
import Icon from '../ui/Icon.jsx'
import './create-project-modal.css'

const MAX_NAME_LENGTH = 60

/*
 * Modal for naming and creating a new project. It owns the form state and the
 * write; on success it tells the parent the new project id so the dashboard can
 * jump straight into it.
 *
 * When AI is enabled it also offers a "Plan with AI" step: describe the
 * assignment, Gemini suggests a balanced starter task list, and the checked
 * tasks are created on the new board right after the project. The suggestions are
 * only ever that — the student reviews and unchecks before creating.
 */
export default function CreateProjectModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const aiEnabled = isAiSummaryEnabled()
  const [planOpen, setPlanOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState([]) // [{ title, size, checked }]
  const [planError, setPlanError] = useState('')

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
  const chosenCount = suggestions.filter((task) => task.checked).length

  const handleSuggest = async () => {
    if (!description.trim() || suggesting) return
    setPlanError('')
    setSuggesting(true)
    const tasks = await generateTaskPlan(description.trim())
    setSuggesting(false)
    if (!tasks) {
      setPlanError("Couldn't draft tasks right now — you can still add them by hand.")
      return
    }
    setSuggestions(tasks.map((task) => ({ ...task, checked: true })))
  }

  const toggleSuggestion = (index) => {
    setSuggestions((prev) =>
      prev.map((task, i) => (i === index ? { ...task, checked: !task.checked } : task)),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      const { id } = await createProject(user, trimmedName)
      // Create the accepted AI-suggested tasks on the fresh board. A failure on
      // any one task shouldn't block entering the project.
      const chosen = suggestions.filter((task) => task.checked)
      for (const task of chosen) {
        try {
          await createTask(id, user, { title: task.title, size: task.size })
        } catch {
          // Skip a task that failed to write; the rest still land.
        }
      }
      onCreated(id)
    } catch (err) {
      setError(err?.message || "We couldn't create your project. Please try again.")
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
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

          {aiEnabled && (
            <div className="planner">
              {!planOpen ? (
                <button
                  type="button"
                  className="planner-toggle"
                  onClick={() => setPlanOpen(true)}
                >
                  ✨ Plan with AI
                </button>
              ) : (
                <div className="planner-body">
                  <label className="modal-label" htmlFor="plan-desc">
                    Describe the assignment
                  </label>
                  <textarea
                    id="plan-desc"
                    className="modal-input planner-textarea"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="e.g. A 5-slide presentation on the water cycle, with a poster and a short class demo"
                  />
                  <button
                    type="button"
                    className="btn-ghost planner-suggest"
                    onClick={handleSuggest}
                    disabled={!description.trim() || suggesting}
                  >
                    {suggesting ? 'Thinking…' : 'Suggest tasks'}
                  </button>

                  {planError && <p className="modal-error">{planError}</p>}

                  {suggestions.length > 0 && (
                    <ul className="planner-list">
                      {suggestions.map((task, index) => (
                        <li key={index} className="planner-item">
                          <label className="planner-check">
                            <input
                              type="checkbox"
                              checked={task.checked}
                              onChange={() => toggleSuggestion(index)}
                            />
                            <span className={`planner-size planner-size--${task.size}`}>{task.size}</span>
                            <span className="planner-title">{task.title}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

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
              {submitting
                ? 'Creating…'
                : chosenCount > 0
                  ? `Create + ${chosenCount} ${chosenCount === 1 ? 'task' : 'tasks'}`
                  : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
