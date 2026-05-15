"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser, getJourneyDay, getGreeting } from '@/utils/dailyVerse'

export default function Today() {
  const { user } = useAuth()
  const router = useRouter()
  const [verse, setVerse] = useState(null)
  const [verseLoading, setVerseLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      setVerse(v)
      setVerseLoading(false)
    })
  }, [user])

  const greeting = getGreeting()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? ''
  const journeyDay = user ? getJourneyDay(user) : null

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: 'serif', color: '#333', marginBottom: '8px' }}>
        {greeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        {journeyDay ? `Day ${journeyDay} of your journey.` : 'Here is your devotional dashboard for today.'} Ready for Selah?
      </p>

      <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', minHeight: '160px' }}>
        {verseLoading ? (
          <div style={{ color: '#bbb', fontStyle: 'italic' }}>Loading today&apos;s verse...</div>
        ) : verse ? (
          <>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9d4f14', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {verse.verse_reference}
            </span>
            <p style={{ color: '#333', lineHeight: 1.8, marginTop: '14px', marginBottom: '20px', fontFamily: 'Georgia, serif', fontSize: '1.05rem' }}>
              {verse.verse_text}
            </p>
          </>
        ) : (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>Could not load today&apos;s verse. Check your connection.</p>
        )}

        <button
          style={{ padding: '12px 24px', backgroundColor: '#9d4f14', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
          onClick={() => router.push('/entry/new')}
        >
          Begin Reading
        </button>
      </div>
    </div>
  )
}
