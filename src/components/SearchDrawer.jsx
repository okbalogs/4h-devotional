"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

function searchLocalCache(q) {
  const lower = q.toLowerCase()
  const all = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('cached_history_')) {
        const entries = JSON.parse(localStorage.getItem(key) || '[]')
        all.push(...entries)
      }
    }
  } catch {}
  const seen = new Set()
  return all
    .filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return (
        e.title?.toLowerCase().includes(lower) ||
        e.hear?.toLowerCase().includes(lower) ||
        e.scripture_reference?.toLowerCase().includes(lower)
      )
    })
    .slice(0, 20)
}

export default function SearchDrawer({ open, onClose }) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (open) {
      setIsOffline(!navigator.onLine)
      // Small delay so CSS transition finishes before focus
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    } else {
      setQuery('')
      setResults([])
      setLoading(false)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSearch = (q) => {
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    setLoading(true)

    debounceRef.current = setTimeout(async () => {
      if (!navigator.onLine) {
        setResults(searchLocalCache(q))
        setLoading(false)
        return
      }
      try {
        const { data } = await supabase
          .from('entries')
          .select('id, title, scripture_reference, hear, created_at')
          .eq('user_id', user.id)
          .or(`title.ilike.%${q}%,scripture_reference.ilike.%${q}%,hear.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(20)
        setResults(data ?? [])
      } catch {
        setResults(searchLocalCache(q))
      }
      setLoading(false)
    }, 300)
  }

  if (!open) return null

  return (
    <>
      <div className="search-backdrop" onClick={onClose} />
      <div className="search-drawer" role="dialog" aria-modal="true" aria-label="Search entries">
        <div className="search-input-wrap">
          <svg className="search-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search entries, scriptures, reflections…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="search-close-btn" onClick={onClose} aria-label="Close search">✕</button>
        </div>

        {isOffline && (
          <p className="search-offline-note">📵 Offline — searching cached entries only</p>
        )}

        <div className="search-results">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-block" style={{ height: '72px', borderRadius: '10px' }} />
              ))}
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="search-empty">No entries found for &ldquo;{query}&rdquo;</p>
          )}

          {!loading && !query.trim() && (
            <p className="search-hint">Start typing to search your devotion entries.</p>
          )}

          {!loading && results.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="search-result-card"
              onClick={onClose}
            >
              <div className="search-result-meta">
                <span className="search-result-date">
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                {entry.scripture_reference && (
                  <span className="search-result-ref">{entry.scripture_reference}</span>
                )}
              </div>
              <strong className="search-result-title">{entry.title || 'Untitled Entry'}</strong>
              {entry.hear && (
                <p className="search-result-preview">
                  {entry.hear.length > 110 ? entry.hear.slice(0, 110) + '…' : entry.hear}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
