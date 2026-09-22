import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import {
  approveTask,
  claimTask,
  isValidProofUrl,
  sizePoints,
  startTask,
} from '../../lib/tasks.js'
import MarkDoneModal from './MarkDoneModal.jsx'
import RejectTaskModal from './RejectTaskModal.jsx'
import TaskMenu from './TaskMenu.jsx'

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
export default function TaskCard({ task, members, projectId, projectCreatedBy }) {
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

  const isDoing = task.status === 'doing'
  const isDone = task.status === 'done'
  const isVerified = task.status === 'verified'

  const showClaim = isUnclaimed && task.status === 'todo'
  const showStart = isMine && task.status === 'todo'
  const showMarkDone = isMine && isDoing
  // Any member except the assignee can verify a task that's waiting.
  const showVerify = isDone && !isMine
  const hasMoveAction = showClaim || showStart || showMarkDone

  const hasProofLink = (isDone || isVerified) && isValidProofUrl(task.proofUrl)
  const verifier = isVerified && task.verifiedBy ? members?.[task.verifiedBy] : null
  const rejection = isDoing ? task.lastRejection : null

  const cardClass = [
    'task-card',
    isDone && 'task-card--pending',
    isVerified && 'task-card--verified',
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
      {isCreator && (
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

      {rejection && (
        <div className="task-rejection" role="status">
          <p className="task-rejection-label">
            <span aria-hidden="true">↩️</span> Sent back — needs another look
          </p>
          <p className="task-rejection-reason">“{rejection.reason}”</p>
        </div>
      )}

      {isDone && (
        <div className="task-pending">
          <p className="task-pending-status">
            <span aria-hidden="true">⏳</span>{' '}
            {isMine ? 'Waiting for a teammate to verify' : 'Needs verification'}
          </p>
          {hasProofLink && <ProofLink url={task.proofUrl} />}
        </div>
      )}

      {isVerified && (
        <div className="task-verified">
          <p className="task-verified-status">
            <span aria-hidden="true">🎉</span> Verified
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

// The clickable proof link shown on done and verified cards.
function ProofLink({ url }) {
  return (
    <a
      className="task-proof"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      🔗 View proof
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
