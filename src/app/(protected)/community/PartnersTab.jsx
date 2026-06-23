import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Calendar, Clock, Zap, Star, Hand } from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, orderBy, limit, where, or } from 'firebase/firestore'
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

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function nameInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PartnersTab({ user }) {
  const [activePartner, setActivePartner] = useState(null)
  const [sentRequest, setSentRequest] = useState(null)
  const [receivedRequest, setReceivedRequest] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [myStats, setMyStats] = useState(null)
  const [partnerStats, setPartnerStats] = useState(null)
  const [messages, setMessages] = useState([])
  const [newPrayer, setNewPrayer] = useState('')
  const [postingPrayer, setPostingPrayer] = useState(false)
  const [nudging, setNudging] = useState(false)

  const userName = user?.user_metadata?.full_name || 'Devotee'

  const fetchStats = useCallback(async (userId) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/entries?user_id=${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!data || data.error) return { total: 0, thisMonth: 0, lastEntry: null }
      const now = new Date()
      const thisMonth = data.filter(e => {
        const d = new Date(e.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length
      return { total: data.length, thisMonth, lastEntry: data[0]?.created_at || null }
    } catch(err) {
      return { total: 0, thisMonth: 0, lastEntry: null }
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    const q = query(
      collection(db, 'accountability_partners'),
      or(
        where('requester_id', '==', user.uid),
        where('partner_id', '==', user.uid),
        where('partner_email', '==', user.email)
      ),
      orderBy('created_at', 'desc')
    )

    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      let active = null, sent = null, received = null
      for (const record of data) {
        if (record.status === 'active') { active = record; break }
        if (record.status === 'pending') {
          if (record.requester_id === user.uid) sent = record
          else received = record
        }
      }

      setActivePartner(active)
      setSentRequest(sent)
      setReceivedRequest(received)

      if (active) {
        const isRequester = active.requester_id === user.uid
        const partnerId = isRequester ? active.partner_id : active.requester_id
        const [myS, partnerS] = await Promise.all([
          fetchStats(user.uid),
          partnerId ? fetchStats(partnerId) : Promise.resolve({ total: 0, thisMonth: 0, lastEntry: null }),
        ])
        setMyStats(myS)
        setPartnerStats(partnerS)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [user, fetchStats])

  useEffect(() => {
    if (!activePartner) return
    const q = query(collection(db, 'partner_messages'), where('partnership_id', '==', activePartner.id), orderBy('created_at', 'desc'), limit(60))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [activePartner])

  const getPartnerId = () =>
    activePartner.requester_id === user.uid ? activePartner.partner_id : activePartner.requester_id

  const sendNudge = async () => {
    if (!activePartner) return
    setNudging(true)
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ partnership_id: activePartner.id, type: 'nudge' })
      })
      const pid = getPartnerId()
      if (pid) notifyUser(pid, 'nudge', '👋 Check-in', `${userName} sent you a check-in`, '/community?tab=partners')
    } catch(err) {
      console.error(err)
    } finally {
      setNudging(false)
    }
  }

  const postPrayer = async () => {
    if (!newPrayer.trim() || !activePartner) return
    setPostingPrayer(true)
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ partnership_id: activePartner.id, type: 'prayer', content: newPrayer.trim() })
      })
      const pid = getPartnerId()
      if (pid) notifyUser(pid, 'prayer', 'Prayer request', `${userName} shared a prayer with you`, '/community?tab=partners')
      setNewPrayer('')
    } catch(err) {
      console.error(err)
    } finally {
      setPostingPrayer(false)
    }
  }

  const deleteMessage = async (msgId) => {
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/messages?msg_id=${msgId}&type=partner`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch(err) {
      console.error(err)
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    if (inviteEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      setError('You cannot invite yourself.')
      return
    }
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/community/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ partner_email: inviteEmail.trim().toLowerCase() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInviteEmail('')
      setSuccess(`Invite sent to ${inviteEmail.trim()}. They'll see it when they sign in.`)
    } catch(err) {
      setError(err.message === 'Invite already sent' ? 'You already sent a request to this person.' : 'Could not send invite.')
    } finally {
      setSending(false)
    }
  }

  const acceptRequest = async (id) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invite_id: id, action: 'accept' })
      })
    } catch(err) {
      console.error(err)
    }
  }

  const declineRequest = async (id) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invite_id: id, action: 'decline' })
      })
    } catch(err) {
      console.error(err)
    }
  }

  const endPartnership = async (id) => {
    if (!confirm('End this accountability partnership?')) return
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/partners?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch(err) {
      console.error(err)
    }
  }

  const cancelRequest = async (id) => {
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/partners?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch(err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="community-loading">
        <div className="skeleton-card" style={{ height: '140px' }} />
      </div>
    )
  }

  if (activePartner) {
    const isRequester = activePartner.requester_id === user.uid
    const partnerName = isRequester
      ? (activePartner.partner_name || activePartner.partner_email)
      : (activePartner.requester_name || 'Partner')
    const days = daysSince(activePartner.created_at)
    const partnerFirstName = partnerName.split(' ')[0] || partnerName

    const MILESTONES = [7, 30, 100, 365]
    const partnerMilestone = partnerStats ? MILESTONES.filter(m => partnerStats.total >= m).pop() : null

    const lastActiveLabel = (dateStr) => {
      if (!dateStr) return 'No entries yet'
      const d = daysSince(dateStr)
      if (d === 0) return 'Today'
      if (d === 1) return 'Yesterday'
      return `${d} days ago`
    }

    const prayers = messages.filter(m => m.type === 'prayer')
    const notes = messages.filter(m => m.type === 'note')
    const nudges = messages.filter(m => m.type === 'nudge').slice(0, 5)
    const myLastNudge = messages.find(m => m.type === 'nudge' && m.sender_id === user.uid)

    return (
      <div className="partner-panel partner-panel--active">

        {/* Stats */}
        <div className="partner-stats-row">
          <div className="partner-stat-side">
            <div className="partner-avatar-lg">{nameInitials(userName)}</div>
            <p className="partner-stat-name">{userName} <span className="partner-stat-you">(you)</span></p>
            <div className="partner-stat-nums">
              <span className="flex items-center gap-1"><BookOpen size={14} /> {myStats?.total ?? '…'} total</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {myStats?.thisMonth ?? '…'} this month</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {lastActiveLabel(myStats?.lastEntry)}</span>
            </div>
          </div>
          <div className="partner-vs-divider">
            <span className="flex items-center justify-center"><Zap size={20} /></span>
            <span className="partner-days">{days}d together</span>
          </div>
          <div className="partner-stat-side">
            <div className="partner-avatar-lg partner-avatar-alt">{nameInitials(partnerName)}</div>
            <p className="partner-stat-name">{partnerName}</p>
            {partnerMilestone && (
              <span className="partner-milestone flex items-center gap-1"><Star size={14} /> {partnerMilestone} entries!</span>
            )}
            <div className="partner-stat-nums">
              <span className="flex items-center gap-1"><BookOpen size={14} /> {partnerStats?.total ?? '…'} total</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {partnerStats?.thisMonth ?? '…'} this month</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {lastActiveLabel(partnerStats?.lastEntry)}</span>
            </div>
          </div>
        </div>

        {/* Check-in / Nudge */}
        <div className="partner-section">
          <p className="partner-section-title">Check-in</p>
          <div className="nudge-row">
            <button className="btn-nudge flex items-center gap-1" onClick={sendNudge} disabled={nudging}>
              <Hand size={16} /> {nudging ? 'Sending…' : `Nudge ${partnerFirstName}`}
            </button>
            {myLastNudge && (
              <span className="nudge-last-sent">Last sent {timeAgo(myLastNudge.created_at)}</span>
            )}
          </div>
          {nudges.length > 0 && (
            <div className="nudge-log">
              {nudges.map(n => (
                <div key={n.id} className="nudge-item flex items-center gap-1">
                  <Hand size={14} /> <strong>{n.sender_id === user.uid ? 'You' : n.sender_name}</strong> sent a check-in · <span className="nudge-time">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Private prayers */}
        <div className="partner-section">
          <p className="partner-section-title">Private Prayers</p>
          {prayers.length > 0 && (
            <div className="partner-msgs">
              {prayers.slice(0, 12).map(m => (
                <div key={m.id} className={`partner-msg ${m.sender_id === user.uid ? 'partner-msg--mine' : ''}`}>
                  <div className="partner-msg-meta">
                    <strong>{m.sender_id === user.uid ? 'You' : m.sender_name}</strong>
                    <span>{timeAgo(m.created_at)}</span>
                    {m.sender_id === user.uid && (
                      <button className="partner-msg-del" onClick={() => deleteMessage(m.id)}>✕</button>
                    )}
                  </div>
                  <p className="partner-msg-body">{m.content}</p>
                </div>
              ))}
            </div>
          )}
          {prayers.length === 0 && (
            <p className="partner-empty-hint">Share prayer requests privately — only you and {partnerFirstName} can see these.</p>
          )}
          <div className="partner-prayer-form">
            <textarea
              className="prayer-textarea"
              rows={2}
              placeholder="Share a prayer request privately…"
              value={newPrayer}
              onChange={e => setNewPrayer(e.target.value)}
            />
            <button
              className="today-begin-btn"
              style={{ padding: '10px 20px', fontSize: '0.85rem', marginTop: 0, flexShrink: 0 }}
              onClick={postPrayer}
              disabled={postingPrayer || !newPrayer.trim()}
            >
              {postingPrayer ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>

        {/* Shared devotion notes */}
        {notes.length > 0 && (
          <div className="partner-section">
            <p className="partner-section-title">Shared Devotion Notes</p>
            <div className="partner-notes-list">
              {notes.slice(0, 10).map(n => (
                <div key={n.id} className="partner-note-item">
                  <p className="partner-note-text">"{n.content}"</p>
                  <span className="partner-note-meta">— {n.sender_id === user.uid ? 'You' : n.sender_name} · {timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-end-partner" onClick={() => endPartnership(activePartner.id)}>
          End partnership
        </button>
      </div>
    )
  }

  if (receivedRequest) {
    return (
      <div className="partner-panel">
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--clr-dark)', margin: 0, fontWeight: 700 }}>
          Partnership request
        </p>
        <p className="partner-desc">
          <strong>{receivedRequest.requester_name || receivedRequest.requester_id}</strong> has invited you
          to be their accountability partner.
        </p>
        <div className="partner-actions">
          <button className="btn-accept" onClick={() => acceptRequest(receivedRequest.id)}>Accept</button>
          <button className="btn-decline" onClick={() => declineRequest(receivedRequest.id)}>Decline</button>
        </div>
      </div>
    )
  }

  if (sentRequest) {
    return (
      <div className="partner-panel">
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--clr-dark)', margin: 0, fontWeight: 700 }}>
          Invite sent
        </p>
        <p className="partner-desc">
          Waiting for <strong>{sentRequest.partner_email}</strong> to accept your invitation.
          They will see it the next time they sign in.
        </p>
        <button className="btn-end-partner" onClick={() => cancelRequest(sentRequest.id)}>
          Cancel invite
        </button>
      </div>
    )
  }

  return (
    <div className="partner-panel">
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--clr-dark)', margin: 0, fontWeight: 700 }}>
        Invite an accountability partner
      </p>
      <p className="partner-desc">
        Share your devotion journey with someone you trust — a friend, a spouse, a pastor.
        Enter their email address and they will receive your invitation when they sign in.
      </p>
      {error && <p className="community-error">{error}</p>}
      {success && (
        <p style={{ color: '#2d6a4f', fontSize: '0.88rem', background: '#d8f3dc', padding: '10px 14px', borderRadius: '8px', margin: 0 }}>
          {success}
        </p>
      )}
      <div className="partner-invite-form">
        <input
          type="email"
          className="partner-invite-input"
          placeholder="partner@email.com"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendInvite()}
        />
        <button
          className="today-begin-btn"
          style={{ padding: '12px 22px', fontSize: '0.88rem', marginTop: 0, flexShrink: 0 }}
          onClick={sendInvite}
          disabled={sending || !inviteEmail.trim()}
        >
          {sending ? 'Sending…' : 'Send Invite'}
        </button>
      </div>
    </div>
  )
}
