import { Link } from 'react-router-dom'
import './placeholder.css'

/*
 * A friendly "coming soon" screen reused by every route that isn't built yet.
 * Keeps the app navigable during F0 so each route can be clicked through.
 */
export default function PlaceholderPage({ emoji, title, text, feature }) {
  return (
    <div className="placeholder">
      <div className="placeholder-card">
        <span className="placeholder-emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
        <span className="placeholder-tag">{feature}</span>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-text">{text}</p>
        <Link className="placeholder-back" to="/">
          ← Back home
        </Link>
      </div>
    </div>
  )
}
