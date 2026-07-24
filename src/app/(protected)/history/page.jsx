"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getLocalEntries } from '@/utils/offlineStorage'
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Plus, 
  WifiOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react'
import './history.css'

export default function DailyArchives() {
  const { user } = useAuth()
  const [viewDate, setViewDate] = useState(new Date())
  const [entries, setEntries] = useState([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Track online/offline status
  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  // Load entries from localStorage directly
  useEffect(() => {
    if (!user) return
    const all = getLocalEntries(user.id)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)
    const filtered = all.filter(e => {
      const d = new Date(e.created_at)
      return d >= start && d <= end
    })
    setEntries(filtered)
    setTotalEntries(all.length)
    setLoading(false)
  }, [user, year, month])

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const entryDays = new Set(entries.map(e => new Date(e.created_at).getDate()))
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const completionRate = daysInMonth > 0 ? Math.round((entryDays.size / daysInMonth) * 100) : 0
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="page-container history-page">
        <header className="history-hero-header">
          <div className="skeleton-block" style={{ width: '140px', height: '24px', borderRadius: '12px', marginBottom: '12px' }} />
          <div className="skeleton-block" style={{ width: '280px', height: '36px', borderRadius: '12px', marginBottom: '12px' }} />
          <div className="skeleton-block" style={{ width: '400px', maxWidth: '100%', height: '18px', borderRadius: '8px' }} />
        </header>
        <div className="history-layout">
          <div>
            <div className="skeleton-block" style={{ height: '340px', borderRadius: '24px', marginBottom: '20px' }} />
            <div className="skeleton-block" style={{ height: '90px', borderRadius: '20px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-block" style={{ height: '140px', borderRadius: '20px' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container history-page">
      {/* Offline Banner */}
      {isOffline && (
        <div className="history-offline-banner">
          <WifiOff size={16} />
          <span>You&apos;re offline — viewing cached records from your last sync.</span>
        </div>
      )}

      {/* Hero Header */}
      <header className="history-hero-header">
        <div className="history-hero-badge">
          <Sparkles size={13} />
          <span>Your Spiritual Walk</span>
        </div>
        <h1 className="history-hero-title">Faithful Reflections</h1>
        <p className="history-hero-subtitle">
          Review your journey through Scripture. Every reflection is a sacred step closer to the heart of God.
        </p>
      </header>

      <div className="history-layout">
        {/* LEFT COLUMN: Glass Calendar & Stats */}
        <div className="history-sidebar-col">
          {/* Glass Calendar Card */}
          <div className="calendar-block glass-card">
            <div className="calendar-header">
              <h3 className="calendar-month-title">{monthLabel}</h3>
              <div className="calendar-nav">
                <button 
                  className="calendar-nav-btn" 
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  className="calendar-nav-btn" 
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  aria-label="Next month"
                  title="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <span key={day} className="calendar-day-header">{day}</span>
              ))}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <span key={`pad-${i}`} className="calendar-day inactive" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const hasEntry = entryDays.has(day)
                const isToday = isCurrentMonth && today.getDate() === day
                return (
                  <span
                    key={day}
                    className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'is-today' : ''}`}
                    title={hasEntry ? `Entry written on ${day} ${monthLabel}` : `${day} ${monthLabel}`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Glass Stats Cards */}
          <div className="stats-row">
            <div className="stat-box glass-card">
              <div className="stat-box-icon">
                <TrendingUp size={18} />
              </div>
              <div className="stat-box-info">
                <h4>Completion Rate</h4>
                <p>{completionRate}%</p>
              </div>
            </div>
            <div className="stat-box glass-card">
              <div className="stat-box-icon">
                <BookOpen size={18} />
              </div>
              <div className="stat-box-info">
                <h4>Total Entries</h4>
                <p>{totalEntries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Glass Reflection Cards Feed */}
        <div className="entries-feed">
          {entries.length === 0 ? (
            <div className="entries-empty-glass glass-card">
              <div className="entries-empty-icon">
                <BookOpen size={32} />
              </div>
              <h3>No Reflections This Month</h3>
              <p>Your devotional reflections for {monthLabel} will appear here.</p>
              {!isOffline && (
                <Link href="/entry/new" className="history-write-btn">
                  <Plus size={16} />
                  <span>Write Reflection</span>
                </Link>
              )}
            </div>
          ) : (
            entries.map(entry => (
              <Link 
                key={entry.id} 
                href={`/entry/${entry.id}`} 
                className="entry-card glass-card"
              >
                <div className="entry-meta">
                  <div className="entry-date-wrap">
                    <CalendarIcon size={14} />
                    <span className="entry-date">
                      {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {entry.scripture_reference && (
                    <span className="reference-pill">{entry.scripture_reference}</span>
                  )}
                </div>

                {entry.hear && (
                  <div className="entry-summary">
                    <span className="summary-label">HEAR (SUMMARY)</span>
                    <p>&ldquo;{entry.hear.length > 140
                      ? entry.hear.slice(0, entry.hear.lastIndexOf(' ', 140) > 0 ? entry.hear.lastIndexOf(' ', 140) : 140) + '…'
                      : entry.hear}&rdquo;</p>
                  </div>
                )}

                <div className="entry-card-footer">
                  <span>Read full entry</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
