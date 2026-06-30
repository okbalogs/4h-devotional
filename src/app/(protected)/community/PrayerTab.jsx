import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, orderBy, limit, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore'
import LeaderboardWidget from './LeaderboardWidget'
import { notifyUser } from '@/utils/pushManager'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function nameInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PrayerTab({ user }) {
  const [requests, setRequests] = useState([])
  const [prayerCounts, setPrayerCounts] = useState({})
  const [myPrayers, setMyPrayers] = useState(new Set())
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userName = user?.user_metadata?.full_name || 'Devotee'

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'prayer_requests'), orderBy('created_at', 'desc'), limit(30))
    const unsub = onSnapshot(q, async (snapshot) => {
      const reqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setRequests(reqs)
      
      if (!reqs.length) { setLoading(false); return }
      
      const ids = reqs.map(r => r.id)
      
      const q2 = query(collection(db, 'prayer_responses'), where('request_id', 'in', ids))
      onSnapshot(q2, (snap2) => {
         const counts = {}
         const mine = new Set()
         snap2.docs.forEach(doc => {
            const data = doc.data()
            counts[data.request_id] = (counts[data.request_id] || 0) + 1
            if (data.user_id === user.uid) mine.add(data.request_id)
         })
         setPrayerCounts(counts)
         setMyPrayers(mine)
         setLoading(false)
      }, (err) => {
         console.warn("Prayer responses listener error:", err)
      })
    }, (err) => {
      console.warn("Prayer requests listener error:", err)
      setError("Unable to load prayer requests. Please check permissions.")
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  const postPrayer = async () => {
    if (!content.trim()) return
    setPosting(true)
    setError('')
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/community/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'create', content: content.trim(), is_anonymous: isAnonymous })
      });
      if (!res.ok) throw new Error('Could not post')
      setContent('')
      setIsAnonymous(false)
    } catch (err) {
      setError('Could not post prayer request.')
    } finally {
      setPosting(false)
    }
  }

  const togglePray = async (requestId) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'toggle_pray', request_id: requestId })
      });
      // the real-time listener will update the state!
    } catch (err) {
      console.error(err)
    }
  }

  const deletePrayer = async (requestId) => {
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/prayer?id=${requestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Real-time updates UI automatically
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <LeaderboardWidget />
      {/* Post form */}
      <div className="prayer-post-form" style={{ marginBottom: '20px' }}>
        <textarea
          className="prayer-textarea"
          placeholder="Share a prayer request with the community…"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
        />
        <div className="prayer-post-actions">
          <label className="anon-check">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
            Post anonymously
          </label>
          <button
            className="today-begin-btn"
            style={{ padding: '10px 22px', fontSize: '0.88rem', marginTop: 0 }}
            onClick={postPrayer}
            disabled={posting || !content.trim()}
          >
            {posting ? 'Posting…' : 'Post Request'}
          </button>
        </div>
        {error && <p className="community-error">{error}</p>}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="community-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-block" style={{ height: '12px', width: '120px' }} />
              <div className="skeleton-block" style={{ height: '14px', width: '80%' }} />
              <div className="skeleton-block" style={{ height: '14px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="community-empty">
          <span className="community-empty-icon flex items-center justify-center"><Heart size={48} /></span>
          No prayer requests yet. Be the first to share.
        </div>
      ) : (
        <div className="prayer-feed">
          {requests.map(req => {
            const prayed = myPrayers.has(req.id)
            const count = prayerCounts[req.id] || 0
            const showName = !req.is_anonymous
            const displayName = showName ? req.poster_name || 'Devotee' : 'Anonymous'
            return (
              <div key={req.id} className="prayer-card">
                <div className="prayer-card-head">
                  <div className={`prayer-avatar ${req.is_anonymous ? 'prayer-avatar--anon' : ''} flex items-center justify-center`}>
                    {req.is_anonymous ? <Heart size={16} /> : nameInitials(displayName)}
                  </div>
                  <div className="prayer-card-meta">
                    <span className="prayer-poster">{displayName}</span>
                    <span className="prayer-time">{timeAgo(req.created_at)}</span>
                  </div>
                </div>
                <p className="prayer-content">{req.content}</p>
                <div className="prayer-card-foot">
                  <button
                    className={`pray-btn flex items-center justify-center gap-1 ${prayed ? 'pray-btn--prayed' : ''}`}
                    onClick={() => togglePray(req.id)}
                  >
                    <Heart size={16} /> {prayed ? 'Prayed' : 'I prayed'}{count > 0 && ` · ${count}`}
                  </button>
                  {req.user_id === user.uid && (
                    <button className="prayer-delete-btn" onClick={() => deletePrayer(req.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
