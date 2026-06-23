'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, orderBy, limit, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { Megaphone } from 'lucide-react'

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const checkAdminStatus = useCallback(async () => {
    if (!user) return
    const docRef = doc(db, 'profiles', user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setIsAdmin(docSnap.data().is_admin || false)
    }
  }, [user])

  useEffect(() => {
    checkAdminStatus()
    setLoading(true)
    const q = query(collection(db, 'notices'), orderBy('created_at', 'desc'), limit(30))
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [checkAdminStatus])

  const postNotice = async () => {
    if (!title.trim() || !content.trim()) return
    setPosting(true)
    setError('')
    try {
      await addDoc(collection(db, 'notices'), {
        author_id: user.uid,
        title: title.trim(),
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      setTitle('')
      setContent('')
      setShowCreate(false)
    } catch (err) {
      setError('Could not post notice. You might not have permission.')
    } finally {
      setPosting(false)
    }
  }

  const deleteNotice = async (noticeId) => {
    if (!confirm('Delete this notice?')) return
    try {
      await deleteDoc(doc(db, 'notices', noticeId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {isAdmin && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="today-begin-btn" style={{ padding: '10px 20px', fontSize: '0.85rem', marginTop: 0 }}
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
