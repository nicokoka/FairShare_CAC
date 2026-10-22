import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useProfileStats } from '../../hooks/useProfileStats.jsx'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import Icon from '../ui/Icon.jsx'
import './profile.css'

/*
 * Personal Fairness Profile (/me): a lasting record of how this person has
 * collaborated across every FairShare project they've finished. The numbers come
 * from the same pure functions the report uses (via useProfileStats), so a
 * teammate's profile and a project's report can never disagree.
 */
export default function ProfilePage() {
  const { user } = useAuth()
  const { rows, summary, loading } = useProfileStats(user?.uid)

  if (!user || loading) return <LoadingScreen />

  const firstName = (user.displayName || 'there').split(' ')[0]

  return (
    <div className="profile-page">
      <AppHeader />
      <main className="profile-main">
        <header className="profile-head">
          <Avatar user={user} />
          <div>
            <p className="profile-eyebrow">Fairness profile</p>
            <h1 className="profile-name">{user.displayName || firstName}</h1>
            <p className="profile-sub">Your verified contribution across finished projects.</p>
          </div>
        </header>

        {summary.projectsCount === 0 ? (
          <div className="profile-empty">
            <p className="empty-emoji"><Icon name="sprout" size={48} /></p>
            <h2 className="empty-title">No finished projects yet</h2>
            <p className="empty-text">
              Once a project you're in ends, its verified contribution and peer
              rating show up here — building your record over time.
            </p>
            <Link to="/home" className="btn-primary">Back home</Link>
          </div>
        ) : (
          <>
            <section className="profile-stats" aria-label="Lifetime stats">
              <StatCard
                value={summary.projectsCount}
                label={summary.projectsCount === 1 ? 'project finished' : 'projects finished'}
                tone="grape"
              />
              <StatCard value={summary.totalPoints} label="verified points earned" tone="coral" />
              <StatCard
                value={summary.avgShare === null ? '—' : `${Math.round(summary.avgShare)}%`}
                label="avg share of work"
                tone="mint"
              />
              <StatCard
                value={summary.avgRating === null ? '—' : summary.avgRating.toFixed(1)}
                suffix={summary.avgRating === null ? '' : ' / 5'}
                label="avg peer rating"
                tone="sun"
              />
            </section>

            <section className="profile-section" aria-label="Per-project history">
              <h2 className="profile-h2">Project history</h2>
              <ul className="profile-history">
                {summary.timeline
                  .slice()
                  .reverse()
                  .map((row) => (
                    <li key={row.projectId} className="profile-row">
                      <div className="profile-row-head">
                        <Link to={`/project/${row.projectId}/report`} className="profile-row-name">
                          {row.name || 'Untitled project'}
                        </Link>
                        <span className="profile-row-rating">
                          {row.myRating === null ? 'no rating' : `${row.myRating.toFixed(1)} / 5`}
                        </span>
                      </div>
                      <div className="profile-row-bar">
                        <div
                          className="profile-row-fill"
                          style={{ width: `${Math.max(0, Math.min(100, row.myShare))}%` }}
                        />
                      </div>
                      <p className="profile-row-detail">
                        {Math.round(row.myShare)}% of verified work · {row.myPoints}{' '}
                        {row.myPoints === 1 ? 'pt' : 'pts'}
                      </p>
                    </li>
                  ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ value, suffix = '', label, tone }) {
  return (
    <article className={`profile-stat profile-stat--${tone}`}>
      <span className="profile-stat-value">
        {value}
        {suffix && <span className="profile-stat-suffix">{suffix}</span>}
      </span>
      <span className="profile-stat-label">{label}</span>
    </article>
  )
}

function Avatar({ user }) {
  if (user.photoURL) {
    return (
      <img
        className="profile-avatar"
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="64"
        height="64"
      />
    )
  }
  const initial = (user.displayName || user.email || '?').trim()[0].toUpperCase()
  return <span className="profile-avatar profile-avatar--fallback">{initial}</span>
}
