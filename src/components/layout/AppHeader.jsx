import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Wordmark from '../landing/Wordmark.jsx'
import './app-header.css'

/*
 * The top bar for signed-in pages: brand on the left, the current user's photo +
 * name and a sign-out button on the right. Reads everything from useAuth().
 */
export default function AppHeader() {
  const { user, signOut } = useAuth()

  return (
    <header className="app-header">
      <Link to="/dashboard" className="app-header-brand" aria-label="FairShare dashboard">
        <Wordmark />
      </Link>

      {user && (
        <div className="user-chip">
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
