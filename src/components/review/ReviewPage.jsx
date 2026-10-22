import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useProject } from '../../hooks/useProject.jsx'
import { useMyReview } from '../../hooks/useMyReview.jsx'
import {
  REVIEW_CRITERIA,
  isReviewComplete,
  submitReview,
} from '../../lib/reviews.js'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import StarRating from './StarRating.jsx'
import Icon from '../ui/Icon.jsx'
import './review.css'

/*
 * Peer review form (F9), reachable at /project/:id/review only once a project
 * has ended. You rate every teammate (never yourself) 1–5 stars on Effort,
 * Quality, and Teamwork, plus an optional comment. Submitting is one-shot: the
 * rules only allow creating your review, so once it's in, this page flips to a
 * read-only summary of what you gave. Reviews are private — nobody sees your raw
 * ratings here; the report (F11) only ever shows averages.
 */
export default function ReviewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { project, loading, notFound } = useProject(id)
  const { review, loading: reviewLoading } = useMyReview(id, user?.uid)

  if (loading || reviewLoading) return <LoadingScreen />

  if (notFound) {
    return (
      <ReviewShell>
        <div className="review-gate">
          <p className="review-gate-emoji"><Icon name="search" size={48} /></p>
          <h1 className="review-gate-title">We can't find that project</h1>
          <p className="review-gate-text">
            It might have been deleted, or you're not a member of it.
          </p>
          <Link to="/dashboard" className="btn-primary">Back to my projects</Link>
        </div>
      </ReviewShell>
    )
  }

  // Reviews only make sense after the project has ended.
  if (project.status !== 'ended') {
    return (
      <ReviewShell>
        <div className="review-gate">
          <p className="review-gate-emoji"><Icon name="hourglass" size={48} /></p>
          <h1 className="review-gate-title">Reviews aren't open yet</h1>
          <p className="review-gate-text">
            Peer reviews open once the project creator ends “{project.name}”.
          </p>
          <Link to={`/project/${id}`} className="btn-primary">Back to the board</Link>
        </div>
      </ReviewShell>
    )
  }

  const teammates = Object.entries(project.members || {}).filter(
    ([uid]) => uid !== user.uid,
  )

  return (
    <ReviewShell>
      <header className="review-header">
        <Link to={`/project/${id}`} className="project-back">← Back to project</Link>
        <h1 className="review-title">Rate your teammates</h1>
        <p className="review-sub">
          Private and honest — only averages ever show up on the report.
        </p>
      </header>

      {review ? (
        <ReviewSummary review={review} teammates={teammates} />
      ) : teammates.length === 0 ? (
        <div className="review-gate">
          <p className="review-gate-emoji"><Icon name="team" size={48} /></p>
          <h1 className="review-gate-title">No teammates to rate</h1>
          <p className="review-gate-text">
            You're the only member of this project, so there's nothing to review.
          </p>
          <Link to={`/project/${id}`} className="btn-primary">Back to the board</Link>
        </div>
      ) : (
        <ReviewForm projectId={id} user={user} teammates={teammates} />
      )}
    </ReviewShell>
  )
}

// The editable form: a card per teammate with three star rows + a comment.
function ReviewForm({ projectId, user, teammates }) {
  const [ratings, setRatings] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const revieweeUids = teammates.map(([uid]) => uid)
  const complete = isReviewComplete(ratings, revieweeUids)

  const setStar = (uid, key, value) => {
    setRatings((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], [key]: value },
    }))
  }

  const setComment = (uid, value) => {
    setRatings((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], comment: value },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!complete || submitting) return
    setError('')
    setSubmitting(true)
    try {
      await submitReview(projectId, user, ratings, revieweeUids)
      // On success useMyReview flips this page to the read-only summary.
    } catch {
      setError("We couldn't submit your review. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      {teammates.map(([uid, member]) => (
        <article key={uid} className="review-card">
          <div className="review-person">
            <Avatar member={member} />
            <span className="review-person-name">{member.name || 'Teammate'}</span>
          </div>

          <div className="review-criteria">
            {REVIEW_CRITERIA.map((criterion) => (
              <StarRating
                key={criterion.key}
                name={`${uid}-${criterion.key}`}
                label={criterion.label}
                hint={criterion.hint}
                value={ratings[uid]?.[criterion.key] || 0}
                onChange={(value) => setStar(uid, criterion.key, value)}
              />
            ))}
          </div>

          <label className="review-comment-label" htmlFor={`comment-${uid}`}>
            Comment <span className="review-optional">(optional)</span>
          </label>
          <textarea
            id={`comment-${uid}`}
            className="review-comment"
            rows={2}
            value={ratings[uid]?.comment || ''}
            onChange={(event) => setComment(uid, event.target.value)}
            placeholder={`Anything ${member.name || 'they'} should know?`}
          />
        </article>
      ))}

      {error && (
        <p className="review-error" role="alert">{error}</p>
      )}

      <div className="review-submit-row">
        <button type="submit" className="btn-primary" disabled={!complete || submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
        {!complete && (
          <p className="review-hint">Give every teammate all three stars to submit.</p>
        )}
      </div>
    </form>
  )
}

// Read-only recap shown after submitting — this is your one review, locked in.
function ReviewSummary({ review, teammates }) {
  const ratings = review.ratings || {}
  return (
    <div className="review-summary">
      <div className="review-done-banner" role="status">
        <p className="review-done-title">
          <span className="review-done-check" aria-hidden="true">✓</span> You've submitted your review
        </p>
        <p className="review-done-sub">Thanks! Here's what you rated — it can't be changed.</p>
      </div>

      {teammates.map(([uid, member]) => {
        const given = ratings[uid] || {}
        return (
          <article key={uid} className="review-card review-card--done">
            <div className="review-person">
              <Avatar member={member} />
              <span className="review-person-name">{member.name || 'Teammate'}</span>
            </div>

            <ul className="review-recap">
              {REVIEW_CRITERIA.map((criterion) => (
                <li key={criterion.key} className="review-recap-row">
                  <span className="review-recap-label">{criterion.label}</span>
                  <Stars value={given[criterion.key] || 0} />
                </li>
              ))}
            </ul>

            {given.comment ? (
              <p className="review-recap-comment">“{given.comment}”</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

// Static filled/empty stars for the read-only recap.
function Stars({ value }) {
  return (
    <span className="review-stars-static" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= value ? 'on' : 'off'}>
          ★
        </span>
      ))}
    </span>
  )
}

function Avatar({ member }) {
  if (member.photoURL) {
    return (
      <img
        className="review-avatar"
        src={member.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="40"
        height="40"
      />
    )
  }
  const initial = (member.name || '?').trim()[0].toUpperCase()
  return <span className="review-avatar review-avatar--fallback">{initial}</span>
}

// Shared page frame so every state (gate, form, summary) sits under the header.
function ReviewShell({ children }) {
  return (
    <div className="review-page">
      <AppHeader />
      <main className="review-main">{children}</main>
    </div>
  )
}
