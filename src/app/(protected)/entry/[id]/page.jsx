"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import '../entry.css'
import { supabase } from '@/utils/supabase'

export default function ReadingRecord() {
  const { id } = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setEntry(data)
        }
        setLoading(false)
      })
  }, [id])

  const startEditing = () => {
    setDraft({
      title: entry.title ?? '',
      scripture_reference: entry.scripture_reference ?? '',
      hear: entry.hear ?? '',
      heed: entry.heed ?? '',
      hold: entry.hold ?? '',
      help: entry.help ?? '',
      lingering_thought: entry.lingering_thought ?? '',
    })
    setSaveError(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setDraft(null)
    setSaveError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('entries')
      .update(draft)
      .eq('id', id)
    if (error) {
      setSaveError(error.message)
      setSaving(false)
    } else {
      setEntry((prev) => ({ ...prev, ...draft }))
      setIsEditing(false)
      setDraft(null)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('entries').delete().eq('id', id)
    router.push('/history')
  }

  if (loading) {
    return <div className="entry-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>Loading...</div>
  }

  if (notFound) {
    return (
      <div className="entry-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <p style={{ color: '#666' }}>Entry not found.</p>
        <button className="btn-primary" style={{ borderRadius: '8px', padding: '10px 24px' }} onClick={() => router.push('/history')}>
          Back to History
        </button>
      </div>
    )
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  return (
    <div className="entry-page">
      <div className="entry-top-bar">
        <div className="entry-top-left">
          {isEditing ? 'EDITING' : 'READING RECORD'}
          <span style={{ margin: '0 6px' }}>•</span>
          <span className="date">{formattedDate}</span>
        </div>
        <div className="entry-top-right">
          {isEditing ? (
            <>
              {saveError && <span style={{ color: '#c0392b', fontSize: '0.82rem' }}>{saveError}</span>}
              <button className="action-icon-btn" onClick={cancelEditing}>Cancel</button>
              <button
                className="btn-primary"
                style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.88rem' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button className="action-icon-btn" onClick={startEditing} title="Edit entry">✏️</button>
              <button className="user-profile-btn" style={{ background: 'none', border: 'none' }} onClick={() => router.push('/history')}>
                ← Back
              </button>
            </>
          )}
        </div>
      </div>

      <div className="scripture-hero">
        <div className="scripture-meta">
          <span className="reference-pill" style={{ background: '#fdf6ec' }}>DAILY SCRIPTURE</span>
          {isEditing ? (
            <input
              type="text"
              value={draft.scripture_reference}
              onChange={set('scripture_reference')}
              placeholder="e.g. Psalm 23:1-3"
              className="verse-ref"
              style={{ background: 'transparent', border: 'none', borderBottom: '1.5px solid #e8d8c4', outline: 'none', fontWeight: 'inherit', letterSpacing: 'inherit', cursor: 'text', padding: '2px 0' }}
            />
          ) : (
            entry.scripture_reference && <span className="verse-ref">{entry.scripture_reference}</span>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={draft.title}
            onChange={set('title')}
            placeholder="Entry title…"
            style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', lineHeight: 1.15, color: '#333', background: 'transparent', border: 'none', borderBottom: '1.5px solid #e8d8c4', outline: 'none', width: '100%', padding: '4px 0', marginBottom: '40px', fontWeight: 400 }}
          />
        ) : (
          <h1 className="scripture-text">{entry.title || 'Untitled Entry'}</h1>
        )}
      </div>

      <div className="quadrants-grid">
        {[
          { key: 'hear', icon: '⚙️', label: 'Hear (Head)' },
          { key: 'heed', icon: '🤎', label: 'Heed (Heart)' },
          { key: 'hold', icon: '✋', label: 'Hold (Hands)' },
          { key: 'help', icon: '🤲', label: 'Help (Others)' },
        ].map(({ key, icon, label }) => (
          <div key={key} className="quadrant-card">
            <div className="q-header">
              <span className="q-icon">{icon}</span>
              <h3 className="q-title">{label}</h3>
            </div>
            {isEditing ? (
              <textarea
                className="q-textarea"
                value={draft[key]}
                onChange={set(key)}
                placeholder={`Write your ${label.split(' ')[0].toLowerCase()} reflection…`}
              />
            ) : (
              <p className="q-text">
                {entry[key] || <em style={{ color: '#aaa' }}>Nothing written.</em>}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="scenic-banner">
        {isEditing ? (
          <input
            type="text"
            value={draft.lingering_thought}
            onChange={set('lingering_thought')}
            placeholder="A lingering thought…"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.6rem', color: '#666', background: 'rgba(253, 246, 236, 0.8)', border: 'none', borderRadius: '8px', padding: '12px 24px', minWidth: '50%', outline: 'none', textAlign: 'center' }}
          />
        ) : (
          entry.lingering_thought && <p>&ldquo;{entry.lingering_thought}&rdquo;</p>
        )}
      </div>

      <div className="entry-actions">
        <div className="entry-actions-left">
          {!isEditing && (
            <button className="btn-export" onClick={() => window.print()} title="Save as PDF">
              <span>⬇</span> Export PDF
            </button>
          )}
        </div>
        <div className="entry-actions-right">
          {!isEditing && (
            <button
              className="action-icon-btn"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete entry"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
