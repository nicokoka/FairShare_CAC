import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Wordmark from './Wordmark.jsx'
import ContributionCard from './ContributionCard.jsx'
import './landing.css'

/*
 * Landing page (route "/"). The "Sign in with Google" button opens the Google
 * popup via useAuth(). Once a user is signed in (either after the popup or on a
 * refresh where the session was restored) we redirect to the dashboard, so the
 * landing page is only ever seen while signed out. The footer "peek" links let
 * us click through the placeholder routes during development.
 */
export default function Landing() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  // Send signed-in users to their dashboard instead of showing the marketing page.
  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [loading, user, navigate])

  const handleSignIn = async () => {
    setError('')
    setSigningIn(true)
    try {
      await signIn()
      // On success, onAuthStateChanged updates `user` and the effect redirects.
    } catch (err) {
      // A user closing the popup is not a real error — stay quiet for that one.
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError("We couldn't sign you in. Please try again.")
      }
      setSigningIn(false)
    }
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <Wordmark />
        <a className="ghost-btn" href="#how">
          How it works
        </a>
      </header>

      <main className="hero">
        <section className="hero-copy">
          <p className="eyebrow">Group projects, minus the freeloaders</p>
          <h1 className="hero-title">
            Everyone sees <span className="hero-mark">who did the work.</span>
          </h1>
          <p className="hero-tagline">
            FairShare turns a messy group project into a live board where tasks
            get claimed, proof gets checked by teammates, and the final report
            shows each person's real, verified share.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="google-btn"
              onClick={handleSignIn}
              disabled={signingIn}
            >
              <GoogleGlyph />
              {signingIn ? 'Opening Google…' : 'Sign in with Google'}
            </button>
            <span className="hero-hint">Free for your whole class</span>
          </div>
          {error && (
            <p className="hero-error" role="alert">
              {error}
            </p>
          )}
        </section>

        <div className="hero-visual" aria-hidden="true">
          <ContributionCard />
        </div>
      </main>

      <section id="how" className="how">
        <h2 className="how-title">Fair in three steps</h2>
        <ol className="steps">
          <li className="step">
            <span className="step-badge step-badge--claim">1</span>
            <h3 className="step-head">Claim &amp; do</h3>
            <p className="step-text">
              Start a project, share the join code, and pick up tasks from a
              board the whole team watches update live.
            </p>
          </li>
          <li className="step">
            <span className="step-badge step-badge--verify">2</span>
            <h3 className="step-head">Prove &amp; verify</h3>
            <p className="step-text">
              Finished work needs a proof link and a teammate's approval before
              it counts — no more taking credit for nothing.
            </p>
          </li>
          <li className="step">
            <span className="step-badge step-badge--report">3</span>
            <h3 className="step-head">Rate &amp; report</h3>
            <p className="step-text">
              At the end everyone rates each other privately, and FairShare
              prints a clean report for your teacher.
            </p>
          </li>
        </ol>
      </section>

      <footer className="landing-foot">
        <p className="foot-note">
          Built for the Congressional App Challenge.
        </p>
        <nav className="peek" aria-label="Preview the screens">
          <span className="peek-label">Peek ahead:</span>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/project/demo">Board</Link>
          <Link to="/project/demo/review">Review</Link>
          <Link to="/project/demo/report">Report</Link>
        </nav>
      </footer>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg className="google-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.24 1.5-1.66 4.4-5.4 4.4-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.8 3.8 1.48l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.98 2.5 2.9 6.58 2.9 11.6S6.98 20.7 12 20.7c5.5 0 9.14-3.86 9.14-9.3 0-.62-.07-1.1-.16-1.58H12z"
      />
    </svg>
  )
}
