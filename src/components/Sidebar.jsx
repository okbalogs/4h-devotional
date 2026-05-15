"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import InstallButton from './InstallButton'
import ThemeToggle from './ThemeToggle'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    if (!user) return
    // Fetch last 60 days of entry dates to calculate streak
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
        // Allow today or yesterday as streak start
        if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
        while (days.has(d.toISOString().slice(0, 10))) {
          count++
          d.setDate(d.getDate() - 1)
        }
        setStreak(count)
      })
  }, [user])

  const navItems = [
    { name: 'Today', path: '/today', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { name: 'History', path: '/history', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    )},
    { name: 'Settings', path: '/settings', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    )},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Editorial<br/>Devotion</h1>
        {streak !== null && streak > 0 && (
          <p className="sidebar-streak">{streak}-day streak 🔥</p>
        )}
      </div>

      <Link href="/entry/new" className="sidebar-new-entry">
        + New Entry
      </Link>

      <InstallButton />

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
             <Link 
               key={item.path} 
               href={item.path} 
               className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
             >
               <span className="sidebar-icon">{item.icon}</span>
               {item.name}
             </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 32px', marginTop: 'auto' }}>
        <ThemeToggle />
      </div>
    </aside>
  )
}
