import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { joinProject, lookupJoinCode } from '../../lib/projects.js'
import { CODE_LENGTH } from '../../lib/joinCode.js'
import Icon from '../ui/Icon.jsx'
import './create-project-modal.css'

/*
 * Modal for joining an existing project with a code. The tricky part: security
 * rules stop a non-member from reading a project doc, so we can't peek at it to
 * validate before joining. Instead we:
 *   1. resolve the code → projectId via the public joinCodes lookup,
 *   2. check the user's *own* project list to catch "already a member",
 *   3. attempt the self-join write; the rules reject ended projects, which we
 *      surface as a friendly message.
 * `myProjects` is passed in so step 2 needs no extra read.
 */
export default function JoinProjectModal({ myProjects, onClose, onJoined }) {
  const { user } = useAuth()
  const [code, setCode] = useState('')
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

  // Normalize as the user types: uppercase, no spaces, only real code chars.
  const handleChange = (event) => {
    const cleaned = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH)
    setCode(cleaned)
    if (error) setError('')
  }

  const canSubmit = code.length === CODE_LENGTH && !submitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      const projectId = await lookupJoinCode(code)
      if (!projectId) {
        setError("We couldn't find a project with that code. Double-check it and try again.")
        setSubmitting(false)
        return
      }

      // Already a member? Jump straight in instead of erroring.
      const alreadyMember = myProjects.some((project) => project.id === projectId)
      if (alreadyMember) {
        onJoined(projectId)
        return
      }

      await joinProject(user, projectId)
      onJoined(projectId)
    } catch (err) {
      // We can't read the project as a non-member, so a permission-denied here
      // doesn't tell us *why*. The expected reason is a project that's already
      // ended (the self-join rule only allows active ones), so we say so — but
      // hedge, since it could also be a transient issue.
      if (err?.code === 'permission-denied') {
        setError("We couldn't join you to this project. It may have already ended.")
      } else {
        setError("We couldn't join you to that project. Please try again.")
      }
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-emoji"><Icon name="ticket" size={38} /></p>
        <h2 id="join-project-title" className="modal-title">
          Join a project
        </h2>
        <p className="modal-sub">
          Enter the 6-character code a teammate shared with you.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="join-code-input">
            Join code
          </label>
          <input
            id="join-code-input"
            ref={inputRef}
            className="modal-input modal-input--code"
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="K7P2WM"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck="false"
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
              {submitting ? 'Joining…' : 'Join project'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
