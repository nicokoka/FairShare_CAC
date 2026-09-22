import './loading-screen.css'

/*
 * Full-screen loading state shown while Firebase restores the auth session.
 * Uses the brand palette so even the wait feels like part of the product.
 */
export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="loading-label">Loading FairShare…</span>
    </div>
  )
}
