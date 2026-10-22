import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCharter } from '../../hooks/useCharter.jsx'
import { saveCharter, MAX_ITEMS, MAX_ITEM_LENGTH } from '../../lib/charter.js'
import Icon from '../ui/Icon.jsx'

/*
 * The team charter card: a short, shared list of expectations the team agrees on
 * up front. Any member can edit it while the project is active; once the project
 * ends it's read-only (and hidden entirely if the team never wrote one).
 *
 * @param {{ projectId: string, locked: boolean }} props
 */
export default function CharterCard({ projectId, locked }) {
  const { user } = useAuth()
  const { charter, loading } = useCharter(projectId)
  const [items, setItems] = useState([])
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Seed the editable list from the stored charter, unless the user has unsaved
  // edits in flight (don't clobber their typing on a snapshot).
  useEffect(() => {
    if (charter && !dirty) setItems(charter.items || [])
  }, [charter, dirty])

  if (loading) return null
  // Nothing to show on an ended project that never had a charter.
  if (locked && items.length === 0) return null

  const addItem = () => {
    const value = draft.trim()
    if (!value || items.length >= MAX_ITEMS) return
    setItems((prev) => [...prev, value])
    setDraft('')
    setDirty(true)
  }

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCharter(projectId, user, items)
      setDirty(false)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1600)
    } catch {
      // Best-effort; the live snapshot will reconcile if it actually went through.
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="charter" aria-label="Team charter">
      <div className="charter-head">
        <h2 className="charter-title">
          <Icon name="flag" size={20} className="icon-inline" /> Team charter
        </h2>
        {!locked && <span className="charter-hint">What does this team agree to?</span>}
      </div>

      {items.length > 0 ? (
        <ul className="charter-list">
          {items.map((item, index) => (
            <li key={index} className="charter-item">
              <span className="charter-bullet" aria-hidden="true">✓</span>
              <span className="charter-text">{item}</span>
              {!locked && (
                <button
                  type="button"
                  className="charter-remove"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove "${item}"`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="charter-empty">No agreements yet — add a few the whole team will keep.</p>
      )}

      {!locked && (
        <div className="charter-editor">
          <div className="charter-add">
            <input
              className="charter-input"
              type="text"
              value={draft}
              maxLength={MAX_ITEM_LENGTH}
              placeholder="e.g. Reply to messages within a day"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addItem()
                }
              }}
            />
            <button
              type="button"
              className="btn-ghost charter-add-btn"
              onClick={addItem}
              disabled={!draft.trim() || items.length >= MAX_ITEMS}
            >
              Add
            </button>
          </div>
          <div className="charter-actions">
            <button
              type="button"
              className="btn-primary charter-save"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? 'Saving…' : justSaved ? 'Saved!' : 'Save charter'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
