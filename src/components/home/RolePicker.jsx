import { useState } from 'react'
import AppHeader from '../layout/AppHeader.jsx'
import Icon from '../ui/Icon.jsx'
import './home.css'

/*
 * One-time role picker, shown on /home until the user has chosen how they use
 * FairShare. The choice is stored on their profile and switchable later from the
 * header, so this is a soft, reversible decision — not a gate.
 *
 * @param {{ onPick: (role: 'student'|'teacher') => void }} props
 */
export default function RolePicker({ onPick }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pick = async (role) => {
    setError('')
    setBusy(true)
    try {
      await onPick(role)
      // On success the profile snapshot updates and this screen is replaced.
    } catch {
      setError("We couldn't save your choice. Please check your connection and try again.")
      setBusy(false)
    }
  }

  return (
    <div className="dashboard">
      <AppHeader />
      <main className="dashboard-main">
        <div className="rolepick">
          <p className="dashboard-eyebrow">Welcome to FairShare</p>
          <h1 className="dashboard-greeting">How will you use it?</h1>
          <p className="rolepick-sub">You can switch anytime from the top bar.</p>

          <div className="rolepick-grid">
            <button
              type="button"
              className="rolepick-card"
              onClick={() => pick('student')}
              disabled={busy}
            >
              <Icon name="team" size={52} />
              <h2 className="rolepick-h">I'm a student</h2>
              <p className="rolepick-p">
                Join projects, split the work fairly, and build a record of how you collaborate.
              </p>
            </button>

            <button
              type="button"
              className="rolepick-card"
              onClick={() => pick('teacher')}
              disabled={busy}
            >
              <Icon name="chart" size={52} />
              <h2 className="rolepick-h">I'm a teacher</h2>
              <p className="rolepick-p">
                Create a class and see every group's fairness at a glance, in one dashboard.
              </p>
            </button>
          </div>

          {error && (
            <p className="rolepick-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
