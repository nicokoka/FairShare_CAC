import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useProject } from '../../hooks/useProject.jsx'
import { useTasks } from '../../hooks/useTasks.jsx'
import { useReviews } from '../../hooks/useReviews.jsx'
import { contributionShares, ratingAverages, taskPoints } from '../../lib/fairness.js'
import { buildInsights } from '../../lib/insights.js'
import { isValidProofUrl } from '../../lib/tasks.js'
import { REVIEW_CRITERIA } from '../../lib/reviews.js'
import { downloadReportCsv } from '../../lib/exportReport.js'
import AppHeader from '../layout/AppHeader.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import Icon from '../ui/Icon.jsx'
import ContributionBars from './charts/ContributionBars.jsx'
import RatingChart from './charts/RatingChart.jsx'
import ReportSummary from './ReportSummary.jsx'
import './report.css'

/*
 * The fairness report (F11), reachable at /project/:id/report only once a
 * project has ended. It's the teacher-facing payoff: for each teammate it shows
 * the two headline numbers — their share of the *verified* task points, and
 * their average peer rating — deliberately side by side with NO single combined
 * score (a design decision from PLAN.md). Below that: a table of every verified
 * task and who signed off on it, per-criterion rating averages, anonymized
 * comments, and an honest callout of who didn't submit a review.
 *
 * All the arithmetic lives in the pure functions in src/lib/fairness.js; this
 * page only wires live data in and lays the results out for screen and print.
 */
