"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import '../entry.css'
import { auth } from '@/utils/firebase'
import { useAuth } from '@/context/AuthContext'
import { notifyUser } from '@/utils/pushManager'
import DevotionCardModal from '@/components/DevotionCardModal'
import { Pencil, BookOpen, Heart, Hand, Handshake, Download, Trash2, Share2 } from 'lucide-react'

export default function ReadingRecord() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [activePartnership, setActivePartnership] = useState(null)
  const [sharedNote, setSharedNote] = useState(false)

  const [verseText, setVerseText] = useState('')

  useEffect(() => {
    if (!entry) return
    if (entry.verse_text) { setVerseText(entry.verse_text); return }
    if (!entry.scripture_reference) return
    fetch(`https://bible-api.com/${encodeURIComponent(entry.scripture_reference)}`)
      .then(r => r.json())
      .then(json => { if (json.text) setVerseText(json.text.trim().replace(/\n/g, ' ')) })
      .catch(() => {})
  }, [entry])

  useEffect(() => {
    if (!user) return
    const fetchPartner = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch('/api/community/partners/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setActivePartnership(data)
        }
      } catch (err) {}
    }
    fetchPartner()
  }, [user])

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [draft, setDraft] = useState(null)

  // Unsaved changes protection in edit mode
  useEffect(() => {
    if (!isEditing || !draft) return
    const hasChanges = entry && (
      draft.scripture_reference !== (entry.scripture_reference ?? '') ||
      draft.hear !== (entry.hear ?? '') ||
      draft.heed !== (entry.heed ?? '') ||
      draft.hold !== (entry.hold ?? '') ||
      draft.help !== (entry.help ?? '') ||
      draft.lingering_thought !== (entry.lingering_thought ?? '')
    )
    const handler = (e) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    if (hasChanges) {
      window.addEventListener('beforeunload', handler)
    }
    return () => window.removeEventListener('beforeunload', handler)
  }, [isEditing, draft, entry])

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch(`/api/entries/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setEntry(data)
        setLoading(false)
      } catch (err) {
        setNotFound(true)
        setLoading(false)
      }
    }
    fetchEntry()
  }, [id])

  const startEditing = () => {
    setDraft({
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
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(draft)
      })
      if (!res.ok) throw new Error('Failed to update entry')
      
      setEntry((prev) => ({ ...prev, ...draft }))
      setIsEditing(false)
      setDraft(null)
      setSaving(false)
    } catch (error) {
      setSaveError(error.message)
      setSaving(false)
    }
  }

  const handleShareNote = async () => {
    if (!activePartnership || !entry.lingering_thought) return
    try {
      const senderName = user?.user_metadata?.full_name || 'Devotee'
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partnership_id: activePartnership.id,
          sender_name: senderName,
          type: 'note',
          content: entry.lingering_thought
        })
      })
      
      if (res.ok) {
        setSharedNote(true)
        setTimeout(() => setSharedNote(false), 3000)
        const partnerId = activePartnership.requester_id === user.id ? activePartnership.partner_id : activePartnership.requester_id
        if (partnerId) notifyUser(partnerId, 'note', 'Devotion note shared', `${senderName} shared a lingering thought with you`, '/community?tab=partners')
      }
    } catch (err) {
      console.error('Failed to share note')
    }
  }

  const handleShareWhatsApp = () => {
    if (!entry) return
    const text = `My devotion for today from ${entry.scripture_reference}:\n\n"${entry.lingering_thought || entry.hear || verseText}"\n\n- Shared via 4H Devotion Tracker`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      router.push('/history')
    } catch (err) {
      setDeleting(false)
      alert('Failed to delete entry')
    }
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
      {showCard && (
        <DevotionCardModal
          entry={entry}
          verseText={verseText}
          formattedDate={formattedDate}
          onClose={() => setShowCard(false)}
        />
      )}

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
              <button className="action-icon-btn flex items-center justify-center" onClick={startEditing} title="Edit entry"><Pencil size={18} /></button>
              <button className="user-profile-btn" style={{ background: 'none', border: 'none' }} onClick={() => router.push('/history')}>
                ← Back
              </button>
            </>
          )}
        </div>
      </div>

      <div className="scripture-hero">
        <div className="scripture-meta">
          <span className="reference-pill" style={{ background: 'var(--clr-cream)' }}>DAILY SCRIPTURE</span>
          {isEditing ? (
            <input
              type="text"
              value={draft.scripture_reference}
              onChange={set('scripture_reference')}
              placeholder="e.g. Psalm 23:1-3"
              className="verse-ref"
              style={{ background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--clr-border)', outline: 'none', fontWeight: 'inherit', letterSpacing: 'inherit', cursor: 'text', padding: '2px 0' }}
            />
          ) : (
            entry.scripture_reference && <span className="verse-ref">{entry.scripture_reference}</span>
          )}
        </div>

        {verseText && <p className="scripture-text" style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic', marginBottom: '16px' }}>{verseText}</p>}
      </div>

      <div className="quadrants-grid">
        {[
          { key: 'hear', icon: <BookOpen size={20} />, label: 'Head' },
          { key: 'heed', icon: <Heart size={20} />, label: 'Heart' },
          { key: 'hold', icon: <Hand size={20} />, label: 'Hand' },
          { key: 'help', icon: <Handshake size={20} />, label: 'Help' },
        ].map(({ key, icon, label }) => (
          <div key={key} className="quadrant-card">
            <div className="q-header">
              <span className="q-icon flex items-center justify-center">{icon}</span>
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
            <button className="btn-export flex items-center gap-2" onClick={() => setShowCard(true)} title="Download card">
              <Download size={16} /> Download Card
            </button>
          )}
          {!isEditing && (
            <button className="btn-export flex items-center gap-2" onClick={handleShareWhatsApp} title="Share to WhatsApp" style={{ background: '#25D366', color: 'white', borderColor: '#25D366' }}>
              <Share2 size={16} /> WhatsApp
            </button>
          )}
          {!isEditing && activePartnership && entry.lingering_thought && (
            <button className="btn-export flex items-center gap-2" onClick={handleShareNote} title="Share with partner" disabled={sharedNote}>
              <Handshake size={16} /> {sharedNote ? 'Shared!' : 'Share with Partner'}
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
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
