"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { getLocalEntries } from '@/utils/offlineStorage'
import { BookOpen, Settings, Moon, Flame, Home, Book, Users, User } from 'lucide-react'

const ADMIN_EMAILS = ['olaolubalogs@gmail.com']

function ProfileModal({ user, streak, onClose }) {
  const router = useRouter()
  const { logout } = useAuth()

  const name = user?.user_metadata?.full_name || 'Devotee'
  const email = user?.email || ''
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarUrl = user?.photoURL || null

  // no supabase fetch needed

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

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase())

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
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const navItems = [
    {
      name: 'Home', path: '/today', icon: <Home size={20} strokeWidth={1.5} />
    },
    {
      name: 'Archive', path: '/history', icon: <Book size={20} strokeWidth={1.5} />
    },
    {
      name: 'Community', path: '/community', icon: <Users size={20} strokeWidth={1.5} />
    },
    {
      name: 'Settings', path: '/settings', icon: <Settings size={20} strokeWidth={1.5} />
    },
  ]

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Editorial<br />Devotion</h1>
          {streak > 0 && <p className="sidebar-streak flex items-center gap-1">{streak}-day streak <Flame size={14} /></p>}
        </div>

        <Link href="/entry/new" className="sidebar-new-entry">+ New Entry</Link>

        <nav className="sidebar-nav">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.name}</span>
              </Link>
            )
          })}

          <Link href="/entry/new" className="sidebar-new-entry-mobile">
            +
          </Link>

          {navItems.slice(2).map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${item.name === 'Settings' ? 'mobile-hidden' : ''} ${isActive ? 'sidebar-link--active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.name}</span>
                {item.name === 'Community' && isAdmin && (
                  <span className="sidebar-badge sidebar-badge--admin">A</span>
                )}
              </Link>
            )
          })}



          {/* Profile tab — shown in bottom bar on mobile */}
          <button
            className={`sidebar-link sidebar-link--profile ${profileOpen ? 'sidebar-link--active' : ''}`}
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
          >
            <span className="sidebar-icon sidebar-profile-avatar">
              <User size={20} strokeWidth={1.5} />
            </span>
            <span className="sidebar-link-text">Me</span>
          </button>
        </nav>

        {/* Desktop-only footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-profile-btn"
            onClick={() => setProfileOpen(true)}
          >
            <span className="sidebar-profile-avatar sidebar-profile-avatar--sm">{initials}</span>
            <span className="sidebar-profile-name">{name.split(' ')[0]}</span>
          </button>
          <ThemeToggle />
        </div>
      </aside>

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
