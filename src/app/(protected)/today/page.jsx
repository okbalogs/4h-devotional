"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser, getGreeting, getStreakAndCount, getCurrentPlanInfo, getUserPreferences } from '@/utils/dailyVerse'
import BadgeModal, { getNewBadge } from '@/components/BadgeModal'
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
  const [avatarUrl, setAvatarUrl] = useState(null)
  
  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      setVerse(v)
      setVerseLoading(false)
    })
    getUserPreferences(user.id).then((prefs) => {
      setPlanInfo(getCurrentPlanInfo(user, prefs.examMode))
      if (prefs.avatarUrl) setAvatarUrl(prefs.avatarUrl)
    })
    getStreakAndCount(user.id).then(({ streak, totalEntries, recentDays }) => {
      setStreak(streak)
      setTotalEntries(totalEntries)
      setRecentDays(recentDays || [])
      if (streak > 0) {
        const badge = getNewBadge(streak)
        if (badge) setNewBadge(badge)
      }
    })
  }, [user])

  const greeting = getGreeting()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Devotee'
  const initials = firstName.slice(0, 2).toUpperCase()
  


  return (
    <div className="page-container today-page">
      <BadgeModal badge={newBadge} onClose={() => setNewBadge(null)} />

      {/* Header */}
      <div className="today-header">
        <div>
          <div className="today-greeting-sub">{greeting},</div>
          <div className="today-greeting-name">{firstName} ✦</div>
        </div>
        <div className="today-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <span>{initials}</span>}
        </div>
      </div>

      {/* Streak Card */}
      <div className="today-streak-card">
        <div className="today-streak-header">
          <span className="today-streak-count">{streak}</span>
          <span className="today-streak-label">day streak</span>
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

      {/* Verse Card */}
      <div className="today-verse-card">
        <div className="today-verse-ref">TODAY &middot; {verse?.verse_reference?.toUpperCase() || 'LOADING...'}</div>
        
        {verseLoading ? (
          <div className="today-verse-skeleton">
            <div className="skeleton-line full"></div>
            <div className="skeleton-line long"></div>
            <div className="skeleton-line short"></div>
          </div>
        ) : verse ? (
          <div className="today-verse-text">
             &ldquo;{verse.verse_text.trim()}&rdquo;
          </div>
        ) : (
          <div className="today-verse-text">
             No verse loaded — check your connection.
          </div>
        )}
        
        <button className="today-action-btn" onClick={() => router.push('/entry/new')}>
          Open today&apos;s 4H &rarr;
        </button>
      </div>

      {/* Reading Plan */}
      <div className="today-plan-card">
        <div className="today-plan-header">
          <span className="today-plan-title">Reading plan &middot; {planInfo?.title || 'Loading...'}</span>
          <span className="today-plan-progress">Day {planInfo?.currentDay || 1}/{planInfo?.totalDays || 5}</span>
        </div>
        <div className="today-plan-bar-bg">
          <div className="today-plan-bar-fill" style={{ width: `${((planInfo?.currentDay || 1) / (planInfo?.totalDays || 5)) * 100}%` }}></div>
        </div>
      </div>

    </div>
  )
}
