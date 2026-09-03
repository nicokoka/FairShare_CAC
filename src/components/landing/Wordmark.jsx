import './wordmark.css'

/*
 * The FairShare signature: the name is torn along a dotted perforation line,
 * the way you'd tear something to split it evenly. "Fair" | "Share" —
 * the divide itself is the brand idea.
 */
export default function Wordmark() {
  return (
    <span className="wordmark" aria-label="FairShare">
      <span className="wordmark-fair">Fair</span>
      <span className="wordmark-perf" aria-hidden="true" />
      <span className="wordmark-share">Share</span>
    </span>
  )
}
