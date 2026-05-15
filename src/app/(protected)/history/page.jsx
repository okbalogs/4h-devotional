"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import './history.css'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

export default function DailyArchives() {
  const { user } = useAuth()
  const [viewDate, setViewDate] = useState(new Date())
  const [entries, setEntries] = useState([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [loading, setLoading] = useState(true)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    supabase
      .from('entries')
      .select('id, title, scripture_reference, hear, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? [])
        setLoading(false)
      })
  }, [user, year, month])

  useEffect(() => {
    if (!user) return
    supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setTotalEntries(count ?? 0))
  }, [user])

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const entryDays = new Set(entries.map(e => new Date(e.created_at).getDate()))
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const completionRate = daysInMonth > 0 ? Math.round((entryDays.size / daysInMonth) * 100) : 0
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Daily Archives</h1>
      </header>
      <div className="skeleton-block" style={{ width: '180px', height: '14px', marginBottom: '8px' }} />
      <div className="skeleton-block" style={{ width: '260px', height: '36px', marginBottom: '12px' }} />
      <div className="skeleton-block" style={{ width: '420px', maxWidth: '100%', height: '16px', marginBottom: '40px' }} />
      <div className="history-layout">
        <div>
          <div className="skeleton-block" style={{ height: '320px', borderRadius: '16px', marginBottom: '20px' }} />
          <div className="skeleton-block" style={{ height: '80px', borderRadius: '12px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-block" style={{ height: '110px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Daily Archives</h1>
      </header>

      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9d4f14', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Your Journey</span>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', color: '#333', marginTop: '4px', marginBottom: '12px' }}>Faithful Reflections</h2>
        <p style={{ color: '#666', maxWidth: '600px', lineHeight: 1.6 }}>
          Review your walk through the Word. Every entry is a step closer to the heart of God.
        </p>
      </div>

      <div className="history-layout">
        {/* LEFT: Calendar & Stats */}
        <div>
          <div className="calendar-block">
            <div className="calendar-header">
              <h3>{monthLabel}</h3>
              <div className="calendar-nav">
                <span style={{ cursor: 'pointer' }} onClick={() => setViewDate(new Date(year, month - 1, 1))}>&lt;</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setViewDate(new Date(year, month + 1, 1))}>&gt;</span>
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
                return (
                  <span
                    key={day}
                    className={`calendar-day ${entryDays.has(day) ? 'has-entry' : ''} ${isCurrentMonth && today.getDate() === day ? 'selected' : ''}`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <h4>Completion Rate</h4>
              <p>{completionRate}%</p>
            </div>
            <div className="stat-box">
              <h4>Total Entries</h4>
              <p>{totalEntries}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Feed */}
        <div className="entries-feed">
          {loading && <p style={{ color: '#999', padding: '20px 0' }}>Loading...</p>}

          {!loading && entries.length === 0 && (
            <p style={{ color: '#999', padding: '20px 0' }}>
              No entries this month.{' '}
              <Link href="/entry/new" style={{ color: '#9d4f14', fontWeight: 600 }}>Write one now →</Link>
            </p>
          )}

          {entries.map(entry => (
            <Link key={entry.id} href={`/entry/${entry.id}`} className="entry-card" style={{ textDecoration: 'none' }}>
              <div className="entry-meta">
                <span className="entry-date">
                  {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {entry.scripture_reference && (
                  <span className="reference-pill">{entry.scripture_reference}</span>
                )}
              </div>
              <h3>{entry.title || 'Untitled Entry'}</h3>
              {entry.hear && (
                <div className="entry-summary">
                  <span className="summary-label">HEAR (SUMMARY)</span>
                  <p>&ldquo;{entry.hear.length > 140 ? entry.hear.slice(0, 140) + '...' : entry.hear}&rdquo;</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
