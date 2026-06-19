"use client"
import { useState, useEffect } from 'react'
import { GraduationCap, Save, AlertTriangle, Mail, Search, BookOpen } from 'lucide-react'

// Bump this key whenever you ship a new update so returning users see it once.
const SEEN_KEY = 'changelog_seen_v6'

const UPDATES = [
  {
    icon: <GraduationCap size={20} className="text-[#9d4f14]" />,
    title: 'Interactive Courses Hub',
    desc: 'Search courses and filter by category in real-time with refined UI card layouts.',
  },
  {
    icon: <Save size={20} className="text-[#9d4f14]" />,
    title: 'Auto-Save Devotions',
    desc: 'Your active quiet time logs are saved locally as you type to prevent data loss.',
  },
  {
    icon: <AlertTriangle size={20} className="text-[#9d4f14]" />,
    title: 'Unsaved Work Protection',
    desc: 'Warns you before navigating away from active edits or unsaved devotional logs.',
  },
  {
    icon: <Mail size={20} className="text-[#9d4f14]" />,
    title: 'Functional Support Form',
    desc: 'Easily submit support tickets, testaments, or account queries with validate fields.',
  },
  {
    icon: <Search size={20} className="text-[#9d4f14]" />,
    title: 'Accessibility Boost',
    desc: 'Re-enabled standard browser pinch-to-zoom and configured SEO title templating.',
  },
  {
    icon: <BookOpen size={20} className="text-[#9d4f14]" />,
    title: 'Custom 404 Not Found Page',
    desc: 'Beautifully styled missing page layout that guides you back to your sanctuary.',
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
              <span className="changelog-item-icon flex items-center justify-center">{item.icon}</span>
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
