import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import { ROLES } from '../../lib/users.js'
import Wordmark from '../landing/Wordmark.jsx'
import './app-header.css'

/*
 * The top bar for signed-in pages: brand + nav on the left, the user's photo,
 * a role switch, and sign-out on the right. Nav and role come from the profile
 * (useUserProfile); everything degrades gracefully if the profile isn't loaded.
 */
export default function AppHeader() {
  const { user, signOut } = useAuth()
  const { role, isTeacher, setRole } = useUserProfile()

  return (
    <header className="app-header">
      <div className="app-header-left">
        <Link to="/home" className="app-header-brand" aria-label="FairShare home">
          <Wordmark />
        </Link>
        {user && (
          <nav className="app-nav" aria-label="Main">
            <Link to="/home" className="app-nav-link">Home</Link>
            <Link to="/me" className="app-nav-link">Profile</Link>
          </nav>
        )}
      </div>

      {user && (
        <div className="user-chip">
          {role && (
            <button
              type="button"
              className="role-switch"
              onClick={() => setRole(isTeacher ? ROLES.STUDENT : ROLES.TEACHER).catch(() => {})}
              title="Switch role"
            >
              {isTeacher ? 'Teacher' : 'Student'}
            </button>
          )}
          <Avatar user={user} />
          <span className="user-name">{user.displayName || 'You'}</span>
          <button type="button" className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}

// Google usually gives a photoURL; if it's missing we fall back to the person's
// first initial on a colored circle so the header never looks broken.
function Avatar({ user }) {
  if (user.photoURL) {
    return (
      <img
        className="user-avatar"
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="36"
        height="36"
      />
    )
  }
  const initial = (user.displayName || user.email || '?').trim()[0].toUpperCase()
  return <span className="user-avatar user-avatar--fallback">{initial}</span>
}
