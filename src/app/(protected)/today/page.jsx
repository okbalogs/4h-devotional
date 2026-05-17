"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser, getJourneyDay, getGreeting, getStreakAndCount } from '@/utils/dailyVerse'
import BadgeModal, { getNewBadge } from '@/components/BadgeModal'
import './today.css'

const H4_PILLARS = [
  {
    key: 'hear',
    label: 'Hear',
    sub: 'What does the Word say?',
    icon: '📖',
    color: 'var(--clr-primary)',
  },
  {
    key: 'heed',
    label: 'Heed',
    sub: 'What does it mean for me?',
    icon: '❤️',
    color: '#c0783a',
  },
  {
    key: 'hold',
    label: 'Hold',
    sub: 'What will I do today?',
    icon: '✋',
    color: '#7a4f28',
  },
  {
    key: 'help',
    label: 'Help',
    sub: 'Who can I share this with?',
    icon: '🤝',
    color: '#4a7c59',
  },
]

const AFFIRMATIONS = [
  'His mercies are new every morning.',
  'Be still, and know that He is God.',
  'Draw near to God, and He will draw near to you.',
  'The joy of the LORD is your strength.',
  'In quietness and trust is your strength.',
  'He restores my soul.',
]

export default function Today() {
  const { user } = useAuth()
  const router = useRouter()
  const [verse, setVerse] = useState(null)
  const [verseLoading, setVerseLoading] = useState(true)
  const [streak, setStreak] = useState(null)
  const [totalEntries, setTotalEntries] = useState(null)
  const [newBadge, setNewBadge] = useState(null)

  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      setVerse(v)
      setVerseLoading(false)
    })
    getStreakAndCount(user.id).then(({ streak, totalEntries }) => {
      setStreak(streak)
      setTotalEntries(totalEntries)
      if (streak > 0) {
        const badge = getNewBadge(streak)
        if (badge) setNewBadge(badge)
      }
    })
  }, [user])

  const greeting = getGreeting()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? ''
  const journeyDay = user ? getJourneyDay(user) : null
  const affirmation = AFFIRMATIONS[(journeyDay ?? 0) % AFFIRMATIONS.length]

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="page-container today-page">
      <BadgeModal badge={newBadge} onClose={() => setNewBadge(null)} />

      {/* ── Greeting ── */}
      <div className="today-greeting">
        <div className="today-greeting-text">
          <p className="today-eyebrow">{today}</p>
          <h1 className="today-title">
            {greeting}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="today-sub">{affirmation}</p>
        </div>
        {journeyDay && (
          <div className="today-day-badge">
            <span className="today-day-num">{journeyDay}</span>
            <span className="today-day-label">day{journeyDay !== 1 ? 's' : ''}<br />in Selah</span>
          </div>
        )}
      </div>

      {/* ── Verse Card ── */}
      <div className="today-verse-card">
        <div className="today-verse-card-inner">
          <span className="today-verse-glyph">✦</span>

          {verseLoading ? (
            <div className="today-verse-skeleton">
              <div className="skeleton-block" style={{ height: '14px', width: '120px', marginBottom: '16px' }} />
              <div className="skeleton-block" style={{ height: '20px', width: '100%', marginBottom: '10px' }} />
              <div className="skeleton-block" style={{ height: '20px', width: '90%', marginBottom: '10px' }} />
              <div className="skeleton-block" style={{ height: '20px', width: '80%' }} />
            </div>
          ) : verse ? (
            <>
              <p className="today-verse-ref">{verse.verse_reference}</p>
              <blockquote className="today-verse-text">
                &ldquo;{verse.verse_text.trim()}&rdquo;
              </blockquote>
            </>
          ) : (
            <p className="today-verse-offline">
              No verse loaded — check your connection and refresh.
            </p>
          )}

          <button
            className="today-begin-btn"
            onClick={() => router.push('/entry/new')}
          >
            Begin Today&apos;s Devotion
            <span className="today-begin-arrow">→</span>
          </button>
        </div>

        {/* decorative strip */}
        <div className="today-verse-accent" />
      </div>

      {/* ── 4H Pillars ── */}
      <div className="today-pillars-header">
        <h2 className="today-section-title">Your 4H Journey</h2>
        <p className="today-section-sub">Four lenses for today&apos;s Word</p>
      </div>

      <div className="today-pillars-grid">
        {H4_PILLARS.map((pillar) => (
          <button
            key={pillar.key}
            className="today-pillar-card"
            onClick={() => router.push('/entry/new')}
          >
            <span className="today-pillar-icon">{pillar.icon}</span>
            <strong className="today-pillar-label">{pillar.label}</strong>
            <p className="today-pillar-sub">{pillar.sub}</p>
          </button>
        ))}
      </div>

      {/* ── Quick Stats ── */}
      <div className="today-stats-row">
        <div className="today-stat">
          <span className="today-stat-icon">🔥</span>
          <div>
            <strong className="today-stat-val">
              {streak === null ? '—' : streak}
            </strong>
            <span className="today-stat-label">day streak</span>
          </div>
        </div>
        <div className="today-stat-divider" />
        <div className="today-stat">
          <span className="today-stat-icon">📓</span>
          <div>
            <strong className="today-stat-val">
              {totalEntries === null ? '—' : totalEntries}
            </strong>
            <span className="today-stat-label">entries logged</span>
          </div>
        </div>
        <div className="today-stat-divider" />
        <div className="today-stat">
          <span className="today-stat-icon">✦</span>
          <div>
            <strong className="today-stat-val">Day {journeyDay ?? '—'}</strong>
            <span className="today-stat-label">of your journey</span>
          </div>
        </div>
      </div>

    </div>
  )
}
