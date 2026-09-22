import { useEffect, useRef, useState } from 'react'
import { deleteTask, reassignTask } from '../../lib/tasks.js'

/*
 * The project creator's per-task menu (the "⋯" kebab): reassign the task to a
 * teammate (or release it), or delete it. Only rendered for the project creator
 * — the rules also enforce both actions as creator-only, so this is the UI
 * surface for that power. Closes on outside click or Escape; delete is a
 * two-step confirm so it can't be triggered by a stray click.
 */
export default function TaskMenu({ task, members, projectId }) {
  const [open, setOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef(null)

  const close = () => {
    setOpen(false)
    setConfirmingDelete(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const handlePointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) close()
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('mousedown', handlePointer)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handlePointer)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const handleReassign = async (event) => {
    const value = event.target.value
    setBusy(true)
    try {
      await reassignTask(projectId, task.id, value || null)
      close()
    } catch {
      // Leave the menu open so the creator can retry.
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteTask(projectId, task.id)
      // On success the task vanishes from the live board and this card unmounts.
    } catch {
      setBusy(false)
    }
  }

  const memberEntries = Object.entries(members || {})

  return (
    <div className="task-menu" ref={menuRef}>
      <button
        type="button"
        className="task-menu-btn"
        aria-label="Task options"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⋯
      </button>

      {open && (
        <div className="task-menu-pop" role="menu">
          <label className="task-menu-label" htmlFor={`reassign-${task.id}`}>
            Assign to
          </label>
          <select
            id={`reassign-${task.id}`}
            className="task-menu-select"
            value={task.assignee || ''}
            onChange={handleReassign}
            disabled={busy}
          >
            <option value="">Anyone can claim</option>
            {memberEntries.map(([uid, member]) => (
              <option key={uid} value={uid}>
                {member.name || 'Teammate'}
              </option>
            ))}
          </select>

          {confirmingDelete ? (
            <div className="task-menu-confirm">
              <span className="task-menu-confirm-text">Delete this task?</span>
              <div className="task-menu-confirm-actions">
                <button
                  type="button"
                  className="task-menu-danger"
                  onClick={handleDelete}
                  disabled={busy}
                >
                  {busy ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  className="task-menu-cancel"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="task-menu-delete"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
            >
              Delete task
            </button>
          )}
        </div>
      )}
    </div>
  )
}
