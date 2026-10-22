import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDocs } from 'firebase/firestore'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useClasses, useClassProjects } from '../../hooks/useClasses.jsx'
import { tasksCollection } from '../../lib/tasks.js'
import { reviewsCollection } from '../../lib/reviews.js'
import { checkinsCollection } from '../../lib/checkins.js'
import { buildSnapshot } from '../../lib/snapshot.js'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import Icon from '../ui/Icon.jsx'
import './class.css'

// Human labels for the snapshot flags.
const FLAG_LABEL = {
  imbalanced: 'Work looks lopsided',
  'low-pulse': 'A teammate flagged unfairness',
  'no-verified-work': 'No verified work yet',
}

/*
 * A teacher's class dashboard (/class/:id): every project attached to the class,
 * each with a one-glance fairness snapshot and a link into the full report. The
 * teacher-read security rules let the owning teacher read these projects and
 * their tasks/reviews/check-ins; everyone else is denied.
 */
export default function ClassDashboard() {
  const { id } = useParams()
  const { user } = useAuth()
  const { classes, loading: classesLoading } = useClasses(user?.uid)
  const { projects, loading: projectsLoading } = useClassProjects(id)

  const klass = classes.find((c) => c.id === id)

  if (classesLoading) return <LoadingScreen />

  // Only the owning teacher has this class in their list; anyone else sees a gate.
  if (!klass) {
    return (
      <div className="class-page">
        <AppHeader />
        <main className="class-missing">
          <p className="class-missing-emoji"><Icon name="search" size={48} /></p>
          <h1>Class not found</h1>
          <p>This class doesn't exist, or it isn't one of yours.</p>
          <Link to="/home" className="btn-primary">Back home</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="class-page">
      <AppHeader />
      <main className="class-main">
        <header className="class-head">
          <div>
            <p className="class-eyebrow">Class dashboard</p>
            <h1 className="class-name">{klass.name}</h1>
          </div>
          <div className="class-code-chip">
            Class code <strong>{klass.classCode}</strong>
          </div>
        </header>

        {projectsLoading && <p className="dashboard-status">Loading projects…</p>}

        {!projectsLoading && projects.length === 0 && (
          <div className="empty-state">
            <p className="empty-emoji"><Icon name="sprout" size={48} /></p>
            <h2 className="empty-title">No projects yet</h2>
            <p className="empty-text">
              Share the class code <strong>{klass.classCode}</strong> — when a student
              creates a project with it, the team shows up here.
            </p>
          </div>
        )}

        {!projectsLoading && projects.length > 0 && (
          <div className="class-projects">
            {projects.map((project) => (
              <ClassProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// One project row with its fairness snapshot. Fetches the project's tasks,
// reviews and check-ins once, then runs the pure buildSnapshot over them.
function ClassProjectCard({ project }) {
  const [snap, setSnap] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [taskSnap, reviewSnap, checkinSnap] = await Promise.all([
          getDocs(tasksCollection(project.id)),
          getDocs(reviewsCollection(project.id)),
          getDocs(checkinsCollection(project.id)),
        ])
        const tasks = taskSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const reviews = reviewSnap.docs.map((d) => ({ reviewerUid: d.id, ...d.data() }))
        const checkins = checkinSnap.docs.map((d) => ({ uid: d.id, ...d.data() }))
        const memberIds = project.memberIds || Object.keys(project.members || {})
        if (active) setSnap(buildSnapshot({ tasks, reviews, checkins, memberIds }))
      } catch {
        if (active) setSnap(null)
      }
    })()
    return () => {
      active = false
    }
  }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isEnded = project.status === 'ended'

  return (
    <article className="class-project">
      <div className="class-project-head">
        <h2 className="class-project-name">{project.name}</h2>
        <span className={`class-status class-status--${isEnded ? 'ended' : 'active'}`}>
          {isEnded ? 'Ended' : 'Active'}
        </span>
      </div>

      {snap ? (
        <>
          <div className="class-metrics">
            <Metric value={snap.memberCount} label="members" />
            <Metric value={snap.verifiedPoints} label="verified pts" />
            <Metric
              value={snap.verifiedPoints > 0 ? `${Math.round(snap.spread)}%` : '—'}
              label="work gap"
            />
            <Metric
              value={snap.avgRating === null ? '—' : snap.avgRating.toFixed(1)}
              label="avg rating"
            />
            <Metric
              value={snap.pulse.avgFeeling === null ? '—' : snap.pulse.avgFeeling.toFixed(1)}
              label="pulse"
            />
          </div>

          {snap.flags.length > 0 && (
            <ul className="class-flags">
              {snap.flags.map((flag) => (
                <li key={flag} className="class-flag">
                  <Icon name="flag" size={14} className="icon-inline" /> {FLAG_LABEL[flag] || flag}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="class-project-loading">Reading fairness…</p>
      )}

      <div className="class-project-actions">
        {isEnded ? (
          <Link to={`/project/${project.id}/report`} className="btn-primary">
            <Icon name="chart" size={16} className="icon-inline" /> View report
          </Link>
        ) : (
          <span className="class-project-note">Report opens once the team ends the project.</span>
        )}
      </div>
    </article>
  )
}

function Metric({ value, label }) {
  return (
    <div className="class-metric">
      <span className="class-metric-value">{value}</span>
      <span className="class-metric-label">{label}</span>
    </div>
  )
}
