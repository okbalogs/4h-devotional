'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { Megaphone } from 'lucide-react'

const ADMIN_EMAILS = ['olaolubalogs@gmail.com']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NoticesTab({ user }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase())

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'notices'), orderBy('created_at', 'desc'), limit(30))
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.warn("Notices listener error:", err)
      setError("Unable to load notices. Please check permissions.")
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const postNotice = async () => {
    if (!title.trim() || !content.trim()) return
    setPosting(true)
    setError('')
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/community/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setTitle('')
      setContent('')
      setShowCreate(false)
    } catch (err) {
      setError('Could not post notice: ' + err.message)
    } finally {
      setPosting(false)
    }
  }

  const deleteNotice = async (noticeId) => {
    if (!confirm('Delete this notice?')) return
    try {
      const token = await user.getIdToken()
      await fetch(`/api/community/notices?id=${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--clr-primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Admin
            </span>
            <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>You can post and delete notices</span>
          </div>
          <button className="today-begin-btn" style={{ padding: '8px 18px', fontSize: '0.82rem', marginTop: 0 }}
            onClick={() => setShowCreate(v => !v)}>
            {showCreate ? 'Cancel' : '+ New Notice'}
          </button>
        </div>
      )}

      {showCreate && isAdmin && (
        <div className="prayer-post-form" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="input-soft"
            style={{ marginBottom: '12px' }}
            placeholder="Notice Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="prayer-textarea"
            placeholder="Notice Content…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
          />
          <div className="prayer-post-actions" style={{ justifyContent: 'flex-end' }}>
            <button
              className="today-begin-btn"
              style={{ padding: '10px 22px', fontSize: '0.88rem', marginTop: 0 }}
              onClick={postNotice}
              disabled={posting || !title.trim() || !content.trim()}
            >
              {posting ? 'Posting…' : 'Post Notice'}
            </button>
          </div>
          {error && <p className="community-error">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="community-loading">
          {[1, 2].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-block" style={{ height: '16px', width: '40%', marginBottom: '12px' }} />
              <div className="skeleton-block" style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
              <div className="skeleton-block" style={{ height: '14px', width: '80%' }} />
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="community-empty">
          <span className="community-empty-icon flex items-center justify-center"><Megaphone size={48} /></span>
          No fellowship announcements right now.
        </div>
      ) : (
        <div className="prayer-feed">
          {notices.map(notice => (
            <div key={notice.id} className="prayer-card" style={{ background: 'var(--clr-card)', borderLeft: '4px solid var(--clr-primary)' }}>
              <div className="prayer-card-head" style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333', margin: 0 }}>{notice.title}</h3>
                <span className="prayer-time">{timeAgo(notice.created_at)}</span>
              </div>
              <p className="prayer-content" style={{ whiteSpace: 'pre-wrap' }}>{notice.content}</p>
              {isAdmin && (
                <div className="prayer-card-foot" style={{ justifyContent: 'flex-end' }}>
                  <button className="prayer-delete-btn" onClick={() => deleteNotice(notice.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
