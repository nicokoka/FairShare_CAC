import { useState } from 'react'
import { inviteUrl } from '../../lib/joinCode.js'
import Icon from '../ui/Icon.jsx'
import QrCode from './QrCode.jsx'

// How long the "Copied!" confirmation stays visible after clicking.
const COPIED_FEEDBACK_MS = 1600

/*
 * The "invite teammates" panel on an active project. Three ways to get someone in:
 * scan the QR code, tap Share (native share sheet on phones), or copy the link.
 * All three point at /join/:code, which signs the teammate in and joins them in
 * one step. The join code itself still lives in the header for anyone typing it
 * by hand — this panel is the faster path.
 *
 * @param {{ code: string, projectName: string }} props
 */
export default function InvitePanel({ code, projectName }) {
  const [copied, setCopied] = useState(false)
  // window.location.origin is correct both locally and on the deployed site.
  const url = inviteUrl(code, window.location.origin)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    } catch {
      // Clipboard can be blocked; the link is on screen to copy by hand.
    }
  }

  const handleShare = async () => {
    if (!canShare) {
      handleCopy()
      return
    }
    try {
      await navigator.share({
        title: `Join ${projectName} on FairShare`,
        text: 'Join our group project and split the work fairly:',
        url,
      })
    } catch {
      // The user dismissed the share sheet — nothing to do.
    }
  }

  return (
    <section className="invite" aria-label="Invite teammates">
      <QrCode value={url} />
      <div className="invite-body">
        <h2 className="invite-title">Invite your team</h2>
        <p className="invite-sub">Scan the code, or share the link — it joins them in one tap.</p>
        <div className="invite-link-row">
          <input className="invite-link" value={url} readOnly aria-label="Invite link" />
        </div>
        <div className="invite-actions">
          <button type="button" className="btn-primary" onClick={handleShare}>
            <Icon name="link" size={18} className="icon-inline" /> {canShare ? 'Share invite' : 'Copy link'}
          </button>
          {canShare && (
            <button type="button" className="btn-ghost" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}
          {!canShare && copied && <span className="invite-copied">Copied!</span>}
        </div>
      </div>
    </section>
  )
}
