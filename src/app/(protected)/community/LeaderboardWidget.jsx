'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { getStreakAndCount } from '@/utils/dailyVerse'
import { Trophy, Flame } from 'lucide-react'

export default function LeaderboardWidget() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaders() {
      try {
        // Find users who have posted recently to calculate their streaks
        // (For a small fellowship, we can fetch unique user IDs from recent entries)
        const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString()
        const { data: recentEntries } = await supabase
          .from('entries')
          .select('user_id')
          .gte('created_at', twoDaysAgo)

        if (!recentEntries || recentEntries.length === 0) {
          setLoading(false)
          return
        }

        const uniqueUserIds = [...new Set(recentEntries.map(e => e.user_id))]
        
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, is_admin') // Ideally we'd join with auth.users for names, but we'll fetch full_name from a view or just use initials
          .in('id', uniqueUserIds)

        // For simplicity, we calculate streaks for these active users
        const streakPromises = uniqueUserIds.map(async (userId) => {
          const { streak } = await getStreakAndCount(userId)
          return { userId, streak }
        })

        const streaksData = await Promise.all(streakPromises)
        
        // Sort by streak descending and take top 5
        const topStreaks = streaksData
          .filter(s => s.streak > 2) // Only show streaks > 2
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 5)

        setLeaders(topStreaks)
      } catch (err) {
        console.error("Error fetching leaderboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaders()
  }, [])

  if (loading) return <div className="skeleton-block" style={{ height: '100px', width: '100%', borderRadius: '8px' }} />
  if (leaders.length === 0) return null

  return (
    <div style={{ background: 'var(--clr-card)', border: '1px solid #f0e6d2', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
        <Trophy size={18} /> Consistency Leaders
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaders.map((leader, i) => (
          <div key={leader.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: '#555', fontWeight: 500 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{display: 'inline-block', width: '20px', textAlign: 'center'}}>{i+1}</span>}
              <span style={{ marginLeft: '8px' }}>Devotee {leader.userId.substring(0, 4)}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#d35400' }}>
              {leader.streak} <Flame size={14} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
