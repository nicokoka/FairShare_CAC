import './charts.css'

/*
 * Share-of-verified-work as a horizontal bar chart. Hand-built from plain
 * elements (no chart library) so it's part of the design system and prints
 * cleanly. The bars are sized by each member's share %, which is exactly the
 * number the report headline cards already show — the chart just makes the
 * relative sizes visible at a glance. The verified-work table below carries the
 * precise numbers, so this figure is labeled for screen readers and otherwise
 * decorative.
 *
 * @param {{ data: Array<{ uid: string, name: string, share: number }> }} props
 *   data is expected pre-sorted (highest share first).
 */
export default function ContributionBars({ data }) {
  if (!data || data.length === 0) return null

  return (
    <figure
      className="chart chart--bars"
      role="img"
      aria-label={
        'Share of verified work: ' +
        data.map((d) => `${d.name} ${Math.round(d.share)} percent`).join(', ')
      }
    >
      <ul className="cbars">
        {data.map((member) => (
          <li key={member.uid} className="cbar-row">
            <div className="cbar-head">
              <span className="cbar-name">{member.name}</span>
              <span className="cbar-val">{Math.round(member.share)}%</span>
            </div>
            <div className="cbar-track">
              <div
                className="cbar-fill"
                // Clamp so a rounding quirk can never overflow the track.
                style={{ width: `${Math.max(0, Math.min(100, member.share))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  )
}
