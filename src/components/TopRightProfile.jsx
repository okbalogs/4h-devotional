"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getLocalEntries } from '@/utils/offlineStorage'
import ThemeToggle from './ThemeToggle'
import { BookOpen, Settings, Moon, Flame, User } from 'lucide-react'

function ProfileModal({ user, streak, onClose }) {
  const router = useRouter()
  const { logout } = useAuth()

  const name = user?.user_metadata?.full_name || 'Devotee'
  const email = user?.email || ''
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarUrl = user?.photoURL || null

  const handleLogout = async () => {
    onClose()
    await logout()
  }

  const handleSettings = () => {
    onClose()
    router.push('/settings')
  }

  const handleNewEntry = () => {
    onClose()
    router.push('/entry/new')
  }

  return (
    <>
      <div className="profile-modal-backdrop" onClick={onClose} />
      <div className="profile-modal" role="dialog" aria-modal="true">
        <div className="profile-modal-handle" />

        <div className="profile-modal-head">
          <div className="profile-modal-avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt={name} />
              : <span>{initials}</span>}
          </div>
          <div className="profile-modal-info">
            <strong>{name}</strong>
            <span>{email}</span>
            {streak > 0 && (
              <span className="profile-modal-streak flex items-center gap-1">
                <Flame size={14} /> {streak}-day streak
              </span>
            )}
          </div>
        </div>

        <div className="profile-modal-divider" />

        <nav className="profile-modal-nav">
          <button className="profile-modal-item" onClick={handleNewEntry}>
            <span className="profile-modal-item-icon"><BookOpen size={18} /></span>
            New Entry
          </button>
          <button className="profile-modal-item" onClick={handleSettings}>
            <span className="profile-modal-item-icon"><Settings size={18} /></span>
            Settings
          </button>
          <div className="profile-modal-item profile-modal-item--theme">
            <span className="profile-modal-item-icon"><Moon size={18} /></span>
            Theme
            <span style={{ marginLeft: 'auto' }}>
              <ThemeToggle compact />
            </span>
          </div>
        </nav>

        <div className="profile-modal-divider" />

        <button className="profile-modal-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </>
  )
}

export default function TopRightProfile() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const entries = getLocalEntries(user.id)
    if (!entries?.length) { setStreak(0); return }
    const days = new Set(entries.map(e => e.created_at?.slice(0, 10)).filter(Boolean))
    let count = 0
    const d = new Date()
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
    while (days.has(d.toISOString().slice(0, 10))) { count++; d.setDate(d.getDate() - 1) }
    setStreak(count)
  }, [user])

  const name = user?.user_metadata?.full_name || 'Devotee'
  const firstName = name.split(' ')[0]
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarUrl = user?.photoURL || null

  return (
    <>
      <div className="top-right-profile-bar">
        {streak > 0 && (
          <div className="top-right-streak-pill" title={`${streak}-day streak`}>
            <Flame size={14} className="text-amber-500" />
            <span>{streak}d</span>
          </div>
        )}
        <button
          className="top-right-profile-btn"
          onClick={() => setProfileOpen(true)}
          title="Account Profile"
          aria-label="Account Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="top-right-avatar-img" />
          ) : (
            <span className="top-right-avatar-initials">{initials}</span>
          )}
          <span className="top-right-profile-name">{firstName}</span>
        </button>
      </div>

      {profileOpen && (
        <ProfileModal
          user={user}
          streak={streak}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  )
}
