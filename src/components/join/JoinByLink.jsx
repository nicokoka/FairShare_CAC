import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { joinByCode } from '../../lib/projects.js'
import { CODE_LENGTH } from '../../lib/joinCode.js'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import Icon from '../ui/Icon.jsx'

/*
 * The /join/:code landing page — the target of a shared invite link or a scanned
 * QR code. It is deliberately NOT wrapped in ProtectedRoute: a brand-new teammate
 * clicking the link hasn't signed in yet, and bouncing them to the landing page
 * would lose the code. Instead this page handles auth itself:
 *
 *   not signed in → "you're invited" + Sign in with Google (then it continues)
 *   signed in     → look up the code, join if needed, and redirect to the board
 *
 * The actual lookup/join/membership logic lives in joinByCode (src/lib/projects.js)
 * so this component is just the flow and the friendly states.
 */
export default function JoinByLink() {
  const { code } = useParams()
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()

  // Normalize exactly like the manual join input does.
  const normalized = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH)

  const [phase, setPhase] = useState('idle') // idle | working | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (loading || !user || phase !== 'idle') return

    if (normalized.length !== CODE_LENGTH) {
      setPhase('error')
      setMessage("That invite link doesn't look right. Ask your teammate to send it again.")
      return
    }

    let cancelled = false
    setPhase('working')
    joinByCode(user, normalized)
      .then((result) => {
        if (cancelled) return
        if (result.status === 'joined' || result.status === 'already-member') {
          navigate(`/project/${result.projectId}`, { replace: true })
          return
        }
        setPhase('error')
        setMessage(
          result.status === 'not-found'
            ? "We couldn't find a project for this invite link."
            : result.status === 'ended'
              ? 'This project has already ended, so it isn’t accepting new members.'
              : "We couldn't join you to this project. Please try again.",
        )
      })
      .catch(() => {
        if (cancelled) return
        setPhase('error')
        setMessage('Something went wrong while joining. Please try again.')
      })

    return () => {
      cancelled = true
    }
  }, [loading, user, normalized, phase, navigate])

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <Shell>
        <p className="project-missing-emoji"><Icon name="ticket" size={48} /></p>
        <h1 className="project-missing-title">You're invited to a project</h1>
        <p className="project-missing-text">
          Sign in with Google to join and start splitting the work fairly.
        </p>
        <button type="button" className="btn-primary" onClick={() => signIn().catch(() => {})}>
          Sign in with Google
        </button>
      </Shell>
    )
  }

  if (phase === 'error') {
    return (
      <Shell>
        <p className="project-missing-emoji"><Icon name="search" size={48} /></p>
        <h1 className="project-missing-title">We couldn't join you</h1>
        <p className="project-missing-text">{message}</p>
        <Link to="/dashboard" className="btn-primary">Go to my projects</Link>
      </Shell>
    )
  }

  // Working: looking up and joining. Brief, so a spinner is enough.
  return <LoadingScreen />
}

function Shell({ children }) {
  return (
    <div className="project-page">
      <AppHeader />
      <main className="project-missing">{children}</main>
    </div>
  )
}
