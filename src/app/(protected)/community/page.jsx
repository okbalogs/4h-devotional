'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/utils/supabase'
import './community.css'

const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna', 'Benin City']

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

// ─────────────────────────────────────────
// PRAYER TAB
// ─────────────────────────────────────────
function PrayerTab({ user }) {
  const [requests, setRequests] = useState([])
  const [prayerCounts, setPrayerCounts] = useState({})
  const [myPrayers, setMyPrayers] = useState(new Set())
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userName = user?.user_metadata?.full_name || 'Devotee'

  const fetchPrayers = useCallback(async () => {
    setLoading(true)
    const { data: reqs, error: reqErr } = await supabase
      .from('prayer_requests')
      .select('id, user_id, poster_name, content, is_anonymous, created_at')
      .order('created_at', { ascending: false })
      .limit(30)

    if (reqErr) { setError('Could not load prayers.'); setLoading(false); return }
    setRequests(reqs || [])

    if (!reqs?.length) { setLoading(false); return }

    const ids = reqs.map(r => r.id)
    const { data: responses } = await supabase
      .from('prayer_responses')
      .select('request_id, user_id')
      .in('request_id', ids)

    const counts = {}
    const mine = new Set()
    for (const r of responses || []) {
      counts[r.request_id] = (counts[r.request_id] || 0) + 1
      if (r.user_id === user.id) mine.add(r.request_id)
    }
    setPrayerCounts(counts)
    setMyPrayers(mine)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPrayers() }, [fetchPrayers])

  const postPrayer = async () => {
    if (!content.trim()) return
    setPosting(true)
    setError('')
    const { error: err } = await supabase.from('prayer_requests').insert({
      user_id: user.id,
      poster_name: userName,
      content: content.trim(),
      is_anonymous: isAnonymous,
    })
    if (err) { setError('Could not post prayer request.'); setPosting(false); return }
    setContent('')
    setIsAnonymous(false)
    setPosting(false)
    fetchPrayers()
  }

  const togglePray = async (requestId) => {
    const alreadyPrayed = myPrayers.has(requestId)
    if (alreadyPrayed) {
      await supabase.from('prayer_responses').delete()
        .eq('request_id', requestId).eq('user_id', user.id)
      setMyPrayers(prev => { const s = new Set(prev); s.delete(requestId); return s })
      setPrayerCounts(prev => ({ ...prev, [requestId]: Math.max(0, (prev[requestId] || 1) - 1) }))
    } else {
      await supabase.from('prayer_responses').insert({ request_id: requestId, user_id: user.id })
      setMyPrayers(prev => new Set([...prev, requestId]))
      setPrayerCounts(prev => ({ ...prev, [requestId]: (prev[requestId] || 0) + 1 }))
    }
  }

  const deletePrayer = async (requestId) => {
    await supabase.from('prayer_requests').delete().eq('id', requestId).eq('user_id', user.id)
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <div>
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
          <span className="community-empty-icon">🙏</span>
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
                  <div className={`prayer-avatar ${req.is_anonymous ? 'prayer-avatar--anon' : ''}`}>
                    {req.is_anonymous ? '🙏' : nameInitials(displayName)}
                  </div>
                  <div className="prayer-card-meta">
                    <span className="prayer-poster">{displayName}</span>
                    <span className="prayer-time">{timeAgo(req.created_at)}</span>
                  </div>
                </div>
                <p className="prayer-content">{req.content}</p>
                <div className="prayer-card-foot">
                  <button
                    className={`pray-btn ${prayed ? 'pray-btn--prayed' : ''}`}
                    onClick={() => togglePray(req.id)}
                  >
                    🙏 {prayed ? 'Prayed' : 'I prayed'}{count > 0 && ` · ${count}`}
                  </button>
                  {req.user_id === user.id && (
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

// ─────────────────────────────────────────
// GROUPS TAB
// ─────────────────────────────────────────
function GroupsTab({ user }) {
  const [groups, setGroups] = useState([])
  const [memberCounts, setMemberCounts] = useState({})
  const [membership, setMembership] = useState({})
  const [cityFilter, setCityFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', church: '', city: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userName = user?.user_metadata?.full_name || 'Devotee'

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('small_groups').select('*').order('created_at', { ascending: false })
    if (cityFilter !== 'all') {
      query = query.ilike('city', `%${cityFilter}%`)
    }
    const { data: grps, error: grpErr } = await query
    if (grpErr) { setError('Could not load groups.'); setLoading(false); return }
    setGroups(grps || [])

    if (!grps?.length) { setLoading(false); return }

    const ids = grps.map(g => g.id)
    const { data: members } = await supabase
      .from('group_members')
      .select('group_id, user_id, role')
      .in('group_id', ids)

    const counts = {}
    const myMembership = {}
    for (const m of members || []) {
      counts[m.group_id] = (counts[m.group_id] || 0) + 1
      if (m.user_id === user.id) myMembership[m.group_id] = m.role
    }
    setMemberCounts(counts)
    setMembership(myMembership)
    setLoading(false)
  }, [user, cityFilter])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const joinGroup = async (groupId) => {
    const { error: err } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
      member_name: userName,
      role: 'member',
    })
    if (!err) {
      setMembership(prev => ({ ...prev, [groupId]: 'member' }))
      setMemberCounts(prev => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }))
    }
  }

  const leaveGroup = async (groupId) => {
    await supabase.from('group_members').delete()
      .eq('group_id', groupId).eq('user_id', user.id)
    setMembership(prev => { const m = { ...prev }; delete m[groupId]; return m })
    setMemberCounts(prev => ({ ...prev, [groupId]: Math.max(0, (prev[groupId] || 1) - 1) }))
  }

  const createGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.city.trim()) {
      setError('Group name and city are required.')
      return
    }
    setCreating(true)
    setError('')
    const { data: grp, error: err } = await supabase.from('small_groups').insert({
      name: newGroup.name.trim(),
      church: newGroup.church.trim(),
      city: newGroup.city.trim(),
      description: newGroup.description.trim(),
      leader_id: user.id,
      leader_name: userName,
    }).select().single()

    if (err) { setError('Could not create group.'); setCreating(false); return }

    await supabase.from('group_members').insert({
      group_id: grp.id,
      user_id: user.id,
      member_name: userName,
      role: 'leader',
    })

    setNewGroup({ name: '', church: '', city: '', description: '' })
    setShowCreate(false)
    setCreating(false)
    fetchGroups()
  }

  const filteredGroups = groups

  return (
    <div>
      {/* Header row */}
      <div className="groups-header" style={{ marginBottom: '16px' }}>
        <div className="city-pills">
          <button
            className={`city-pill ${cityFilter === 'all' ? 'city-pill--active' : ''}`}
            onClick={() => setCityFilter('all')}
          >
            All
          </button>
          {CITIES.map(city => (
            <button
              key={city}
              className={`city-pill ${cityFilter === city ? 'city-pill--active' : ''}`}
              onClick={() => setCityFilter(city)}
            >
              {city}
            </button>
          ))}
        </div>
        <button
          className="today-begin-btn"
          style={{ padding: '10px 20px', fontSize: '0.85rem', marginTop: 0, flexShrink: 0 }}
          onClick={() => setShowCreate(v => !v)}
        >
          {showCreate ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="create-group-form" style={{ marginBottom: '20px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--clr-dark)', fontWeight: 700 }}>
            Start a 4H Group
          </p>
          {error && <p className="community-error">{error}</p>}
          <div className="create-group-row">
            <div>
              <label className="input-label">Group name *</label>
              <input
                className="input-soft"
                placeholder="e.g. Lagos Mainland Cell"
                value={newGroup.name}
                onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="input-label">City *</label>
              <input
                className="input-soft"
                placeholder="e.g. Lagos"
                value={newGroup.city}
                onChange={e => setNewGroup(p => ({ ...p, city: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="input-label">Church / denomination</label>
            <input
              className="input-soft"
              placeholder="e.g. ECWA Surulere"
              value={newGroup.church}
              onChange={e => setNewGroup(p => ({ ...p, church: e.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Description (optional)</label>
            <input
              className="input-soft"
              placeholder="When do you meet? What's the focus?"
              value={newGroup.description}
              onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="create-group-actions">
            <button
              className="today-begin-btn"
              style={{ padding: '10px 24px', fontSize: '0.88rem', marginTop: 0 }}
              onClick={createGroup}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </div>
      )}

      {/* Groups list */}
      {loading ? (
        <div className="community-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-block" style={{ height: '16px', width: '60%' }} />
              <div className="skeleton-block" style={{ height: '12px', width: '40%' }} />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="community-empty">
          <span className="community-empty-icon">⛪</span>
          No groups found{cityFilter !== 'all' ? ` in ${cityFilter}` : ''}.<br />
          Be the first to start one.
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups.map(grp => {
            const role = membership[grp.id]
            const count = memberCounts[grp.id] || 0
            return (
              <div key={grp.id} className="group-card">
                <p className="group-card-name">{grp.name}</p>
                {grp.church && <p className="group-card-church">{grp.church}</p>}
                <p className="group-card-city">{grp.city}</p>
                {grp.description && <p className="group-card-desc">{grp.description}</p>}
                <div className="group-card-foot">
                  <span className="group-member-count">
                    {count} member{count !== 1 ? 's' : ''} · Led by {grp.leader_name || 'unknown'}
                  </span>
                  {role === 'leader' ? (
                    <span className="join-btn join-btn--leader">Leader</span>
                  ) : role === 'member' ? (
                    <button className="join-btn join-btn--leave" onClick={() => leaveGroup(grp.id)}>Leave</button>
                  ) : (
                    <button className="join-btn join-btn--join" onClick={() => joinGroup(grp.id)}>Join</button>
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

// ─────────────────────────────────────────
// PARTNERS TAB
// ─────────────────────────────────────────
function PartnersTab({ user }) {
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
    const { data } = await supabase
      .from('entries')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!data) return { total: 0, thisMonth: 0, lastEntry: null }
    const now = new Date()
    const thisMonth = data.filter(e => {
      const d = new Date(e.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { total: data.length, thisMonth, lastEntry: data[0]?.created_at || null }
  }, [])

  const fetchMessages = useCallback(async (partnershipId) => {
    const { data } = await supabase
      .from('partner_messages')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(60)
    setMessages(data || [])
  }, [])

  const fetchPartners = useCallback(async () => {
    setLoading(true)

    await supabase
      .from('accountability_partners')
      .update({ partner_id: user.id, partner_name: userName })
      .eq('partner_email', user.email)
      .eq('status', 'pending')
      .is('partner_id', null)

    const { data } = await supabase
      .from('accountability_partners')
      .select('*')
      .or(`requester_id.eq.${user.id},partner_id.eq.${user.id},partner_email.eq.${user.email}`)
      .order('created_at', { ascending: false })

    let active = null, sent = null, received = null
    for (const record of data || []) {
      if (record.status === 'active') { active = record; break }
      if (record.status === 'pending') {
        if (record.requester_id === user.id) sent = record
        else received = record
      }
    }

    setActivePartner(active)
    setSentRequest(sent)
    setReceivedRequest(received)

    if (active) {
      const isRequester = active.requester_id === user.id
      const partnerId = isRequester ? active.partner_id : active.requester_id
      const [myS, partnerS] = await Promise.all([
        fetchStats(user.id),
        partnerId ? fetchStats(partnerId) : Promise.resolve({ total: 0, thisMonth: 0, lastEntry: null }),
      ])
      setMyStats(myS)
      setPartnerStats(partnerS)
      await fetchMessages(active.id)
    }

    setLoading(false)
  }, [user, userName, fetchStats, fetchMessages])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  const sendNudge = async () => {
    if (!activePartner) return
    setNudging(true)
    await supabase.from('partner_messages').insert({
      partnership_id: activePartner.id,
      sender_id: user.id,
      sender_name: userName,
      type: 'nudge',
      content: null,
    })
    setNudging(false)
    fetchMessages(activePartner.id)
  }

  const postPrayer = async () => {
    if (!newPrayer.trim() || !activePartner) return
    setPostingPrayer(true)
    await supabase.from('partner_messages').insert({
      partnership_id: activePartner.id,
      sender_id: user.id,
      sender_name: userName,
      type: 'prayer',
      content: newPrayer.trim(),
    })
    setNewPrayer('')
    setPostingPrayer(false)
    fetchMessages(activePartner.id)
  }

  const deleteMessage = async (msgId) => {
    await supabase.from('partner_messages').delete().eq('id', msgId)
    setMessages(prev => prev.filter(m => m.id !== msgId))
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
    const { error: err } = await supabase.from('accountability_partners').insert({
      requester_id: user.id,
      requester_name: userName,
      partner_email: inviteEmail.trim().toLowerCase(),
      status: 'pending',
    })
    if (err) {
      setError(err.code === '23505' ? 'You already sent a request to this person.' : 'Could not send invite.')
      setSending(false)
      return
    }
    setInviteEmail('')
    setSuccess(`Invite sent to ${inviteEmail.trim()}. They'll see it when they sign in.`)
    setSending(false)
    fetchPartners()
  }

  const acceptRequest = async (id) => {
    await supabase.from('accountability_partners')
      .update({ partner_id: user.id, partner_name: userName, status: 'active' })
      .eq('id', id)
    fetchPartners()
  }

  const declineRequest = async (id) => {
    await supabase.from('accountability_partners').update({ status: 'declined' }).eq('id', id)
    setReceivedRequest(null)
  }

  const endPartnership = async (id) => {
    if (!confirm('End this accountability partnership?')) return
    await supabase.from('accountability_partners').delete().eq('id', id)
    setActivePartner(null)
    setMyStats(null)
    setPartnerStats(null)
    setMessages([])
  }

  const cancelRequest = async (id) => {
    await supabase.from('accountability_partners').delete().eq('id', id)
    setSentRequest(null)
  }

  if (loading) {
    return (
      <div className="community-loading">
        <div className="skeleton-card" style={{ height: '140px' }} />
      </div>
    )
  }

  if (activePartner) {
    const isRequester = activePartner.requester_id === user.id
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
    const myLastNudge = messages.find(m => m.type === 'nudge' && m.sender_id === user.id)

    return (
      <div className="partner-panel partner-panel--active">

        {/* Stats */}
        <div className="partner-stats-row">
          <div className="partner-stat-side">
            <div className="partner-avatar-lg">{nameInitials(userName)}</div>
            <p className="partner-stat-name">{userName} <span className="partner-stat-you">(you)</span></p>
            <div className="partner-stat-nums">
              <span>📖 {myStats?.total ?? '…'} total</span>
              <span>📅 {myStats?.thisMonth ?? '…'} this month</span>
              <span>🕐 {lastActiveLabel(myStats?.lastEntry)}</span>
            </div>
          </div>
          <div className="partner-vs-divider">
            <span>⚡</span>
            <span className="partner-days">{days}d together</span>
          </div>
          <div className="partner-stat-side">
            <div className="partner-avatar-lg partner-avatar-alt">{nameInitials(partnerName)}</div>
            <p className="partner-stat-name">{partnerName}</p>
            {partnerMilestone && (
              <span className="partner-milestone">🌟 {partnerMilestone} entries!</span>
            )}
            <div className="partner-stat-nums">
              <span>📖 {partnerStats?.total ?? '…'} total</span>
              <span>📅 {partnerStats?.thisMonth ?? '…'} this month</span>
              <span>🕐 {lastActiveLabel(partnerStats?.lastEntry)}</span>
            </div>
          </div>
        </div>

        {/* Check-in / Nudge */}
        <div className="partner-section">
          <p className="partner-section-title">Check-in</p>
          <div className="nudge-row">
            <button className="btn-nudge" onClick={sendNudge} disabled={nudging}>
              👋 {nudging ? 'Sending…' : `Nudge ${partnerFirstName}`}
            </button>
            {myLastNudge && (
              <span className="nudge-last-sent">Last sent {timeAgo(myLastNudge.created_at)}</span>
            )}
          </div>
          {nudges.length > 0 && (
            <div className="nudge-log">
              {nudges.map(n => (
                <div key={n.id} className="nudge-item">
                  👋 <strong>{n.sender_id === user.id ? 'You' : n.sender_name}</strong> sent a check-in · <span className="nudge-time">{timeAgo(n.created_at)}</span>
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
                <div key={m.id} className={`partner-msg ${m.sender_id === user.id ? 'partner-msg--mine' : ''}`}>
                  <div className="partner-msg-meta">
                    <strong>{m.sender_id === user.id ? 'You' : m.sender_name}</strong>
                    <span>{timeAgo(m.created_at)}</span>
                    {m.sender_id === user.id && (
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
                  <span className="partner-note-meta">— {n.sender_id === user.id ? 'You' : n.sender_name} · {timeAgo(n.created_at)}</span>
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

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function Community() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('prayer')

  // Read ?tab= from URL on mount without useSearchParams (no Suspense needed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['prayer', 'groups', 'partners'].includes(tab)) setActiveTab(tab)
  }, [])

  const TABS = [
    { key: 'prayer', label: '🙏 Prayer' },
    { key: 'groups', label: '⛪ Groups' },
    { key: 'partners', label: '🤝 Partners' },
  ]

  return (
    <div className="page-container community-page">
      <div className="page-header">
        <h1 className="page-title">Community</h1>
      </div>

      <div className="tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === key ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {user && activeTab === 'prayer' && <PrayerTab user={user} />}
      {user && activeTab === 'groups' && <GroupsTab user={user} />}
      {user && activeTab === 'partners' && <PartnersTab user={user} />}
    </div>
  )
}
