'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLocalHighlights, saveLocalHighlight, deleteLocalHighlight } from '@/utils/offlineStorage'
import { Trash2, X } from 'lucide-react'
import './highlighting.css'

const COLORS = [
  { id: 'yellow', class: 'hl-yellow' },
  { id: 'green', class: 'hl-green' },
  { id: 'blue', class: 'hl-blue' },
  { id: 'pink', class: 'hl-pink' }
]

export default function HighlightableVerse({ verseText, verseRef }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  
  const [highlights, setHighlights] = useState([])
  const [selection, setSelection] = useState(null)
  const [toolbarPos, setToolbarPos] = useState(null)
  
  // Note Modal state
  const [activeHighlight, setActiveHighlight] = useState(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (user && verseRef) {
      setHighlights(getLocalHighlights(user.id, verseRef))
    }
  }, [user, verseRef])

  // Get exact offsets within the container text
  const getSelectionOffsets = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null
    
    const range = sel.getRangeAt(0)
    // Ensure the selection is inside our container
    if (!containerRef.current.contains(range.commonAncestorContainer)) return null

    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(containerRef.current)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    
    const start = preSelectionRange.toString().length
    const text = range.toString()
    
    return {
      start,
      end: start + text.length,
      text
    }
  }

  const handleSelection = (e) => {
    // Small delay to allow touch selection to complete
    setTimeout(() => {
      const offsets = getSelectionOffsets()
      if (!offsets || offsets.text.trim().length === 0) {
        setSelection(null)
        setToolbarPos(null)
        return
      }

      const sel = window.getSelection()
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      
      setSelection(offsets)
      setToolbarPos({
        top: rect.top - 50 + window.scrollY, // Position above selection
        left: rect.left + rect.width / 2
      })
    }, 50)
  }

  const applyHighlight = (colorId) => {
    if (!selection || !user) return

    const newHl = {
      startIndex: selection.start,
      endIndex: selection.end,
      text: selection.text,
      color: colorId,
      note: ''
    }

    const saved = saveLocalHighlight(user.id, verseRef, newHl)
    if (saved) {
      setHighlights([...highlights, saved])
    }
    
    window.getSelection().removeAllRanges()
    setSelection(null)
    setToolbarPos(null)
  }

  const openNoteModal = (hl) => {
    setActiveHighlight(hl)
    setNoteText(hl.note || '')
  }

  const saveNote = () => {
    if (!activeHighlight || !user) return
    const updated = { ...activeHighlight, note: noteText }
    saveLocalHighlight(user.id, verseRef, updated) // Overwrites since id is the same
    
    setHighlights(highlights.map(h => h.id === updated.id ? updated : h))
    setActiveHighlight(null)
  }

  const removeHighlight = () => {
    if (!activeHighlight || !user) return
    deleteLocalHighlight(user.id, verseRef, activeHighlight.id)
    setHighlights(highlights.filter(h => h.id !== activeHighlight.id))
    setActiveHighlight(null)
  }

  // Build the rendered text with highlight spans
  const renderVerse = () => {
    if (!highlights.length) return verseText

    // Sort highlights by start index
    const sorted = [...highlights].sort((a, b) => a.startIndex - b.startIndex)
    
    const elements = []
    let currentIndex = 0

    sorted.forEach((hl, i) => {
      if (hl.startIndex > currentIndex) {
        // Add plain text before this highlight
        elements.push(
          <span key={`text-${i}`}>
            {verseText.slice(currentIndex, hl.startIndex)}
          </span>
        )
      }
      
      // Add the highlighted text
      const colorClass = COLORS.find(c => c.id === hl.color)?.class || 'hl-yellow'
      elements.push(
        <span 
          key={hl.id} 
          className={`highlighted-text ${colorClass}`}
          onClick={() => openNoteModal(hl)}
          title={hl.note ? "View note" : "Add note"}
        >
          {verseText.slice(Math.max(currentIndex, hl.startIndex), hl.endIndex)}
        </span>
      )
      
      currentIndex = Math.max(currentIndex, hl.endIndex)
    })

    // Add remaining plain text
    if (currentIndex < verseText.length) {
      elements.push(
        <span key="text-end">
          {verseText.slice(currentIndex)}
        </span>
      )
    }

    return elements
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="today-verse-text" 
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
      >
        &ldquo;{renderVerse()}&rdquo;
      </div>

      {/* Floating Toolbar */}
      {selection && toolbarPos && (
        <div 
          className="highlight-toolbar" 
          style={{ top: toolbarPos.top, left: toolbarPos.left, transform: 'translateX(-50%)' }}
        >
          {COLORS.map(c => (
            <button
              key={c.id}
              className={`highlight-color-btn ${c.class}`}
              onClick={() => applyHighlight(c.id)}
            />
          ))}
        </div>
      )}

      {/* Note Modal */}
      {activeHighlight && (
        <div className="highlight-note-modal-overlay" onClick={() => setActiveHighlight(null)}>
          <div className="highlight-note-modal" onClick={e => e.stopPropagation()}>
            <h3>My Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a personal thought about this highlight..."
              autoFocus
            />
            <div className="highlight-note-actions">
              <button className="highlight-btn-delete" onClick={removeHighlight}>
                <Trash2 size={18} />
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="highlight-btn-cancel" onClick={() => setActiveHighlight(null)}>
                  Cancel
                </button>
                <button className="highlight-btn-save" onClick={saveNote}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
