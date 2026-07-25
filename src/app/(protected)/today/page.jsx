"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser, getGreeting, getStreakAndCount, getCurrentPlanInfo, getUserPreferences } from '@/utils/dailyVerse'
import BadgeModal, { getNewBadge } from '@/components/BadgeModal'
import { Flame, BookOpen, Sparkles, ArrowRight, BookMarked } from 'lucide-react'
import VerseAudioPlayer from '@/components/VerseAudioPlayer'
import HighlightableVerse from '@/components/HighlightableVerse'
import './today.css'

export default function Today() {
  const { user } = useAuth()
  const router = useRouter()
  const [verse, setVerse] = useState(null)
  const [verseLoading, setVerseLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [recentDays, setRecentDays] = useState([])
  const [planInfo, setPlanInfo] = useState(null)
  const [newBadge, setNewBadge] = useState(null)
  
  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      setVerse(v)
      setVerseLoading(false)
    })
    getUserPreferences(user.id).then((prefs) => {
      setPlanInfo(getCurrentPlanInfo(user, prefs.examMode))
    })
    const { streak: s, totalEntries: t, recentDays: r } = getStreakAndCount(user.id)
    setStreak(s)
    setTotalEntries(t)
    setRecentDays(r || [])
    if (s > 0) {
      const badge = getNewBadge(s)
      if (badge) setNewBadge(badge)
    }
  }, [user])

  const greeting = getGreeting()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Devotee'

  return (
    <div className="page-container today-page">
      <BadgeModal badge={newBadge} onClose={() => setNewBadge(null)} />

      {/* Header */}
      <div className="today-header">
        <div>
          <div className="today-greeting-sub">{greeting}</div>
          <h1 className="today-greeting-name">{firstName}</h1>
        </div>
      </div>

      {/* Streak Card */}
      <div className="today-glass-card today-streak-card">
        <div className="today-streak-header">
          <div className="today-streak-info">
            <span className="today-streak-count">{streak}</span>
            <span className="today-streak-label">day streak</span>
          </div>
          <div className="today-flame-icon">
            <Flame size={24} />
          </div>
        </div>

        <div className="today-streak-week">
          {recentDays.map((d, i) => (
             <div key={i} className="today-streak-day">
               <span>{d.label}</span>
               <span className={`today-streak-dot ${d.filled ? 'filled' : ''}`}></span>
             </div>
          ))}
        </div>
      </div>

      {/* Scripture Verse Card */}
      <div className="today-glass-card today-verse-card">
        <div className="today-verse-head">
          <span className="today-verse-badge">
            <Sparkles size={13} />
            {verse?.verse_reference || 'TODAY\'S WORD'}
          </span>
        </div>
        
        {verseLoading ? (
          <div className="today-verse-skeleton">
            <div className="skeleton-line full"></div>
            <div className="skeleton-line long"></div>
            <div className="skeleton-line short"></div>
          </div>
        ) : verse ? (
          <HighlightableVerse verseText={verse.verse_text.trim()} verseRef={verse.verse_reference} />
        ) : (
          <div className="today-verse-text">
             No verse loaded — check your connection.
          </div>
        )}
        
        {/* Audio Player */}
        {!verseLoading && verse && (
          <VerseAudioPlayer 
            verseText={verse.verse_text} 
            verseRef={verse.verse_reference} 
          />
        )}

        <button className="today-action-btn" onClick={() => router.push('/entry/new')}>
          <span>Open Today&apos;s 4H Framework</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Reading Plan Card */}
      {planInfo && (
        <div className="today-glass-card today-plan-card">
          <div className="today-plan-header">
            <div className="flex items-center gap-2">
              <BookMarked size={18} className="text-amber-600" />
              <span className="today-plan-title">{planInfo.title || 'Reading Plan'}</span>
            </div>
            <span className="today-plan-progress">Day {planInfo.currentDay || 1}/{planInfo.totalDays || 5}</span>
          </div>
          <div className="today-plan-bar-bg">
            <div 
              className="today-plan-bar-fill" 
              style={{ width: `${Math.min(100, Math.max(5, ((planInfo.currentDay || 1) / (planInfo.totalDays || 5)) * 100))}%` }} 
            />
          </div>
        </div>
      )}

    </div>
  )
}
