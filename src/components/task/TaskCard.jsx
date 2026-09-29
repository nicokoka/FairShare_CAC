import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import {
  approveTask,
  claimTask,
  isValidProofUrl,
  setTaskDueDate,
  sizePoints,
  startTask,
} from '../../lib/tasks.js'
import { formatDueLabel } from '../../lib/dueDate.js'
import MarkDoneModal from './MarkDoneModal.jsx'
import RejectTaskModal from './RejectTaskModal.jsx'
import TaskMenu from './TaskMenu.jsx'
import Icon from '../ui/Icon.jsx'

/*
 * A single task on the board: title, a size chip with its point value, the
 * assignee (or an "Unclaimed" pill), and the actions available to whoever's
 * looking — Claim an unclaimed task, Start one assigned to you, or Mark done
 * with a proof link (F6). Verification (F7): a "done" task shows Approve/Reject
 * to any member EXCEPT the assignee (who instead sees "waiting for a teammate");
 * approving stamps a celebratory verified state, rejecting sends it back to
 * Doing with the teammate's reason shown on the card. The project creator also
 * gets a "⋯" menu to reassign or delete. Who can do what is enforced by the
 * Firestore rules; this component only shows the buttons that will succeed.
 */
export default function TaskCard({ task, members, projectId, projectCreatedBy, locked = false }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [markingDone, setMarkingDone] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const currentUid = user?.uid
  const assignee = task.assignee ? members?.[task.assignee] : null
  const isMine = task.assignee === currentUid
  const isUnclaimed = task.assignee == null
  const isCreator = currentUid === projectCreatedBy

  const isTodo = task.status === 'todo'
  const isDoing = task.status === 'doing'
  const isDone = task.status === 'done'
  const isVerified = task.status === 'verified'

  // Due date (F15). Overdue only nags while there's still work to do — once a
  // task is submitted (done) or verified we stop flagging it. The assignee or
  // the project creator can set/clear the date on a still-open task.
  const due = formatDueLabel(task.dueDate)
  const isOverdue = due?.tone === 'overdue' && (isTodo || isDoing)
  const canEditDue = !locked && (isMine || isCreator) && (isTodo || isDoing)

  // Once the project has ended the board is read-only — every action is hidden
  // (the rules deny the writes too, so this just keeps the UI honest).
  const showClaim = !locked && isUnclaimed && task.status === 'todo'
  const showStart = !locked && isMine && task.status === 'todo'
  const showMarkDone = !locked && isMine && isDoing
  // Any member except the assignee can verify a task that's waiting.
  const showVerify = !locked && isDone && !isMine
  const hasMoveAction = showClaim || showStart || showMarkDone

  const hasProofLink = (isDone || isVerified) && isValidProofUrl(task.proofUrl)
  const verifier = isVerified && task.verifiedBy ? members?.[task.verifiedBy] : null
  const rejection = isDoing ? task.lastRejection : null

  const cardClass = [
    'task-card',
    isDone && 'task-card--pending',
    isVerified && 'task-card--verified',
    isOverdue && 'task-card--overdue',
  ]
    .filter(Boolean)
    .join(' ')

  // Run a task write, guarding against double-clicks and surfacing failures.
  const run = async (action) => {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch {
      setError("That didn't work — try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={cardClass}>
      {isCreator && !locked && (
        <TaskMenu task={task} members={members} projectId={projectId} />
      )}

      {isVerified && (
        <span className="task-stamp" aria-hidden="true">✓</span>
      )}

      <p className="task-title">{task.title}</p>

      <div className="task-meta">
        <SizeChip size={task.size} />
        {assignee ? (
          <span className="task-assignee">
            <TaskAvatar member={assignee} />
            <span className="task-assignee-name">{assignee.name || 'Teammate'}</span>
          </span>
        ) : (
          <span className="task-unclaimed">Unclaimed</span>
        )}
      </div>

      <DueDate task={task} due={due} projectId={projectId} canEdit={canEditDue} />

      {rejection && (
        <div className="task-rejection" role="status">
          <p className="task-rejection-label">
            <Icon name="undo" size={16} className="icon-inline" /> Sent back — needs another look
          </p>
          <p className="task-rejection-reason">“{rejection.reason}”</p>
        </div>
      )}

      {isDone && (
        <div className="task-pending">
          <p className="task-pending-status">
            <Icon name="hourglass" size={16} className="icon-inline" />
            {isMine ? 'Waiting for a teammate to verify' : 'Needs verification'}
          </p>
          {hasProofLink && <ProofLink url={task.proofUrl} />}
        </div>
      )}

      {isVerified && (
        <div className="task-verified">
          <p className="task-verified-status">
            <Icon name="confetti" size={16} className="icon-inline" /> Verified
            {verifier ? ` by ${verifier.name || 'a teammate'}` : ''}
          </p>
          {hasProofLink && <ProofLink url={task.proofUrl} />}
        </div>
      )}

      {showVerify && (
        <div className="task-actions">
          <button
            type="button"
            className="task-btn task-btn--approve"
            disabled={busy}
            onClick={() => run(() => approveTask(projectId, task.id, user))}
          >
            {busy ? '…' : '✓ Approve'}
          </button>
          <button
            type="button"
            className="task-btn task-btn--reject"
            disabled={busy}
            onClick={() => setRejecting(true)}
          >
            Reject
          </button>
        </div>
      )}

      {hasMoveAction && (
        <div className="task-actions">
          {showClaim && (
            <button
              type="button"
              className="task-btn task-btn--claim"
              disabled={busy}
              onClick={() => run(() => claimTask(projectId, task.id, user))}
            >
              {busy ? '…' : 'Claim'}
            </button>
          )}
          {showStart && (
            <button
              type="button"
              className="task-btn task-btn--start"
              disabled={busy}
              onClick={() => run(() => startTask(projectId, task.id))}
            >
              {busy ? '…' : 'Start'}
            </button>
          )}
          {showMarkDone && (
            <button
              type="button"
              className="task-btn task-btn--done"
              onClick={() => setMarkingDone(true)}
            >
              Mark done
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="task-error" role="alert">
          {error}
        </p>
      )}

      {markingDone && (
        <MarkDoneModal
          projectId={projectId}
          task={task}
          onClose={() => setMarkingDone(false)}
        />
      )}

      {rejecting && (
        <RejectTaskModal
          projectId={projectId}
          task={task}
          members={members}
          onClose={() => setRejecting(false)}
        />
      )}
    </article>
  )
}

// The due-date row (F15). Shows a friendly relative chip colored by urgency. If
// the current user may edit it (assignee/creator on an open task), the chip is a
// button that reveals an inline date picker; otherwise it's a static chip. When
// there's no date yet, editors see a quiet "Add due date" affordance.
function DueDate({ task, due, projectId, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Save (or clear, with '') the date, then close the editor. On failure we keep
  // the editor open so the user can retry rather than silently losing their pick.
  const save = async (value) => {
    setSaving(true)
    try {
      await setTaskDueDate(projectId, task.id, value)
      setEditing(false)
    } catch {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="task-due-edit">
        <input
          type="date"
          className="task-due-input"
          defaultValue={task.dueDate || ''}
          disabled={saving}
          aria-label="Set due date"
          onChange={(event) => save(event.target.value)}
        />
        {task.dueDate && (
          <button
            type="button"
            className="task-due-clear"
            disabled={saving}
            onClick={() => save('')}
          >
            Clear
          </button>
        )}
      </div>
    )
  }

  if (due && !canEdit) {
    return (
      <span className={`task-due task-due--${due.tone}`}>
        <Icon name="calendar" size={15} /> {due.label}
      </span>
    )
  }

  if (due) {
    return (
      <button
        type="button"
        className={`task-due task-due--${due.tone}`}
        aria-label={`${due.label}. Change due date`}
        onClick={() => setEditing(true)}
      >
        <Icon name="calendar" size={15} /> {due.label}
      </button>
    )
  }

  if (canEdit) {
    return (
      <button
        type="button"
        className="task-due task-due--add"
        onClick={() => setEditing(true)}
      >
        <Icon name="calendar" size={15} /> Add due date
      </button>
    )
  }

  return null
}

// The clickable proof link shown on done and verified cards.
function ProofLink({ url }) {
  return (
    <a
      className="task-proof"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon name="link" size={14} className="icon-inline" /> View proof
    </a>
  )
}

// The size code plus its point value, e.g. "M · 2 pts".
function SizeChip({ size }) {
  const points = sizePoints(size)
  return (
    <span className={`size-chip size-chip--${(size || '').toLowerCase()}`}>
      {size} · {points} {points === 1 ? 'pt' : 'pts'}
    </span>
  )
}

// Small avatar for the assignee; falls back to their initial when there's no
// photo (same approach as the members roster).
function TaskAvatar({ member }) {
  if (member.photoURL) {
    return (
      <img
        className="task-avatar"
        src={member.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="26"
        height="26"
      />
    )
  }
  const initial = (member.name || '?').trim()[0].toUpperCase()
  return <span className="task-avatar task-avatar--fallback">{initial}</span>
}
