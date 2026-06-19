"use client"
import { useEffect } from 'react'
import { Sprout, Flame, Zap, Trophy, Gem, Crown, Star, Hand } from 'lucide-react'

export const BADGES = [
  { days: 3,   icon: <Sprout size={32} />, title: 'Seedling',    desc: '3 faithful days'     },
  { days: 7,   icon: <Flame size={32} />, title: 'On Fire',     desc: '7-day streak'        },
  { days: 14,  icon: <Zap size={32} />, title: 'Electrified', desc: '14 days devoted'     },
  { days: 30,  icon: <Trophy size={32} />, title: 'Champion',    desc: '30-day streak'       },
  { days: 60,  icon: <Gem size={32} />, title: 'Diamond',     desc: '60 days faithful'    },
  { days: 100, icon: <Crown size={32} />, title: 'Royal',       desc: '100-day streak'      },
  { days: 365, icon: <Star size={32} />, title: 'Stellar',     desc: 'One full year'       },
]

// Returns the highest milestone badge earned for a given streak, or null if none.
// Only returns the badge if it hasn't been shown before (uses localStorage).
export function getNewBadge(streak) {
  const earned = BADGES.filter((b) => streak >= b.days)
  if (!earned.length) return null
  const highest = earned[earned.length - 1]
  const key = `badge_seen_${highest.days}`
  if (localStorage.getItem(key)) return null
  localStorage.setItem(key, '1')
  return highest
}

export default function BadgeModal({ badge, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!badge) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [badge, onClose])

  if (!badge) return null

  return (
    <>
      <div className="badge-backdrop" onClick={onClose} />
      <div className="badge-modal" role="dialog" aria-modal="true">
        <div className="badge-sparkles" aria-hidden="true">✦ ✦ ✦</div>
        <div className="badge-emoji flex items-center justify-center">{badge.icon}</div>
        <h2 className="badge-title">{badge.title}</h2>
        <p className="badge-earned">New badge unlocked!</p>
        <p className="badge-desc">{badge.desc} — God sees your faithfulness.</p>
        <button className="badge-btn btn-primary flex items-center justify-center gap-2" onClick={onClose}>
          Praise God <Hand size={16} />
        </button>
      </div>
    </>
  )
}