export default function ReportPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { project, loading, notFound } = useProject(id)
  const isEnded = project?.status === 'ended'
  const { tasks, loading: tasksLoading } = useTasks(id)
  // Reviews are only readable once the project has ended — gate the read on it.
  const { reviews, loading: reviewsLoading } = useReviews(id, isEnded)

  if (loading || (isEnded && (tasksLoading || reviewsLoading))) {
    return <LoadingScreen />
  }

  if (notFound) {
    return (
      <ReportShell>
        <Gate icon="search" title="We can't find that project">
          It might have been deleted, or you're not a member of it.
        </Gate>
      </ReportShell>
    )
  }

  if (!isEnded) {
    return (
      <ReportShell>
        <Gate icon="hourglass" title="The report isn't ready yet">
          The fairness report opens once the creator ends “{project.name}”.
          <div className="report-gate-action">
            <Link to={`/project/${id}`} className="btn-primary">Back to the board</Link>
          </div>
        </Gate>
      </ReportShell>
    )
  }

  const members = project.members || {}
  const memberIds = project.memberIds || Object.keys(members)
  const nameFor = (uid) => members[uid]?.name || 'Teammate'

  const contrib = contributionShares(tasks, memberIds)
  const { byMember: ratingByMember, didNotSubmit } = ratingAverages(reviews, memberIds)

  // Sort people by verified contribution (highest first) for the headline cards.
  const ranked = [...memberIds].sort(
    (a, b) => contrib.byMember[b].share - contrib.byMember[a].share,
  )

  const verifiedTasks = tasks.filter((task) => task.status === 'verified')
  const unverifiedCount = tasks.length - verifiedTasks.length

  // The rule-based "smart summary" of the whole report (W2). The AI layer (W3)
  // only ever rephrases these same facts, so they're the source of truth.
  const insights = buildInsights({
    contrib,
    ratingByMember,
    didNotSubmit,
    tasks,
    memberIds,
    nameFor,
  })

  // Pre-shaped data for the hand-built charts.
  const contribChartData = ranked.map((uid) => ({
    uid,
    name: nameFor(uid),
    share: contrib.byMember[uid].share,
  }))
  const ratingChartData = ranked.map((uid) => ({
    uid,
    name: nameFor(uid),
    effort: ratingByMember[uid].perCriterion.effort,
    quality: ratingByMember[uid].perCriterion.quality,
    teamwork: ratingByMember[uid].perCriterion.teamwork,
  }))
  const hasAnyRating = ratingChartData.some(
    (member) => member.effort !== null || member.quality !== null || member.teamwork !== null,
  )

  return (
    <ReportShell>
      <div className="report">
        <header className="report-top">
          <div className="report-top-text">
            <p className="report-eyebrow">Fairness report</p>
            <h1 className="report-title">{project.name}</h1>
            <p className="report-dates">
              {formatDate(project.createdAt)} – {formatDate(project.endedAt)} ·{' '}
              {memberIds.length} {memberIds.length === 1 ? 'member' : 'members'} ·{' '}
              {contrib.totalPoints} verified {contrib.totalPoints === 1 ? 'point' : 'points'}
            </p>
          </div>
          <div className="report-actions">
            <button
              type="button"
              className="btn-ghost report-export"
              onClick={() => downloadReportCsv({ project, ranked, contrib, ratingByMember, nameFor })}
            >
              <Icon name="link" size={18} className="icon-inline" /> Download CSV
            </button>
            <button type="button" className="btn-primary report-print" onClick={() => window.print()}>
              <Icon name="print" size={18} className="icon-inline" /> Print / Save as PDF
            </button>
          </div>
        </header>

        <p className="report-note">
          Two numbers per person, side by side — share of verified work and average
          peer rating. There's no single combined score on purpose; both tell part
          of the story.
        </p>

        <ReportSummary insights={insights} project={project} contrib={contrib} nameFor={nameFor} ranked={ranked} ratingByMember={ratingByMember} />

        <section className="report-cards" aria-label="Per-member summary">
          {ranked.map((uid) => (
            <MemberCard
              key={uid}
              name={nameFor(uid)}
              member={members[uid]}
              contribution={contrib.byMember[uid]}
              rating={ratingByMember[uid]}
              didNotReview={didNotSubmit.includes(uid)}
            />
          ))}
        </section>

        {contrib.totalPoints > 0 && (
          <section className="report-section" aria-label="Contribution chart">
            <h2 className="report-h2">How the verified work split</h2>
            <ContributionBars data={contribChartData} />
          </section>
        )}

        <section className="report-section" aria-label="Verified tasks">
          <h2 className="report-h2">Verified work</h2>
          {verifiedTasks.length === 0 ? (
            <p className="report-empty">No tasks were verified in this project.</p>
          ) : (
            <VerifiedTasksTable tasks={verifiedTasks} nameFor={nameFor} />
          )}
          {unverifiedCount > 0 && (
            <p className="report-subtle">
              {unverifiedCount} {unverifiedCount === 1 ? 'task was' : 'tasks were'} never
              verified, so {unverifiedCount === 1 ? "it doesn't" : "they don't"} count
              toward anyone's contribution.
            </p>
          )}
        </section>

        <section className="report-section" aria-label="Rating detail">
          <h2 className="report-h2">Peer ratings, by criterion</h2>
          {hasAnyRating && <RatingChart data={ratingChartData} />}
          <RatingBreakdown memberIds={ranked} nameFor={nameFor} ratingByMember={ratingByMember} />
          <CommentList memberIds={ranked} nameFor={nameFor} reviews={reviews} />
          {didNotSubmit.length > 0 && (
            <p className="report-callout" role="note">
              <Icon name="hand" size={18} className="icon-inline" /> Didn't submit a peer review:{' '}
              <strong>{didNotSubmit.map(nameFor).join(', ')}</strong>. Their input
              isn't counted in the averages above.
            </p>
          )}
        </section>
      </div>
    </ReportShell>
  )
}

// One person's headline stats: verified contribution % and average peer rating.
function MemberCard({ name, member, contribution, rating, didNotReview }) {
  const share = Math.round(contribution.share)
  const overall = rating.overall
  return (
    <article className="member-card">
      <div className="member-card-head">
        <Avatar member={member} name={name} />
        <span className="member-card-name">{name}</span>
      </div>
      <div className="member-stats">
        <div className="member-stat">
          <span className="member-stat-value">{share}%</span>
          <span className="member-stat-label">of verified work</span>
          <span className="member-stat-detail">
            {contribution.verifiedTasks} {contribution.verifiedTasks === 1 ? 'task' : 'tasks'} ·{' '}
            {contribution.points} {contribution.points === 1 ? 'pt' : 'pts'}
          </span>
        </div>
        <div className="member-stat">
          <span className="member-stat-value">
            {overall === null ? '—' : overall.toFixed(1)}
            {overall !== null && <span className="member-stat-of"> / 5</span>}
          </span>
          <span className="member-stat-label">avg peer rating</span>
          <span className="member-stat-detail">
            {rating.reviewCount === 0
              ? 'no ratings yet'
              : `from ${rating.reviewCount} ${rating.reviewCount === 1 ? 'teammate' : 'teammates'}`}
          </span>
        </div>
      </div>
      {didNotReview && (
        <p className="member-card-flag">Didn't submit their own review</p>
      )}
    </article>
  )
}

