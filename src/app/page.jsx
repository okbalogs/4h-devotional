"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PRIMARY = '#5C3D2E'
const PRIMARY_LIGHT = 'rgba(92,61,46,0.08)'
const PRIMARY_GLOW = 'rgba(92,61,46,0.25)'
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #5C3D2E, #7B5B3A)'
const TEXT_MUTED = '#8a877f'

const pillars = [
  { step: 'H1', title: 'Head', sub: 'What does God say?' },
  { step: 'H2', title: 'Heart', sub: 'How does it convict me?' },
  { step: 'H3', title: 'Hand', sub: 'What will I do today?' },
  { step: 'H4', title: 'Help', sub: 'Who can I serve?' },
]

const DEMO_STEPS = ['Head', 'Heart', 'Hand', 'Help']
const DEMO_PROMPTS = {
  Head: 'What does this passage say? Write it in your own words…',
  Heart: 'What does this stir in your heart? What conviction or comfort do you feel?',
  Hand: 'What one specific action will you take today because of this?',
  Help: 'Who in your life needs to hear this truth today?',
}
const DEMO_VERSE = 'Psalm 46:10 — "Be still, and know that I am God."'

export default function Landing() {
  const [demoStep, setDemoStep] = useState('Head')
  const [demoTexts, setDemoTexts] = useState({ Head: '', Heart: '', Hand: '', Help: '' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentIdx = DEMO_STEPS.indexOf(demoStep)
  const isLast = currentIdx === DEMO_STEPS.length - 1

  return (
    <main
      className={`transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)', minHeight: '100vh' }}
    >
      {/* ─── HERO ─── */}
      <section style={{ position: 'relative', paddingTop: '10rem', paddingBottom: '6rem', overflow: 'hidden' }}>
        {/* Warm glowing orb */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '600px', borderRadius: '50%', opacity: 0.25,
            background: 'radial-gradient(ellipse, rgba(92,61,46,0.25) 0%, transparent 70%)'
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '56rem', margin: '0 auto', textAlign: 'center', padding: '0 1.5rem' }}>
          {/* Eyebrow Tag */}
          <div
            className="animate-fade-in-up"
            style={{ marginBottom: '1.75rem' }}
          >
            <span
              style={{
                color: PRIMARY,
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                opacity: 0.9,
              }}
            >
              For ECWA Believers &bull; The 4H Method
            </span>
          </div>

          <h1
            className="animate-fade-in-up"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '2rem', animationDelay: '100ms' }}
          >
            Your daily <em style={{ fontStyle: 'italic' }}>Quiet Time</em>,<br />
            <span style={{ color: PRIMARY }}>
              structured &amp; sacred.
            </span>
          </h1>

          <p
            className="animate-fade-in-up"
            style={{ fontSize: '1.25rem', maxWidth: '40rem', margin: '0 auto 3rem', lineHeight: 1.7, color: TEXT_MUTED, animationDelay: '200ms' }}
          >
            The ECWA 4H method — Head, Heart, Hand, Help — reimagined for the modern believer.
            A beautifully tailored, distraction-free space to engage with God's word every morning.
          </p>

          <div className="animate-fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', animationDelay: '300ms' }}>
            <Link
              href="/signup"
              style={{
                padding: '1rem 2.25rem', borderRadius: '1.25rem', fontWeight: 600, fontSize: '1.125rem',
                color: '#fff', textDecoration: 'none',
                background: PRIMARY_GRADIENT,
                boxShadow: `0 12px 36px ${PRIMARY_GLOW}`,
                transition: 'all 0.3s ease', display: 'inline-block',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Begin Your Journey
            </Link>
            <Link
              href="/explore"
              style={{
                padding: '1rem 2.25rem', borderRadius: '1.25rem', fontWeight: 500, fontSize: '1.125rem',
                textDecoration: 'none', transition: 'all 0.3s ease', display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.65)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                color: PRIMARY,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Learn the 4H Method →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4H PILLARS ─── */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: PRIMARY, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', display: 'block', marginBottom: '1rem' }}>
              THE 4H FRAMEWORK
            </span>
            <h2 style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Four questions.<br />One faithful morning.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {pillars.map(({ step, title, sub }) => (
              <div
                key={step}
                style={{
                  padding: '2.25rem 2rem', borderRadius: '1.75rem', cursor: 'default',
                  background: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  boxShadow: '0 8px 32px 0 rgba(92, 61, 46, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(92, 61, 46, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
                  e.currentTarget.style.borderColor = 'rgba(92, 61, 46, 0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(92, 61, 46, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.75)'
                }}
              >
                <span style={{ display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: '0.625rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: PRIMARY_LIGHT, color: PRIMARY, marginBottom: '1rem' }}>
                  {step}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#2d2b29' }}>{title}</h3>
                <p style={{ fontSize: '0.925rem', lineHeight: 1.65, color: TEXT_MUTED }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto', borderRadius: '2.75rem', overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #23201e 0%, #34302d 50%, #23201e 100%)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
        }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', borderRadius: '50%', opacity: 0.35, background: `radial-gradient(circle, rgba(196,154,108,0.2) 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(2rem, 5vw, 5rem)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'start' }}>
              {/* Left side */}
              <div>
                <span style={{ color: '#C49A6C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', display: 'block', marginBottom: '1rem' }}>TRY IT NOW</span>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
                  See how a devotion feels.
                </h2>
                <p style={{ color: '#a09890', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                  Pick up today's verse and write your first reflection. No account needed, just you and the Word.
                </p>
                {/* Glass Quote Box */}
                <div style={{
                  padding: '1.75rem', borderRadius: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                }}>
                  <p style={{ fontSize: '1.25rem', color: '#e8e0d8', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;Be still, and know that I am God.&rdquo;
                  </p>
                  <p style={{ color: '#C49A6C', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.75rem' }}>
                    Psalm 46:10
                  </p>
                </div>
              </div>

              {/* Right side - Glass Demo card */}
              <div style={{
                borderRadius: '1.75rem', padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                background: 'rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {DEMO_STEPS.map((s, i) => {
                    const isActive = demoStep === s
                    const isDone = i < currentIdx
                    return (
                      <button
                        key={s}
                        onClick={() => setDemoStep(s)}
                        style={{
                          flexShrink: 0, padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                          fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: isActive ? PRIMARY : isDone ? 'rgba(255,255,255,0.12)' : 'transparent',
                          color: isActive ? '#fff' : isDone ? '#c4baa8' : '#7a7268',
                          boxShadow: isActive ? `0 4px 20px ${PRIMARY_GLOW}` : 'none',
                        }}
                      >
                        {isDone && '✓ '}{s}
                      </button>
                    )
                  })}
                </div>

                <textarea
                  style={{
                    width: '100%', minHeight: '160px', background: 'transparent',
                    border: 'none', outline: 'none', color: '#fff', fontSize: '1.125rem',
                    resize: 'none', marginBottom: '1.5rem', caretColor: '#C49A6C',
                    fontFamily: 'inherit', lineHeight: 1.7,
                  }}
                  placeholder={DEMO_PROMPTS[demoStep]}
                  value={demoTexts[demoStep]}
                  onChange={e => setDemoTexts(prev => ({ ...prev, [demoStep]: e.target.value }))}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '1rem' }}>
                  <span style={{ color: '#7a7268', fontSize: '0.875rem', fontWeight: 500 }}>
                    Step {currentIdx + 1} of {DEMO_STEPS.length}
                  </span>

                  {isLast ? (
                    <Link href="/signup" style={{
                      padding: '0.75rem 1.75rem', borderRadius: '0.75rem', color: '#fff',
                      fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                      background: PRIMARY, boxShadow: `0 4px 16px ${PRIMARY_GLOW}`,
                      transition: 'all 0.3s ease',
                    }}>
                      Save Entry →
                    </Link>
                  ) : (
                    <button
                      onClick={() => setDemoStep(DEMO_STEPS[currentIdx + 1])}
                      style={{
                        padding: '0.75rem 1.75rem', borderRadius: '0.75rem', color: '#fff',
                        fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.12)', transition: 'all 0.3s ease',
                      }}
                    >
                      Next: {DEMO_STEPS[currentIdx + 1]} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>
            Thousands of Nigerian believers journal here every morning.
          </h2>
          <p style={{ fontSize: '1.125rem', color: TEXT_MUTED, marginBottom: '3rem', lineHeight: 1.7 }}>
            From Lagos to Kaduna, Enugu to Abuja — join a growing community anchoring their day in God's word before the world pulls them away.
          </p>
          <Link href="/signup" style={{
            display: 'inline-flex', padding: '1.25rem 2.75rem', borderRadius: '9999px',
            fontWeight: 700, fontSize: '1.125rem', color: '#fff', textDecoration: 'none',
            background: PRIMARY_GRADIENT,
            boxShadow: `0 12px 36px ${PRIMARY_GLOW}`,
            transition: 'all 0.3s ease',
          }}>
            Start for Free
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </main>
  )
}
