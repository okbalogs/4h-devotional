'use client'
import { useState, useEffect } from 'react'
import { getStreakAndCount } from '@/utils/dailyVerse'
import { useAuth } from '@/context/AuthContext'
import { Trophy, Flame } from 'lucide-react'

export default function LeaderboardWidget() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    if (!user) return
    // Without Firestore we only have the current user's streak
    const { streak } = getStreakAndCount(user.id)
    if (streak > 2) {
      const name = user?.user_metadata?.full_name || 'Devotee'
      setLeaders([{ userId: user.id, streak, name }])
    }
  }, [user])

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
              <span style={{ marginLeft: '8px' }}>{leader.name || `Devotee ${leader.userId.substring(0, 4)}`}</span>
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