// Every verified task, its size/points, assignee, proof link, and who verified.
function VerifiedTasksTable({ tasks, nameFor }) {
  return (
    <div className="report-table-wrap">
    <table className="report-table">
      <thead>
        <tr>
          <th scope="col">Task</th>
          <th scope="col">Size</th>
          <th scope="col" className="num">Pts</th>
          <th scope="col">Done by</th>
          <th scope="col">Proof</th>
          <th scope="col">Verified by</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.size}</td>
            <td className="num">{taskPoints(task.size)}</td>
            <td>{task.assignee ? nameFor(task.assignee) : '—'}</td>
            <td>
              {isValidProofUrl(task.proofUrl) ? (
                <a href={task.proofUrl} target="_blank" rel="noopener noreferrer">
                  View proof
                </a>
              ) : (
                '—'
              )}
            </td>
            <td>{task.verifiedBy ? nameFor(task.verifiedBy) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

// Per-criterion averages (Effort / Quality / Teamwork) for each teammate.
function RatingBreakdown({ memberIds, nameFor, ratingByMember }) {
  return (
    <div className="report-table-wrap">
    <table className="report-table">
      <thead>
        <tr>
          <th scope="col">Teammate</th>
          {REVIEW_CRITERIA.map((c) => (
            <th key={c.key} scope="col" className="num">{c.label}</th>
          ))}
          <th scope="col" className="num">Overall</th>
        </tr>
      </thead>
      <tbody>
        {memberIds.map((uid) => {
          const r = ratingByMember[uid]
          return (
            <tr key={uid}>
              <td>{nameFor(uid)}</td>
              {REVIEW_CRITERIA.map((c) => (
                <td key={c.key} className="num">{formatScore(r.perCriterion[c.key])}</td>
              ))}
              <td className="num strong">{formatScore(r.overall)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
    </div>
  )
}

// Anonymized comments: shown grouped by who they're ABOUT, never who wrote them.
function CommentList({ memberIds, nameFor, reviews }) {
  const groups = memberIds
    .map((uid) => ({
      uid,
      comments: reviews
        .map((review) => review.ratings?.[uid]?.comment)
        .filter((comment) => comment && comment.trim()),
    }))
    .filter((group) => group.comments.length > 0)

  if (groups.length === 0) return null

  return (
    <div className="report-comments">
      <h3 className="report-h3">Comments</h3>
      {groups.map((group) => (
        <div key={group.uid} className="report-comment-group">
          <p className="report-comment-about">About {nameFor(group.uid)}</p>
          <ul>
            {group.comments.map((comment, index) => (
              <li key={index} className="report-comment">“{comment}”</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// A rating average or an em dash when nobody rated that cell.
function formatScore(value) {
  return value === null ? '—' : value.toFixed(1)
}

// Firestore Timestamp → friendly date, or an em dash if it hasn't resolved.
function formatDate(timestamp) {
  const date = timestamp?.toDate?.()
  if (!date) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Avatar({ member, name }) {
  if (member?.photoURL) {
    return (
      <img
        className="member-avatar"
        src={member.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="40"
        height="40"
      />
    )
  }
  const initial = (name || '?').trim()[0].toUpperCase()
  return <span className="member-avatar member-avatar--fallback">{initial}</span>
}

// Small helper for the gate states (not found / not ended yet).
function Gate({ icon, title, children }) {
  return (
    <div className="report-gate">
      <p className="report-gate-emoji"><Icon name={icon} size={48} /></p>
      <h1 className="report-gate-title">{title}</h1>
      <p className="report-gate-text">{children}</p>
    </div>
  )
}

// Shared page frame so every state sits under the app header.
function ReportShell({ children }) {
  return (
    <div className="report-page">
      <AppHeader />
      <main className="report-main">{children}</main>
    </div>
  )
}
