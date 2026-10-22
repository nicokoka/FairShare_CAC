import { useState } from 'react'
import { MAX_RATING } from '../../lib/reviews.js'

const STAR_VALUES = Array.from({ length: MAX_RATING }, (_, index) => index + 1)

/*
 * One 1–5 star input for a single criterion (F9). Built on native radio buttons
 * so keyboard users get arrow-key selection and focus for free; the visible
 * stars fill on hover (mouse) or from the chosen value. The radios are visually
 * hidden but remain the real, labelled controls behind each star.
 *
 * @param {string} name     unique radio-group name (reviewee uid + criterion)
 * @param {string} label    criterion name, e.g. "Effort"
 * @param {string} [hint]   short helper line under the label
 * @param {number} value    currently selected rating (0 = none yet)
 * @param {(n: number) => void} onChange
 */
export default function StarRating({ name, label, hint, value, onChange }) {
  const [hover, setHover] = useState(0)
  const active = hover || value || 0

  return (
    <fieldset className="star-rating">
      <legend className="star-legend">
        <span className="star-legend-label">{label}</span>
        {hint && <span className="star-legend-hint">{hint}</span>}
      </legend>

      <div className="star-row" onMouseLeave={() => setHover(0)}>
        {STAR_VALUES.map((n) => {
          const id = `${name}-${n}`
          const filled = n <= active
          return (
            <label
              key={n}
              htmlFor={id}
              className={`star${filled ? ' star--on' : ''}`}
              onMouseEnter={() => setHover(n)}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="star-input"
              />
              <span aria-hidden="true">★</span>
              <span className="sr-only">
                {n} star{n > 1 ? 's' : ''}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
