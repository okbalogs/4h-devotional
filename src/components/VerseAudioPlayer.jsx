'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import './verse-audio-player.css'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5]

export default function VerseAudioPlayer({ verseText, verseRef }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [supported, setSupported] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)

  const utteranceRef = useRef(null)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const estimatedDurationRef = useRef(0)

  // Check browser support
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const estimateDuration = useCallback((text, rate) => {
    // Average speaking rate is ~150 words per minute at 1x
    const words = text.split(/\s+/).length
    const wpm = 150 * rate
    return (words / wpm) * 60 * 1000 // duration in ms
  }, [])

  const startProgressTracking = useCallback((duration) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startTimeRef.current = Date.now()
    estimatedDurationRef.current = duration

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(intervalRef.current)
    }, 50)
  }, [])

  const handlePlay = useCallback(() => {
    if (!verseText || !supported) return

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      // Resume progress tracking
      const remaining = estimatedDurationRef.current * (1 - progress / 100)
      startTimeRef.current = Date.now() - (estimatedDurationRef.current - remaining)
      startProgressTracking(estimatedDurationRef.current)
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const cleanText = verseText.replace(/[""]/g, '"').replace(/['']/g, "'")
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = speed
    utterance.pitch = 1
    utterance.volume = 1

    // Try to get a natural English voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    // Word boundary tracking
    const words = cleanText.split(/\s+/)
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Find word index based on char index
        let charCount = 0
        for (let i = 0; i < words.length; i++) {
          if (charCount >= event.charIndex) {
            setCurrentWordIndex(i)
            break
          }
          charCount += words[i].length + 1
        }
      }
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(100)
      setCurrentWordIndex(-1)
      if (intervalRef.current) clearInterval(intervalRef.current)
      // Reset progress after a moment
      setTimeout(() => setProgress(0), 1500)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentWordIndex(-1)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)

    const duration = estimateDuration(cleanText, speed)
    startProgressTracking(duration)
  }, [verseText, supported, isPaused, speed, progress, estimateDuration, startProgressTracking])

  const handlePause = useCallback(() => {
    if (!isPlaying) return
    window.speechSynthesis.pause()
    setIsPaused(true)
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [isPlaying])

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    setCurrentWordIndex(-1)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed)
    // If currently playing, restart with new speed
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel()
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
      setCurrentWordIndex(-1)
      // Small delay then auto-play with new speed
      setTimeout(() => {
        const cleanText = verseText.replace(/[""]/g, '"').replace(/['']/g, "'")
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = newSpeed
        utterance.pitch = 1
        utterance.volume = 1

        const voices = window.speechSynthesis.getVoices()
        const preferred = voices.find(v =>
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
        ) || voices.find(v => v.lang.startsWith('en'))
        if (preferred) utterance.voice = preferred

        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          setProgress(100)
          setCurrentWordIndex(-1)
          if (intervalRef.current) clearInterval(intervalRef.current)
          setTimeout(() => setProgress(0), 1500)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)

        const duration = estimateDuration(cleanText, newSpeed)
        startProgressTracking(duration)
      }, 100)
    }
  }, [isPlaying, isPaused, verseText, estimateDuration, startProgressTracking])

  if (!supported) {
    return (
      <div className="verse-player verse-player--unsupported">
        <VolumeX size={16} />
        <span>Audio not supported in this browser</span>
      </div>
    )
  }

  if (!verseText) return null

  return (
    <div className={`verse-player ${isPlaying ? 'verse-player--active' : ''}`}>
      {/* Progress Bar */}
      <div className="verse-player-progress-track">
        <div
          className="verse-player-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="verse-player-body">
        {/* Play/Pause Controls */}
        <div className="verse-player-controls">
          {isPlaying ? (
            <button
              className="verse-player-btn verse-player-btn--pause"
              onClick={handlePause}
              aria-label="Pause"
              title="Pause"
            >
              <Pause size={18} />
            </button>
          ) : (
            <button
              className="verse-player-btn verse-player-btn--play"
              onClick={handlePlay}
              aria-label={isPaused ? 'Resume' : 'Play'}
              title={isPaused ? 'Resume' : 'Listen to verse'}
            >
              <Play size={18} />
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              className="verse-player-btn verse-player-btn--stop"
              onClick={handleStop}
              aria-label="Stop"
              title="Stop"
            >
              <Square size={14} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="verse-player-info">
          <span className="verse-player-label">
            <Volume2 size={13} />
            {isPlaying ? 'Listening...' : isPaused ? 'Paused' : 'Listen to verse'}
          </span>
          {verseRef && (
            <span className="verse-player-ref">{verseRef}</span>
          )}
        </div>

        {/* Speed Selector */}
        <div className="verse-player-speed">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              className={`verse-player-speed-pill ${speed === s ? 'active' : ''}`}
              onClick={() => handleSpeedChange(s)}
              title={`${s}× speed`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
