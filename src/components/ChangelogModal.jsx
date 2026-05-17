"use client"
import { useState, useEffect } from 'react'

// Bump this key whenever you ship a new update so returning users see it once.
const SEEN_KEY = 'changelog_seen_v5'

const UPDATES = [
  {
    icon: '🔔',
    title: 'Daily devotion reminders',
    desc: 'Set a custom reminder time in Settings — fires even offline.',
  },
  {
    icon: '🔍',
    title: 'Entry search',
    desc: 'Search any entry by scripture, title, or reflection. Works offline too.',
  },
  {
    icon: '⬇',
    title: 'Export to PDF',
    desc: 'Save any devotion entry as a clean, printable PDF.',
  },
  {
    icon: '🏆',
    title: 'Streak badges',
    desc: 'Earn milestone badges at 3, 7, 14, 30, 100 days and beyond.',
  },
  {
    icon: '📵',
    title: 'Full offline mode',
    desc: 'Browse history, start new entries, and sync when back online.',
  },
  {
    icon: '🌙',
    title: 'Redesigned dark mode & navbar',
    desc: 'A warmer, more refined look across the entire app.',
  },
]

export default function ChangelogModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      // Short delay so the page settles before the popup appears
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div className="changelog-backdrop" onClick={dismiss} />
      <div className="changelog-modal" role="dialog" aria-modal="true" aria-label="What's new">

        <div className="changelog-header">
          <span className="changelog-glyph">✦</span>
          <div>
            <h2 className="changelog-title">What&apos;s New</h2>
            <p className="changelog-subtitle">Editorial Devotion · Latest Update</p>
          </div>
        </div>

        <ul className="changelog-list">
          {UPDATES.map((item) => (
            <li key={item.title} className="changelog-item">
              <span className="changelog-item-icon">{item.icon}</span>
              <div>
                <strong className="changelog-item-title">{item.title}</strong>
                <p className="changelog-item-desc">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <button className="btn-primary changelog-btn" onClick={dismiss}>
          Continue →
        </button>
      </div>
    </>
  )
}
