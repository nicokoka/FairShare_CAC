import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useClasses } from '../../hooks/useClasses.jsx'
import AppHeader from '../layout/AppHeader.jsx'
import CreateClassModal from '../class/CreateClassModal.jsx'
import Icon from '../ui/Icon.jsx'
import './home.css'

/*
 * The teacher's home: a live list of their classes with the code to share, plus
 * a button to create a new one. Each class links to its dashboard, where every
 * attached project's fairness snapshot shows up.
 */
export default function TeacherHome() {
  const { user } = useAuth()
  const { classes, loading } = useClasses(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const firstName = (user?.displayName || 'there').split(' ')[0]

  return (
    <div className="dashboard">
      <AppHeader />
      <main className="dashboard-main">
        <div className="dashboard-head">
          <div>
            <p className="dashboard-eyebrow">Teacher</p>
            <h1 className="dashboard-greeting">Hey {firstName}!</h1>
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
            + New class
          </button>
        </div>

        {loading && <p className="dashboard-status">Loading your classes…</p>}

        {!loading && classes.length === 0 && (
          <div className="empty-state">
            <p className="empty-emoji"><Icon name="team" size={48} /></p>
            <h2 className="empty-title">No classes yet</h2>
            <p className="empty-text">
              Create a class, share its code with students, and watch each group's
              fairness report land here.
            </p>
            <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
              + Create your first class
            </button>
          </div>
        )}

        {!loading && classes.length > 0 && (
          <div className="class-grid">
            {classes.map((klass) => (
              <Link key={klass.id} to={`/class/${klass.id}`} className="class-card">
                <h2 className="class-card-name">{klass.name}</h2>
                <p className="class-card-code">
                  Class code <strong>{klass.classCode}</strong>
                </p>
                <span className="class-card-go">Open dashboard →</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false)
            navigate(`/class/${id}`)
          }}
        />
      )}
    </div>
  )
}
