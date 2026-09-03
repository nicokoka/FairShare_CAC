import './contribution-card.css'

/*
 * A tiny preview of the real product: a project's contribution breakdown.
 * Purely decorative on the landing page (aria-hidden on its container), but it
 * shows exactly what FairShare produces — verified share per teammate.
 */
const TEAMMATES = [
  { name: 'Maya', pct: 34, tone: 'grape', tasks: 5 },
  { name: 'Leo', pct: 33, tone: 'coral', tasks: 5 },
  { name: 'Priya', pct: 33, tone: 'mint', tasks: 4 },
]

export default function ContributionCard() {
  return (
    <div className="contrib-card">
      <div className="contrib-head">
        <span className="contrib-kicker">Verified share</span>
        <span className="contrib-project">Bio poster project</span>
      </div>

      <ul className="contrib-list">
        {TEAMMATES.map((mate) => (
          <li className="contrib-row" key={mate.name}>
            <span className={`contrib-avatar contrib-avatar--${mate.tone}`}>
              {mate.name[0]}
            </span>
            <span className="contrib-name">{mate.name}</span>
            <span className="contrib-track">
              <span
                className={`contrib-fill contrib-fill--${mate.tone}`}
                style={{ width: `${mate.pct}%` }}
              />
            </span>
            <span className="contrib-pct">{mate.pct}%</span>
          </li>
        ))}
      </ul>

      <div className="contrib-foot">
        <span className="contrib-check">✓ 14 tasks verified by teammates</span>
      </div>
    </div>
  )
}
