import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useProjects } from '../../hooks/useProjects.jsx'
import AppHeader from '../layout/AppHeader.jsx'
import ProjectCard from './ProjectCard.jsx'
import CreateProjectModal from './CreateProjectModal.jsx'
import JoinProjectModal from './JoinProjectModal.jsx'
import Icon from '../ui/Icon.jsx'
import './dashboard.css'

/*
 * The dashboard is the home base for a signed-in user: a live list of every
 * project they're in, plus buttons to start a new one or join a teammate's with
 * a code. The project list comes from a real-time listener (useProjects), so a
 * project appears the instant it's created or joined — even from another tab.
 */
export default function Dashboard() {
  const { user } = useAuth()
  const { projects, loading, error } = useProjects(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const navigate = useNavigate()

  const firstName = (user?.displayName || 'there').split(' ')[0]

  const handleCreated = (projectId) => {
    setShowCreate(false)
    navigate(`/project/${projectId}`)
  }

  const handleJoined = (projectId) => {
    setShowJoin(false)
    navigate(`/project/${projectId}`)
  }

  return (
    <div className="dashboard">
      <AppHeader />

      <main className="dashboard-main">
        <div className="dashboard-head">
          <div>
            <p className="dashboard-eyebrow">Your projects</p>
            <h1 className="dashboard-greeting">Hey {firstName}!</h1>
          </div>
          <div className="dashboard-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowJoin(true)}
            >
              Join with code
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowCreate(true)}
            >
              + New project
            </button>
          </div>
        </div>

        {loading && <p className="dashboard-status">Loading your projects…</p>}

        {error && (
          <p className="dashboard-status dashboard-status--error" role="alert">
            Something went wrong loading your projects. Try refreshing.
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <EmptyState
            onCreate={() => setShowCreate(true)}
            onJoin={() => setShowJoin(true)}
          />
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showJoin && (
        <JoinProjectModal
          myProjects={projects}
          onClose={() => setShowJoin(false)}
          onJoined={handleJoined}
        />
      )}
    </div>
  )
}

// Friendly first-run state so a brand-new account never sees a blank page.
function EmptyState({ onCreate, onJoin }) {
  return (
    <div className="empty-state">
      <p className="empty-emoji"><Icon name="sprout" size={48} /></p>
      <h2 className="empty-title">No projects yet</h2>
      <p className="empty-text">
        Start your first group project and share the join code with your team —
        or hop into a teammate's project with their code.
      </p>
      <div className="empty-actions">
        <button type="button" className="btn-ghost" onClick={onJoin}>
          Join with code
        </button>
        <button type="button" className="btn-primary" onClick={onCreate}>
          + Create your first project
        </button>
      </div>
    </div>
  )
}
