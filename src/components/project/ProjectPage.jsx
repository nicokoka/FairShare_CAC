import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject.jsx'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import MembersList from './MembersList.jsx'
import TaskBoard from '../task/TaskBoard.jsx'
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
  const { project, loading, notFound } = useProject(id)

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="project-page">
        <AppHeader />
        <main className="project-missing">
          <p className="project-missing-emoji" aria-hidden="true">🔍</p>
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
          <JoinCodeBadge code={project.joinCode} />
        </header>

        <MembersList members={project.members} createdBy={project.createdBy} />

        <TaskBoard
          projectId={project.id}
          members={project.members}
          createdBy={project.createdBy}
        />
      </main>
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
