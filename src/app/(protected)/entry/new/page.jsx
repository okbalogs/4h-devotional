"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../entry.css'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser } from '@/utils/dailyVerse'
import { queueEntry } from '@/utils/offlineStorage'

export default function NewEntry() {
  const router = useRouter()
  const { user } = useAuth()

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  const [title, setTitle] = useState('')
  const [scriptureRef, setScriptureRef] = useState('')
  const [verseText, setVerseText] = useState('')

  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      if (v?.verse_reference) setScriptureRef(v.verse_reference)
      if (v?.verse_text) setVerseText(v.verse_text)
    })
  }, [user])
  const [hear, setHear] = useState('')
  const [heed, setHeed] = useState('')
  const [hold, setHold] = useState('')
  const [help, setHelp] = useState('')
  const [lingeringThought, setLingeringThought] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedOffline, setSavedOffline] = useState(false)

  const entryPayload = () => ({
    user_id: user.id,
    title,
    scripture_reference: scriptureRef,
    hear,
    heed,
    hold,
    help,
    lingering_thought: lingeringThought,
  })

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    // Offline — queue locally and show confirmation
    if (!navigator.onLine) {
      queueEntry(entryPayload())
      setSaving(false)
      setSavedOffline(true)
      return
    }

    try {
      const { data, error } = await supabase
        .from('entries')
        .insert(entryPayload())
        .select('id')
        .single()

      if (error) throw error
      router.push(`/entry/${data.id}`)
    } catch (err) {
      // Network error mid-request — queue offline
      if (!navigator.onLine || err.message?.includes('fetch')) {
        queueEntry(entryPayload())
        setSaving(false)
        setSavedOffline(true)
      } else {
        setError(err.message)
        setSaving(false)
      }
    }
  }

  return (
    <div className="entry-page">
      <div className="entry-top-bar">
        <div className="entry-top-left">
          NEW ENTRY <span style={{margin: '0 6px'}}>•</span> <span className="date">{currentDate}</span>
        </div>
        <div className="entry-top-right">
          {error && <span style={{ color: '#c0392b', fontSize: '0.85rem', marginRight: '12px' }}>{error}</span>}
          {savedOffline && (
            <span style={{ color: '#7a6555', fontSize: '0.85rem', marginRight: '12px' }}>
              Saved offline — will sync when connected.
            </span>
          )}
          {savedOffline ? (
            <button
              className="btn-primary"
              style={{ padding: '10px 24px', borderRadius: '8px' }}
              onClick={() => router.push('/today')}
            >
              Done
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ padding: '10px 24px', borderRadius: '8px' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          )}
        </div>
      </div>

      <div className="scripture-hero">
        <div className="scripture-meta">
          <span className="reference-pill" style={{ background: '#fdf6ec' }}>DAILY SCRIPTURE</span>
          <input
            type="text"
            value={scriptureRef}
            onChange={(e) => setScriptureRef(e.target.value)}
            placeholder="e.g. Psalm 23:1-3"
            className="verse-ref"
            style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 'inherit', letterSpacing: 'inherit', cursor: 'text' }}
          />
        </div>

        {verseText ? (
          <p className="scripture-text">{verseText}</p>
        ) : (
          <p className="scripture-text" style={{ color: '#bbb', fontStyle: 'italic' }}>Loading verse...</p>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title..."
          style={{ marginTop: '16px', background: 'transparent', border: 'none', borderBottom: '1px solid #e8ddd4', outline: 'none', width: '100%', fontSize: '1rem', color: '#555', padding: '6px 0', fontFamily: 'inherit' }}
        />
      </div>

      <div className="quadrants-grid">
        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">⚙️</span>
            <h3 className="q-title">Head</h3>
          </div>
          <textarea
            className="q-textarea"
            placeholder="What does God say? Identify the main truths..."
            value={hear}
            onChange={(e) => setHear(e.target.value)}
          />
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">🤎</span>
            <h3 className="q-title">Heart</h3>
          </div>
          <textarea
            className="q-textarea"
            placeholder="Let the word penetrate your heart. Reflect on emotions..."
            value={heed}
            onChange={(e) => setHeed(e.target.value)}
          />
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">✋</span>
            <h3 className="q-title">Hand</h3>
          </div>
          <textarea
            className="q-textarea"
            placeholder="What action steps will you take to apply the word..."
            value={hold}
            onChange={(e) => setHold(e.target.value)}
          />
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">🤲</span>
            <h3 className="q-title">Help</h3>
          </div>
          <textarea
            className="q-textarea"
            placeholder="How can you extend this truth to others..."
            value={help}
            onChange={(e) => setHelp(e.target.value)}
          />
        </div>
      </div>

      <div className="scenic-banner">
        <input
          type="text"
          placeholder="Type a core lingering thought here..."
          value={lingeringThought}
          onChange={(e) => setLingeringThought(e.target.value)}
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.6rem', color: '#666', background: 'rgba(253, 246, 236, 0.8)', border: 'none', borderRadius: '8px', padding: '12px 24px', minWidth: '50%', outline: 'none', textAlign: 'center' }}
        />
      </div>
    </div>
  )
}
