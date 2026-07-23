'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Heart, Church, Handshake, Bell, Megaphone } from 'lucide-react'
import { subscribeToPush } from '@/utils/pushManager'
import { db } from '@/utils/firebase'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import NoticesTab from './NoticesTab'
import PrayerTab from './PrayerTab'
import GroupsTab from './GroupsTab'
import PartnersTab from './PartnersTab'
import './community.css'

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
      subscribeToPush(user.uid)
    }
  }, [user])

  // Fetch unread counts per tab
  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'notifications'), where('user_id', '==', user.uid), where('is_read', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      const counts = { prayer: 0, partners: 0, notices: 0 }
      snap.docs.forEach(doc => {
        const type = doc.data().type
        if (TAB_NOTIF_TYPES.prayer.includes(type)) counts.prayer++
        if (TAB_NOTIF_TYPES.partners.includes(type)) counts.partners++
      })
      setTabUnread(counts)
    }, (err) => {
      console.warn("Notifications listener error:", err)
    })

    return () => unsub()
  }, [user])

  // Mark tab notifications as read when switching to that tab
  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    const types = TAB_NOTIF_TYPES[tab]
    if (!types || !user || types.length === 0) return
    
    try {
      const token = await user.getIdToken();
      await fetch('/api/community/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ types })
      })
    } catch(err) {
      console.error(err)
    }
  }

  const enableNotifications = async () => {
    const perm = await Notification.requestPermission()
    if (perm === 'granted' && user) subscribeToPush(user.uid)
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
