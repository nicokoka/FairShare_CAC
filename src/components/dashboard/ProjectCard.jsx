import { Link } from 'react-router-dom'

/*
 * One project on the dashboard: name, status pill, and a stack of member
 * avatars. The whole card is a link into the project. Purely presentational —
 * all data comes from props.
 */
export default function ProjectCard({ project }) {
  const members = Object.values(project.members || {})
  const isEnded = project.status === 'ended'

  return (
    <Link to={`/project/${project.id}`} className="project-card">
      <div className="project-card-top">
        <span className={`status-pill ${isEnded ? 'status-pill--ended' : 'status-pill--active'}`}>
          {isEnded ? 'Ended' : 'Active'}
        </span>
        <span className="project-card-count">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <h3 className="project-card-name">{project.name}</h3>

      <div className="avatar-stack" aria-hidden="true">
        {members.slice(0, 5).map((member, index) => (
          <MemberAvatar key={index} member={member} />
        ))}
        {members.length > 5 && (
          <span className="avatar-more">+{members.length - 5}</span>
        )}
      </div>
    </Link>
  )
}

function MemberAvatar({ member }) {
  if (member.photoURL) {
    return (
      <img
        className="stack-avatar"
        src={member.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        width="34"
        height="34"
      />
    )
  }
  const initial = (member.name || '?').trim()[0].toUpperCase()
  return <span className="stack-avatar stack-avatar--fallback">{initial}</span>
}
