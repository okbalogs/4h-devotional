'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Heart, Church, Pencil, Calendar, BookOpen, Clock, Zap, Star, Hand, Handshake, Bell, Megaphone } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { subscribeToPush, notifyUser } from '@/utils/pushManager'
import NoticesTab from './NoticesTab'
import LeaderboardWidget from './LeaderboardWidget'
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

      const req = requests.find(r => r.id === requestId)
      if (req && req.user_id !== user.id) {
        notifyUser(req.user_id, 'prayer_prayed', 'Someone prayed', `${userName} prayed for your request`, '/community?tab=prayer')
      }
    }
  }

  const deletePrayer = async (requestId) => {
    await supabase.from('prayer_requests').delete().eq('id', requestId).eq('user_id', user.id)
    setRequests(prev => prev.filter(r => r.id !== requestId))
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
// GROUP DETAIL PANEL
// ─────────────────────────────────────────
function GroupDetail({ group: initialGroup, user, role, memberCounts, onClose, onJoin, onLeave, onGroupUpdated }) {
  const [group, setGroup] = useState(initialGroup)
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [posting, setPosting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ description: initialGroup.description || '', meeting_schedule: initialGroup.meeting_schedule || '' })
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [removingMember, setRemovingMember] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const userName = user?.user_metadata?.full_name || 'Devotee'
  const isLeader = role === 'leader'
  const isMember = role === 'member' || role === 'leader'
  const count = memberCounts[group.id] || members.length

  useEffect(() => {
    supabase
      .from('group_members')
      .select('user_id, member_name, role, created_at')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMembers(data || []))
  }, [group.id])

  useEffect(() => {
    if (!isMember) { setLoadingMsgs(false); return }
    supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(60)
      .then(({ data }) => { setMessages(data || []); setLoadingMsgs(false) })
  }, [group.id, isMember])

  // Realtime: new messages appear live for all members, plus typing indicators
  useEffect(() => {
    if (!isMember) return
    const channel = supabase.channel(`group-msgs-${group.id}`)
    channelRef.current = channel

    channel
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'group_messages',
        filter: `group_id=eq.${group.id}`,
      }, (payload) => {
        // Deduplicate by ID — own messages are already added optimistically in postMessage
        setMessages(prev =>
          prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]
        )
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userName: typingUser, isTyping } = payload.payload
        if (typingUser === userName) return // ignore own typing
        if (isTyping) {
          setTypingUsers(prev => prev.includes(typingUser) ? prev : [...prev, typingUser])
        } else {
          setTypingUsers(prev => prev.filter(u => u !== typingUser))
        }
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [group.id, isMember, userName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const postMessage = async () => {
    if (!newMsg.trim()) return
    setPosting(true)
    const content = newMsg.trim()
    const { data: msg } = await supabase.from('group_messages').insert({
      group_id: group.id,
      user_id: user.id,
      author_name: userName,
      content,
    }).select().single()
    if (msg) setMessages(prev => [...prev, msg])
    setNewMsg('')
    setPosting(false)
    
    // Clear own typing state immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userName, isTyping: false }
      })
    }

    // Notify other members (cap at 15 to avoid spam)
    const others = members.filter(m => m.user_id !== user.id).slice(0, 15)
    for (const m of others) {
      notifyUser(m.user_id, 'group_message', `💬 ${group.name}`, `${userName}: ${content.slice(0, 60)}`, '/community?tab=groups')
    }
  }

  const handleTyping = (e) => {
    setNewMsg(e.target.value)
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userName, isTyping: true }
      })

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userName, isTyping: false }
          })
        }
      }, 2000)
    }
  }

  const removeMember = async (memberId) => {
    if (!isLeader || memberId === user.id) return
    setRemovingMember(memberId)
    await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', memberId)
    setMembers(prev => prev.filter(m => m.user_id !== memberId))
    setRemovingMember(null)
  }

  const saveEdit = async () => {
    const updates = { description: editData.description.trim(), meeting_schedule: editData.meeting_schedule.trim() }
    await supabase.from('small_groups').update(updates).eq('id', group.id)
    const updated = { ...group, ...updates }
    setGroup(updated)
    onGroupUpdated(updated)
    setEditing(false)
  }

  const deleteGroup = async () => {
    if (!confirm('Delete this group? All messages will be lost. This cannot be undone.')) return
    await supabase.from('small_groups').delete().eq('id', group.id)
    onGroupUpdated(null)
    onClose()
  }

  return (
    <div className="group-detail">
      <button className="group-detail-back" onClick={onClose}>← Back to Groups</button>

      {/* Header */}
      <div className="group-detail-head">
        <div className="group-detail-icon flex items-center justify-center"><Church size={48} /></div>
        <div className="group-detail-info">
          <h2 className="group-detail-name">{group.name}</h2>
          {group.church && <p className="group-detail-church">{group.church}</p>}
          <p className="group-detail-city">{group.city.toUpperCase()}</p>
        </div>
        {isLeader && (
          <button className="group-edit-toggle flex items-center justify-center" onClick={() => setEditing(v => !v)}>
            {editing ? 'Cancel' : <Pencil size={18} />}
          </button>
        )}
      </div>

      {/* Edit form (leader only) */}
      {editing && (
        <div className="group-edit-form">
          <div>
            <label className="input-label">Description</label>
            <input className="input-soft" value={editData.description}
              onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
              placeholder="What's the focus of this group?" />
          </div>
          <div>
            <label className="input-label">Meeting schedule</label>
            <input className="input-soft" value={editData.meeting_schedule}
              onChange={e => setEditData(p => ({ ...p, meeting_schedule: e.target.value }))}
              placeholder="e.g. Sundays at 9am" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="today-begin-btn" style={{ padding: '8px 20px', fontSize: '0.85rem', marginTop: 0 }} onClick={saveEdit}>
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Group meta */}
      {!editing && (
        <div className="group-detail-meta">
          {group.description && <p className="group-detail-desc">{group.description}</p>}
          {group.meeting_schedule && <p className="group-detail-schedule flex items-center gap-1"><Calendar size={16} /> {group.meeting_schedule}</p>}
          <p className="group-detail-stat">{count} member{count !== 1 ? 's' : ''} · Led by {group.leader_name}</p>
        </div>
      )}

      {!isMember && (
        <button className="join-btn join-btn--join" style={{ alignSelf: 'flex-start' }} onClick={onJoin}>
          Join this group
        </button>
      )}

      {/* Members */}
      <div className="group-section">
        <p className="group-section-title">Members ({members.length})</p>
        <div className="group-members-list">
          {members.map(m => (
            <div key={m.user_id} className="group-member-row">
              <div className="group-member-avatar">{nameInitials(m.member_name || 'M')}</div>
              <span className="group-member-name">{m.member_name || 'Member'}</span>
              {m.role === 'leader' && <span className="group-member-badge">Leader</span>}
              {isLeader && m.user_id !== user.id && (
                <button className="group-member-remove" onClick={() => removeMember(m.user_id)}
                  disabled={removingMember === m.user_id}>
                  {removingMember === m.user_id ? '…' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Discussion (members only) */}
      {isMember ? (
        <div className="group-section group-section--grow">
          <p className="group-section-title">Discussion</p>
          <div className="group-messages">
            {loadingMsgs ? (
              <div className="skeleton-block" style={{ height: '60px', borderRadius: '8px' }} />
            ) : messages.length === 0 ? (
              <p className="partner-empty-hint">No messages yet. Start the conversation!</p>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`group-msg ${m.user_id === user.id ? 'group-msg--mine' : ''}`}>
                  <div className="group-msg-meta">
                    <strong>{m.user_id === user.id ? 'You' : m.author_name}</strong>
                    <span>{timeAgo(m.created_at)}</span>
                  </div>
                  <p className="group-msg-body">{m.content}</p>
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', padding: '4px 12px', fontStyle: 'italic' }}>
                {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="group-msg-form">
            <input className="input-soft" placeholder="Write a message…"
              value={newMsg} onChange={handleTyping}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postMessage() } }} />
            <button className="today-begin-btn"
              style={{ padding: '10px 18px', fontSize: '0.85rem', marginTop: 0, flexShrink: 0 }}
              onClick={postMessage} disabled={posting || !newMsg.trim()}>
              {posting ? '…' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <div className="group-section">
          <p className="group-section-title">Discussion</p>
          <p className="partner-empty-hint">Join the group to participate in discussions.</p>
        </div>
      )}

      {/* Footer actions */}
      <div className="group-detail-footer">
        {isMember && !isLeader && (
          <button className="btn-end-partner" onClick={onLeave}>Leave group</button>
        )}
        {isLeader && (
          <button className="btn-end-partner" onClick={deleteGroup}>Delete group</button>
        )}
      </div>
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
  const [newGroup, setNewGroup] = useState({ name: '', church: '', city: '', description: '', meeting_schedule: '' })
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)

  const userName = user?.user_metadata?.full_name || 'Devotee'

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('small_groups').select('*').order('created_at', { ascending: false })
    if (cityFilter !== 'all') query = query.ilike('city', `%${cityFilter}%`)
    const { data: grps, error: grpErr } = await query
    if (grpErr) { setError('Could not load groups.'); setLoading(false); return }
    setGroups(grps || [])

    if (!grps?.length) { setLoading(false); return }

    const ids = grps.map(g => g.id)
    const { data: members } = await supabase
      .from('group_members').select('group_id, user_id, role').in('group_id', ids)

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
      group_id: groupId, user_id: user.id, member_name: userName, role: 'member',
    })
    if (!err) {
      setMembership(prev => ({ ...prev, [groupId]: 'member' }))
      setMemberCounts(prev => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }))
      // Notify leader that someone joined
      const grp = groups.find(g => g.id === groupId)
      if (grp?.leader_id && grp.leader_id !== user.id) {
        notifyUser(grp.leader_id, 'group_join', '⛪ New member', `${userName} joined ${grp.name}`, '/community?tab=groups')
      }
    }
  }

  const leaveGroup = async (groupId) => {
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id)
    setMembership(prev => { const m = { ...prev }; delete m[groupId]; return m })
    setMemberCounts(prev => ({ ...prev, [groupId]: Math.max(0, (prev[groupId] || 1) - 1) }))
  }

  const createGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.city.trim()) { setError('Group name and city are required.'); return }
    setCreating(true)
    setError('')
    const { data: grp, error: err } = await supabase.from('small_groups').insert({
      name: newGroup.name.trim(),
      church: newGroup.church.trim(),
      city: newGroup.city.trim(),
      description: newGroup.description.trim(),
      meeting_schedule: newGroup.meeting_schedule.trim(),
      leader_id: user.id,
      leader_name: userName,
    }).select().single()

    if (err) { setError('Could not create group.'); setCreating(false); return }

    await supabase.from('group_members').insert({
      group_id: grp.id, user_id: user.id, member_name: userName, role: 'leader',
    })

    setNewGroup({ name: '', church: '', city: '', description: '', meeting_schedule: '' })
    setShowCreate(false)
    setCreating(false)
    fetchGroups()
  }

  // If a group is selected, show detail panel
  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        user={user}
        role={membership[selectedGroup.id]}
        memberCounts={memberCounts}
        onClose={() => setSelectedGroup(null)}
        onJoin={() => {
          joinGroup(selectedGroup.id)
          setMembership(prev => ({ ...prev, [selectedGroup.id]: 'member' }))
        }}
        onLeave={() => { leaveGroup(selectedGroup.id); setSelectedGroup(null) }}
        onGroupUpdated={(updatedGroup) => {
          if (!updatedGroup) {
            setGroups(prev => prev.filter(g => g.id !== selectedGroup.id))
            setSelectedGroup(null)
          } else {
            setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
            setSelectedGroup(updatedGroup)
          }
        }}
      />
    )
  }

  return (
    <div>
      <div className="groups-header" style={{ marginBottom: '16px' }}>
        <div className="city-pills">
          <button className={`city-pill ${cityFilter === 'all' ? 'city-pill--active' : ''}`} onClick={() => setCityFilter('all')}>All</button>
          {CITIES.map(city => (
            <button key={city} className={`city-pill ${cityFilter === city ? 'city-pill--active' : ''}`} onClick={() => setCityFilter(city)}>
              {city}
            </button>
          ))}
        </div>
        <button className="today-begin-btn" style={{ padding: '10px 20px', fontSize: '0.85rem', marginTop: 0, flexShrink: 0 }}
          onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {showCreate && (
        <div className="create-group-form" style={{ marginBottom: '20px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--clr-dark)', fontWeight: 700 }}>
            Start a 4H Group
          </p>
          {error && <p className="community-error">{error}</p>}
          <div className="create-group-row">
            <div>
              <label className="input-label">Group name *</label>
              <input className="input-soft" placeholder="e.g. Lagos Mainland Cell"
                value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="input-label">City *</label>
              <input className="input-soft" placeholder="e.g. Lagos"
                value={newGroup.city} onChange={e => setNewGroup(p => ({ ...p, city: e.target.value }))} />
            </div>
          </div>
          <div className="create-group-row">
            <div>
              <label className="input-label">Church / denomination</label>
              <input className="input-soft" placeholder="e.g. ECWA Surulere"
                value={newGroup.church} onChange={e => setNewGroup(p => ({ ...p, church: e.target.value }))} />
            </div>
            <div>
              <label className="input-label">Meeting schedule</label>
              <input className="input-soft" placeholder="e.g. Sundays at 9am"
                value={newGroup.meeting_schedule} onChange={e => setNewGroup(p => ({ ...p, meeting_schedule: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="input-label">Description (optional)</label>
            <input className="input-soft" placeholder="What's the focus of this group?"
              value={newGroup.description} onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="create-group-actions">
            <button className="today-begin-btn" style={{ padding: '10px 24px', fontSize: '0.88rem', marginTop: 0 }}
              onClick={createGroup} disabled={creating}>
              {creating ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="community-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-block" style={{ height: '16px', width: '60%' }} />
              <div className="skeleton-block" style={{ height: '12px', width: '40%' }} />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="community-empty">
          <span className="community-empty-icon flex items-center justify-center"><Church size={48} /></span>
          No groups found{cityFilter !== 'all' ? ` in ${cityFilter}` : ''}.<br />
          Be the first to start one.
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(grp => {
            const role = membership[grp.id]
            const count = memberCounts[grp.id] || 0
            return (
              <div key={grp.id} className="group-card" onClick={() => setSelectedGroup(grp)}>
                <p className="group-card-name">{grp.name}</p>
                {grp.church && <p className="group-card-church">{grp.church}</p>}
                <p className="group-card-city">{grp.city}</p>
                {grp.meeting_schedule && <p className="group-card-schedule flex items-center gap-1"><Calendar size={14} /> {grp.meeting_schedule}</p>}
                {grp.description && <p className="group-card-desc">{grp.description}</p>}
                <div className="group-card-foot">
                  <span className="group-member-count">
                    {count} member{count !== 1 ? 's' : ''} · Led by {grp.leader_name || 'unknown'}
                  </span>
                  {role === 'leader' ? (
                    <span className="join-btn join-btn--leader">Leader</span>
                  ) : role === 'member' ? (
                    <button className="join-btn join-btn--leave"
                      onClick={e => { e.stopPropagation(); leaveGroup(grp.id) }}>Leave</button>
                  ) : (
                    <button className="join-btn join-btn--join"
                      onClick={e => { e.stopPropagation(); joinGroup(grp.id) }}>Join</button>
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

  const getPartnerId = () =>
    activePartner.requester_id === user.id ? activePartner.partner_id : activePartner.requester_id

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
    const pid = getPartnerId()
    if (pid) notifyUser(pid, 'nudge', '👋 Check-in', `${userName} sent you a check-in`, '/community?tab=partners')
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
    const pid = getPartnerId()
    if (pid) notifyUser(pid, 'prayer', 'Prayer request', `${userName} shared a prayer with you`, '/community?tab=partners')
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
    if (receivedRequest?.requester_id) {
      notifyUser(receivedRequest.requester_id, 'accepted', 'Partnership accepted', `${userName} accepted your accountability partner invite`, '/community?tab=partners')
    }
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
                  <Hand size={14} /> <strong>{n.sender_id === user.id ? 'You' : n.sender_name}</strong> sent a check-in · <span className="nudge-time">{timeAgo(n.created_at)}</span>
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
const TAB_NOTIF_TYPES = {
  prayer: ['prayer_prayed'],
  groups: ['group_message', 'group_join'],
  partners: ['nudge', 'prayer', 'note', 'invite', 'accepted'],
  notices: [],
}

export default function Community() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('prayer')
  const [tabUnread, setTabUnread] = useState({ prayer: 0, partners: 0, notices: 0 })
  const [showNotifBanner, setShowNotifBanner] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['prayer', 'groups', 'partners'].includes(tab)) setActiveTab(tab)
  }, [])

  // Request push permission banner
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      setShowNotifBanner(true)
    }
  }, [])

  // Auto-subscribe if permission already granted
  useEffect(() => {
    if (!user) return
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      subscribeToPush(user.id)
    }
  }, [user])

  // Fetch unread counts per tab
  useEffect(() => {
    if (!user) return

    const fetchTabUnread = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('type')
        .eq('user_id', user.id)
        .eq('is_read', false)

      const counts = { prayer: 0, partners: 0, notices: 0 }
      for (const n of data || []) {
        if (TAB_NOTIF_TYPES.prayer.includes(n.type)) counts.prayer++
        if (TAB_NOTIF_TYPES.partners.includes(n.type)) counts.partners++
      }
      setTabUnread(counts)
    }

    fetchTabUnread()

    const channel = supabase
      .channel(`community-tabs-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, fetchTabUnread)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  // Mark tab notifications as read when switching to that tab
  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    const types = TAB_NOTIF_TYPES[tab]
    if (!types || !user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .in('type', types)
    setTabUnread(prev => ({ ...prev, [tab]: 0 }))
  }

  const enableNotifications = async () => {
    const perm = await Notification.requestPermission()
    if (perm === 'granted' && user) subscribeToPush(user.id)
    setShowNotifBanner(false)
  }

  const TABS = [
    { key: 'prayer', label: <span className="flex items-center gap-2"><Heart size={16} /> Prayer</span> },
    { key: 'groups', label: <span className="flex items-center gap-2"><Church size={16} /> Groups</span> },
    { key: 'partners', label: <span className="flex items-center gap-2"><Handshake size={16} /> Partners</span> },
    { key: 'notices', label: <span className="flex items-center gap-2"><Megaphone size={16} /> Notices</span> },
  ]

  return (
    <div className="page-container community-page">
      <div className="page-header">
        <h1 className="page-title">Community</h1>
      </div>

      {showNotifBanner && (
        <div className="notif-banner">
          <span className="flex items-center gap-2"><Bell size={16} /> Enable notifications to get alerts for partner check-ins, prayers, and more.</span>
          <div className="notif-banner-actions">
            <button className="notif-banner-yes" onClick={enableNotifications}>Enable</button>
            <button className="notif-banner-no" onClick={() => setShowNotifBanner(false)}>Not now</button>
          </div>
        </div>
      )}

      <div className="tabs">
        {TABS.map(({ key, label }) => {
          const count = tabUnread[key] || 0
          return (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'tab-btn--active' : ''}`}
              onClick={() => handleTabChange(key)}
            >
              {label}
              {count > 0 && <span className="tab-badge">{count > 9 ? '9+' : count}</span>}
            </button>
          )
        })}
      </div>

      {user && activeTab === 'prayer' && <PrayerTab user={user} />}
      {user && activeTab === 'groups' && <GroupsTab user={user} />}
      {user && activeTab === 'partners' && <PartnersTab user={user} />}
      {user && activeTab === 'notices' && <NoticesTab user={user} />}
    </div>
  )
}
