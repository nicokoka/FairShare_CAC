/*
 * The team roster for a project: one row per member with their avatar, name, and
 * a "Creator" badge on whoever started the project. Purely presentational —
 * `members` is the project's members map and `createdBy` is the creator's uid.
 * The creator sorts first, then everyone else by join time.
 */
export default function MembersList({ members, createdBy }) {
  const entries = Object.entries(members || {})
  entries.sort(([uidA, a], [uidB, b]) => {
    if (uidA === createdBy) return -1
    if (uidB === createdBy) return 1
    const aMs = a.joinedAt?.toMillis?.() ?? 0
    const bMs = b.joinedAt?.toMillis?.() ?? 0
    return aMs - bMs
  })

  return (
    <section className="members" aria-labelledby="members-heading">
      <h2 id="members-heading" className="members-heading">
        Team ({entries.length})
      </h2>
      <ul className="members-list">
        {entries.map(([uid, member]) => (
          <li key={uid} className="member-row">
            <MemberAvatar member={member} />
            <span className="member-name">{member.name || 'Teammate'}</span>
            {uid === createdBy && <span className="member-badge">Creator</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}

function MemberAvatar({ member }) {
  if (member.photoURL) {
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
  const initial = (member.name || '?').trim()[0].toUpperCase()
  return <span className="member-avatar member-avatar--fallback">{initial}</span>
}
