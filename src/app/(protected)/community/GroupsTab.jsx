import { useState, useEffect, useCallback, useRef } from 'react'
import { Church, Pencil, Calendar } from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, orderBy, limit, where, doc } from 'firebase/firestore'
import { notifyUser } from '@/utils/pushManager'

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

function nameInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
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
  // typing feature relies heavily on realtime db which might spam firestore quotas, we omit it for MVP
  const messagesEndRef = useRef(null)

  const userName = user?.user_metadata?.full_name || 'Devotee'
  const isLeader = role === 'leader'
  const isMember = role === 'member' || role === 'leader'
  const count = memberCounts[group.id] || members.length

  useEffect(() => {
    const q = query(collection(db, 'group_members'), where('group_id', '==', group.id), orderBy('created_at', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [group.id])

  useEffect(() => {
    if (!isMember) { setLoadingMsgs(false); return }
    const q = query(collection(db, 'group_messages'), where('group_id', '==', group.id), orderBy('created_at', 'asc'), limit(60))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoadingMsgs(false)
    })
    return () => unsub()
  }, [group.id, isMember])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const postMessage = async () => {
    if (!newMsg.trim()) return
    setPosting(true)
    const content = newMsg.trim()
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ group_id: group.id, content })
      });
      setNewMsg('')
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }

    const others = members.filter(m => m.user_id !== user.uid).slice(0, 15)
    for (const m of others) {
      notifyUser(m.user_id, 'group_message', `💬 ${group.name}`, `${userName}: ${content.slice(0, 60)}`, '/community?tab=groups')
    }
  }

  const removeMember = async (memberId) => {
    if (!isLeader || memberId === user.uid) return
    setRemovingMember(memberId)
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/groups?action=remove&group_id=${group.id}&member_id=${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } finally {
      setRemovingMember(null)
    }
  }

  const saveEdit = async () => {
    try {
      const token = await user.getIdToken();
      const updates = { description: editData.description.trim(), meeting_schedule: editData.meeting_schedule.trim() }
      await fetch('/api/community/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ group_id: group.id, ...updates })
      })
      const updated = { ...group, ...updates }
      setGroup(updated)
      onGroupUpdated(updated)
      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteGroup = async () => {
    if (!confirm('Delete this group? All messages will be lost. This cannot be undone.')) return
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/groups?action=delete&group_id=${group.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onGroupUpdated(null)
      onClose()
    } catch (err) {
      console.error(err)
    }
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

      {/* Edit form */}
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
              {isLeader && m.user_id !== user.uid && (
                <button className="group-member-remove" onClick={() => removeMember(m.user_id)}
                  disabled={removingMember === m.user_id}>
                  {removingMember === m.user_id ? '…' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Discussion */}
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
                <div key={m.id} className={`group-msg ${m.user_id === user.uid ? 'group-msg--mine' : ''}`}>
                  <div className="group-msg-meta">
                    <strong>{m.user_id === user.uid ? 'You' : m.author_name}</strong>
                    <span>{timeAgo(m.created_at)}</span>
                  </div>
                  <p className="group-msg-body">{m.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="group-msg-form">
            <input className="input-soft" placeholder="Write a message…"
              value={newMsg} onChange={e => setNewMsg(e.target.value)}
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
export default function GroupsTab({ user }) {
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

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'small_groups'), orderBy('created_at', 'desc'))
    const unsub = onSnapshot(q, async (snap) => {
      let grps = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (cityFilter !== 'all') {
        grps = grps.filter(g => g.city.toLowerCase().includes(cityFilter.toLowerCase()))
      }
      setGroups(grps)

      if (!grps.length) { setLoading(false); return }

      // Fetch all member relations real-time
      const ids = grps.map(g => g.id)
      const q2 = query(collection(db, 'group_members'), where('group_id', 'in', ids.slice(0, 30))) // firebase limitation 30
      onSnapshot(q2, (snap2) => {
         const counts = {}
         const myMembership = {}
         snap2.docs.forEach(doc => {
            const m = doc.data()
            counts[m.group_id] = (counts[m.group_id] || 0) + 1
            if (m.user_id === user.uid) myMembership[m.group_id] = m.role
         })
         setMemberCounts(counts)
         setMembership(myMembership)
         setLoading(false)
      })
    })

    return () => unsub()
  }, [user, cityFilter])

  const joinGroup = async (groupId) => {
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'join', group_id: groupId })
      });
    } catch(err) {
      console.error(err)
    }
  }

  const leaveGroup = async (groupId) => {
    try {
      const token = await user.getIdToken();
      await fetch(`/api/community/groups?action=leave&group_id=${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch(err) {
      console.error(err)
    }
  }

  const createGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.city.trim()) { setError('Group name and city are required.'); return }
    setCreating(true)
    setError('')
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'create', ...newGroup })
      });
      if (!res.ok) throw new Error('Failed to create')
      setNewGroup({ name: '', church: '', city: '', description: '', meeting_schedule: '' })
      setShowCreate(false)
    } catch(err) {
      setError('Could not create group.')
    } finally {
      setCreating(false)
    }
  }

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        user={user}
        role={membership[selectedGroup.id]}
        memberCounts={memberCounts}
        onClose={() => setSelectedGroup(null)}
        onJoin={() => joinGroup(selectedGroup.id)}
        onLeave={() => { leaveGroup(selectedGroup.id); setSelectedGroup(null) }}
        onGroupUpdated={(updatedGroup) => {
          if (!updatedGroup) setSelectedGroup(null)
          else setSelectedGroup(updatedGroup)
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
            <div className="skeleton-card" key={i}>
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
