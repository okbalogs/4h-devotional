"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../entry.css'
import './new.css'
import { auth } from '@/utils/firebase'
import { useAuth } from '@/context/AuthContext'
import { getTodayVerseForUser } from '@/utils/dailyVerse'
import { queueEntry, saveLocalEntry } from '@/utils/offlineStorage'
import { notifyUser } from '@/utils/pushManager'
import { FileText } from 'lucide-react'
import VerseAudioPlayer from '@/components/VerseAudioPlayer'
import AiInsightsPanel from '@/components/AiInsightsPanel'
import HighlightableVerse from '@/components/HighlightableVerse'

const DRAFT_KEY = 'devotion_draft'

const STEPS = [
  { id: 'hear', title: 'Head', placeholder: 'What does the Word say?' },
  { id: 'heed', title: 'Heart', placeholder: 'What does it mean for me?' },
  { id: 'hold', title: 'Hand', placeholder: 'What will I do today?' },
  { id: 'help', title: 'Help', placeholder: 'Who can I share this with? (And wrap up)' }
]

export default function NewEntry() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)

  const [scriptureRef, setScriptureRef] = useState('')
  const [verseText, setVerseText] = useState('')

  const [formData, setFormData] = useState({
    hear: '',
    heed: '',
    hold: '',
    help: '',
    lingeringThought: ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedOffline, setSavedOffline] = useState(false)
  const [activePartnership, setActivePartnership] = useState(null)
  const [shareWithPartner, setShareWithPartner] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getTodayVerseForUser(user).then((v) => {
      if (v?.verse_reference) setScriptureRef(v.verse_reference)
      if (v?.verse_text) setVerseText(v.verse_text)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchPartner = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch('/api/community/partners/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setActivePartnership(data)
        }
      } catch (err) {}
    }
    fetchPartner()
  }, [user])

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.scriptureRef) setScriptureRef(draft.scriptureRef)
        setFormData(prev => ({ ...prev, ...draft }))
        setDraftRestored(true)
      }
    } catch {}
  }, [])

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      const fields = { scriptureRef, ...formData }
      const hasContent = Object.values(fields).some(v => v && v.trim())
      if (hasContent) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(fields))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [scriptureRef, formData])

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const entryPayload = () => ({
    user_id: user.id,
    scripture_reference: scriptureRef,
    verse_text: verseText,
    hear: formData.hear,
    heed: formData.heed,
    hold: formData.hold,
    help: formData.help,
    lingering_thought: formData.lingeringThought,
  })

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    if (!navigator.onLine) {
      queueEntry(entryPayload())
      localStorage.removeItem(DRAFT_KEY)
      setSaving(false)
      setSavedOffline(true)
      return
    }

    try {
      const token = await auth.currentUser?.getIdToken()
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers,
        body: JSON.stringify(entryPayload())
      })

      if (!res.ok) throw new Error('Failed to save entry')
      const data = await res.json()

      // Persist to localStorage (primary storage — no Firestore)
      const saved = saveLocalEntry(user.id, data)
      const entryId = saved?.id || data.id

      localStorage.removeItem(DRAFT_KEY)

      if (shareWithPartner && activePartnership && formData.lingeringThought.trim()) {
        const senderName = user?.user_metadata?.full_name || 'Devotee'
        
        await fetch('/api/community/messages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            partnership_id: activePartnership.id,
            sender_name: senderName,
            type: 'note',
            content: formData.lingeringThought.trim()
          })
        })

        // For now, assume partner_id could be stored in activePartnership
        const partnerId = activePartnership.requester_id === user.id ? activePartnership.partner_id : activePartnership.requester_id
        if (partnerId) notifyUser(partnerId, 'note', 'Devotion note shared', `${senderName} shared a lingering thought with you`, '/community?tab=partners')
      }

      router.push(`/entry/${entryId}`)
    } catch (err) {
      if (!navigator.onLine || err.message?.includes('fetch')) {
        queueEntry(entryPayload())
        localStorage.removeItem(DRAFT_KEY)
        setSaving(false)
        setSavedOffline(true)
      } else {
        setError(err.message)
        setSaving(false)
      }
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      handleSave()
    }
  }

  const handleCancel = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1)
    } else {
      router.push('/today')
    }
  }

  const step = STEPS[currentStep]

  if (savedOffline) {
    return (
      <div className="new-entry-page flex flex-col items-center justify-center min-h-screen text-center p-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--clr-primary)', marginBottom: '16px' }}>Saved Offline</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '24px' }}>Your entry is safely stored and will sync when you are back online.</p>
        <button className="new-action-btn" onClick={() => router.push('/today')}>Back to Home</button>
      </div>
    )
  }

  return (
    <div className="new-entry-page">
      {draftRestored && (
        <div className="new-draft-banner">
          <span className="flex items-center gap-2"><FileText size={16} /> Draft restored</span>
          <button onClick={() => { setFormData({hear:'',heed:'',hold:'',help:'',lingeringThought:''}); localStorage.removeItem(DRAFT_KEY); setDraftRestored(false) }}>Discard</button>
        </div>
      )}

      {/* Header */}
      <div className="new-header">
        <button className="new-header-btn" onClick={handleCancel}>
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>
        
        <div className="new-header-progress">
          <span className="new-progress-text">{currentStep + 1}/{STEPS.length}</span>
          <div className="new-progress-bars">
            {STEPS.map((_, i) => (
              <div key={i} className={`new-progress-bar ${i <= currentStep ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <button className="new-header-btn save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="new-content">
        {/* Verse display above the input for context */}
        <div className="new-verse-context">
          <span className="new-verse-ref">{scriptureRef}</span>
          {verseText ? (
            <HighlightableVerse verseText={verseText} verseRef={scriptureRef} />
          ) : (
            <p className="new-verse-text">Loading...</p>
          )}
          {verseText && (
            <>
              <VerseAudioPlayer verseText={verseText} verseRef={scriptureRef} />
              <AiInsightsPanel verseText={verseText} verseRef={scriptureRef} activeTab={step.id} />
            </>
          )}
        </div>

        <h1 className="new-step-title">{step.title}</h1>
        
        <textarea
          className="new-textarea"
          placeholder={step.placeholder}
          value={formData[step.id]}
          onChange={(e) => handleTextChange(step.id, e.target.value)}
          autoFocus
        />

        {currentStep === 3 && (
          <div className="new-lingering-section">
            <h3 className="new-lingering-title">Lingering Thought</h3>
            <textarea
              className="new-textarea lingering"
              placeholder="A core takeaway from today..."
              value={formData.lingeringThought}
              onChange={(e) => handleTextChange('lingeringThought', e.target.value)}
            />
            {activePartnership && (
              <label className="share-partner-check">
                <input type="checkbox" checked={shareWithPartner} onChange={e => setShareWithPartner(e.target.checked)} />
                Share this thought with my accountability partner
              </label>
            )}
          </div>
        )}
      </div>

      <div className="new-footer">
        <button className="new-action-btn" onClick={handleNext}>
          {currentStep === STEPS.length - 1 ? 'Finish & Save' : 'Next'}
        </button>
        {error && <p className="new-error">{error}</p>}
        {draftSaved && <p className="new-saved-indicator">Draft saved ✓</p>}
      </div>
    </div>
  )
}
