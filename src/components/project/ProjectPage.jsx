import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useProject } from '../../hooks/useProject.jsx'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import MembersList from './MembersList.jsx'
import EndProjectModal from './EndProjectModal.jsx'
import TaskBoard from '../task/TaskBoard.jsx'
import Icon from '../ui/Icon.jsx'
import './project-page.css'

// How long the "Copied!" confirmation stays visible after clicking copy.
const COPIED_FEEDBACK_MS = 1600

/*
 * A single project's page: the header (project name + shareable join code),
 * the team roster, and the live task board (F4) — three columns of tasks that
 * stay in sync across browsers via an onSnapshot listener.
 */
export default function ProjectPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { project, loading, notFound } = useProject(id)
  const [ending, setEnding] = useState(false)

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="project-page">
        <AppHeader />
        <main className="project-missing">
          <p className="project-missing-emoji"><Icon name="search" size={48} /></p>
          <h1 className="project-missing-title">We can't find that project</h1>
          <p className="project-missing-text">
            It might have been deleted, or you're not a member of it yet. Ask a
            teammate for the join code.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to my projects
          </Link>
        </main>
      </div>
    )
  }

  const isCreator = user?.uid === project.createdBy
  const isEnded = project.status === 'ended'

  return (
    <div className="project-page">
      <AppHeader />

      <main className="project-main">
        <header className="project-header">
          <div className="project-heading">
            <Link to="/dashboard" className="project-back">
              ← All projects
            </Link>
            <h1 className="project-name">{project.name}</h1>
          </div>
          <div className="project-header-side">
            {!isEnded && <JoinCodeBadge code={project.joinCode} />}
            {isCreator && !isEnded && (
              <button
                type="button"
                className="btn-ghost project-end-btn"
                onClick={() => setEnding(true)}
              >
                <Icon name="flag" size={18} className="icon-inline" /> End project
              </button>
            )}
          </div>
        </header>

        {isEnded && (
          <div className="project-ended-banner" role="status">
            <div className="project-ended-text">
              <p className="project-ended-title">
                <Icon name="confetti" size={22} className="icon-inline" /> Project ended — time for peer reviews!
              </p>
              <p className="project-ended-sub">
                The board is locked. Rate your teammates, then check the fairness report.
              </p>
            </div>
            <div className="project-ended-actions">
              <Link to={`/project/${project.id}/review`} className="btn-primary">
                Rate teammates →
              </Link>
              <Link to={`/project/${project.id}/report`} className="btn-ghost">
                <Icon name="chart" size={18} className="icon-inline" /> Fairness report
              </Link>
            </div>
          </div>
        )}

        <MembersList members={project.members} createdBy={project.createdBy} />

        <TaskBoard
          projectId={project.id}
          members={project.members}
          createdBy={project.createdBy}
          locked={isEnded}
        />
      </main>

      {ending && (
        <EndProjectModal
          projectId={project.id}
          projectName={project.name}
          onClose={() => setEnding(false)}
        />
      )}
    </div>
  )
}

// The join code plus a one-click copy button, with brief "Copied!" feedback.
function JoinCodeBadge({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    } catch {
      // Clipboard can be blocked (e.g. insecure context). The code is still
      // shown on screen, so the user can copy it by hand — no error needed.
    }
  }

  return (
    <div className="join-code">
      <span className="join-code-label">Join code</span>
      <div className="join-code-row">
        <span className="join-code-value">{code}</span>
        <button type="button" className="join-code-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
