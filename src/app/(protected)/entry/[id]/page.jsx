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

  return (
    <div className="entry-page">
      <div className="entry-top-bar">
        <div className="entry-top-left">
          READING RECORD <span style={{ margin: '0 6px' }}>•</span> <span className="date">{formattedDate}</span>
        </div>
        <div className="entry-top-right">
          <button className="user-profile-btn" style={{ background: 'none', border: 'none' }} onClick={() => router.push('/history')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="scripture-hero">
        <div className="scripture-meta">
          <span className="reference-pill" style={{ background: '#fdf6ec' }}>DAILY SCRIPTURE</span>
          {entry.scripture_reference && (
            <span className="verse-ref">{entry.scripture_reference}</span>
          )}
        </div>
        <h1 className="scripture-text">{entry.title || 'Untitled Entry'}</h1>
      </div>

      <div className="quadrants-grid">
        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">⚙️</span>
            <h3 className="q-title">Hear (Head)</h3>
          </div>
          <p className="q-text">{entry.hear || <em style={{ color: '#aaa' }}>Nothing written.</em>}</p>
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">🤎</span>
            <h3 className="q-title">Heed (Heart)</h3>
          </div>
          <p className="q-text">{entry.heed || <em style={{ color: '#aaa' }}>Nothing written.</em>}</p>
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">✋</span>
            <h3 className="q-title">Hold (Hands)</h3>
          </div>
          <p className="q-text">{entry.hold || <em style={{ color: '#aaa' }}>Nothing written.</em>}</p>
        </div>

        <div className="quadrant-card">
          <div className="q-header">
            <span className="q-icon">🤲</span>
            <h3 className="q-title">Help (Others)</h3>
          </div>
          <p className="q-text">{entry.help || <em style={{ color: '#aaa' }}>Nothing written.</em>}</p>
        </div>
      </div>

      {entry.lingering_thought && (
        <div className="scenic-banner">
          <p>&ldquo;{entry.lingering_thought}&rdquo;</p>
        </div>
      )}

      <div className="entry-actions">
        <div className="entry-actions-left" />
        <div className="entry-actions-right">
          <button
            className="action-icon-btn"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete entry"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
