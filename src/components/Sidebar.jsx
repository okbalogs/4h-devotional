"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import SearchDrawer from './SearchDrawer'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

function ProfileModal({ user, streak, onClose }) {
  const router = useRouter()
  const { logout } = useAuth()

  const name = user?.user_metadata?.full_name || 'Devotee'
  const email = user?.email || ''
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url) })
  }, [user])

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
              <span className="profile-modal-streak">🔥 {streak}-day streak</span>
            )}
          </div>
        </div>

        <div className="profile-modal-divider" />

        <nav className="profile-modal-nav">
          <button className="profile-modal-item" onClick={handleNewEntry}>
            <span className="profile-modal-item-icon">📖</span>
            New Entry
          </button>
          <button className="profile-modal-item" onClick={handleSettings}>
            <span className="profile-modal-item-icon">⚙️</span>
            Settings
          </button>
          <div className="profile-modal-item profile-modal-item--theme">
            <span className="profile-modal-item-icon">🌙</span>
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const since = new Date()
    since.setDate(since.getDate() - 60)
    supabase
      .from('entries')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) { setStreak(0); return }
        const days = new Set(data.map(e => e.created_at.slice(0, 10)))
        let count = 0
        const d = new Date()
        if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
        while (days.has(d.toISOString().slice(0, 10))) { count++; d.setDate(d.getDate() - 1) }
        setStreak(count)
      })
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      setUnreadCount(count || 0)
    }

    fetchUnread()

    const channel = supabase
      .channel(`sidebar-notifs-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, fetchUnread)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const name = user?.user_metadata?.full_name || 'Devotee'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const navItems = [
    {
      name: 'Today', path: '/today', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      name: 'History', path: '/history', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      name: 'Community', path: '/community', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: 'Settings', path: '/settings', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
  ]

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Editorial<br />Devotion</h1>
          {streak > 0 && <p className="sidebar-streak">{streak}-day streak 🔥</p>}
        </div>

        <Link href="/entry/new" className="sidebar-new-entry">+ New Entry</Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.name}
                {item.name === 'Community' && unreadCount > 0 && (
                  <span className="sidebar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>
            )
          })}

          {/* Search tab */}
          <button
            className={`sidebar-link ${searchOpen ? 'sidebar-link--active' : ''}`}
            onClick={() => setSearchOpen(true)}
            aria-label="Search entries"
          >
            <span className="sidebar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            Search
          </button>

          {/* Profile tab — shown in bottom bar on mobile */}
          <button
            className={`sidebar-link sidebar-link--profile ${profileOpen ? 'sidebar-link--active' : ''}`}
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
          >
            <span className="sidebar-icon sidebar-profile-avatar">
              {initials}
            </span>
            Profile
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

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
