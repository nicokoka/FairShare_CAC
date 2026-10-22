import { REVIEW_CRITERIA } from '../../../lib/reviews.js'
import './charts.css'

/*
 * Peer ratings as a grouped bar chart: one cluster per teammate, three bars
 * (Effort / Quality / Teamwork) each scaled against the 1–5 star range. Hand-laid
 * out as inline SVG so it scales to any width, uses the design-system colors, and
 * prints. The exact averages live in the table below; this figure is the shape of
 * the data, labeled for screen readers.
 *
 * A criterion with no ratings (null) draws no bar — honest emptiness, not a 0.
 *
 * @param {{ data: Array<{ uid: string, name: string, effort: number|null, quality: number|null, teamwork: number|null }> }} props
 */

const MAX_RATING = 5
// SVG user-space layout (the viewBox scales to the container width).
const BAR_W = 16
const BAR_GAP = 4
const GROUP_GAP = 26
const PAD_X = 10
const PLOT_TOP = 12
const PLOT_H = 130
const LABEL_H = 26
const AXIS_W = 16

// Each criterion gets a stable color from the token palette.
const CRITERION_COLORS = {
  effort: 'var(--grape-500)',
  quality: 'var(--coral-500)',
  teamwork: 'var(--mint-500)',
}

export default function RatingChart({ data }) {
  if (!data || data.length === 0) return null

  const groupInnerW = REVIEW_CRITERIA.length * BAR_W + (REVIEW_CRITERIA.length - 1) * BAR_GAP
  const groupStride = groupInnerW + GROUP_GAP
  const plotLeft = PAD_X + AXIS_W
  const width = plotLeft + data.length * groupStride - GROUP_GAP + PAD_X
  const baseline = PLOT_TOP + PLOT_H
  const height = baseline + LABEL_H

  const ariaLabel =
    'Peer ratings out of 5 — ' +
    data
      .map((member) => {
        const parts = REVIEW_CRITERIA.map((criterion) => {
          const value = member[criterion.key]
          return `${criterion.label} ${value === null ? 'not rated' : value.toFixed(1)}`
        })
        return `${member.name}: ${parts.join(', ')}`
      })
      .join('; ')

  return (
    <figure className="chart chart--rating">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="rating-svg"
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Horizontal gridlines + y labels at each whole star 0..5. */}
        {Array.from({ length: MAX_RATING + 1 }, (_, star) => {
          const y = baseline - (star / MAX_RATING) * PLOT_H
          return (
            <g key={star}>
              <line
                x1={plotLeft}
                y1={y}
                x2={width - PAD_X}
                y2={y}
                className="rating-grid"
              />
              <text x={PAD_X + AXIS_W - 4} y={y + 3} className="rating-axis-label">
                {star}
              </text>
            </g>
          )
        })}

        {data.map((member, index) => {
          const groupX = plotLeft + index * groupStride
          return (
            <g key={member.uid}>
              {REVIEW_CRITERIA.map((criterion, ci) => {
                const value = member[criterion.key]
                if (value === null || value === undefined) return null
                const barH = (value / MAX_RATING) * PLOT_H
                const x = groupX + ci * (BAR_W + BAR_GAP)
                return (
                  <rect
                    key={criterion.key}
                    x={x}
                    y={baseline - barH}
                    width={BAR_W}
                    height={barH}
                    rx="3"
                    fill={CRITERION_COLORS[criterion.key]}
                  >
                    <title>{`${member.name} · ${criterion.label}: ${value.toFixed(1)}/5`}</title>
                  </rect>
                )
              })}
              <text
                x={groupX + groupInnerW / 2}
                y={baseline + 16}
                className="rating-name"
                textAnchor="middle"
              >
                {member.name}
              </text>
            </g>
          )
        })}
      </svg>

      <ul className="chart-legend" aria-hidden="true">
        {REVIEW_CRITERIA.map((criterion) => (
          <li key={criterion.key} className="chart-legend-item">
            <span
              className="chart-legend-swatch"
              style={{ background: CRITERION_COLORS[criterion.key] }}
            />
            {criterion.label}
          </li>
        ))}
      </ul>
    </figure>
  )
}
