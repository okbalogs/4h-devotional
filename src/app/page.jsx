"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import hero from "../assets/images/hero.png"
import { useScrollReveal } from '@/hooks/useScrollReveal'

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

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Editorial Devotion',
  url: 'https://4h-devotional.vercel.app',
  description: 'Your 4H Quiet Time Sanctuary. Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Editorial Devotion',
  url: 'https://4h-devotional.vercel.app',
  logo: 'https://4h-devotional.vercel.app/icons/icon-512.png',
  description: 'A digital sanctuary for daily selah using the 4H framework (Head, Heart, Hand, Help) for ECWA and global believers.',
};

const jsonLd = [websiteJsonLd, organizationJsonLd];

export default function Landing() {
  const pillarsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const [demoStep, setDemoStep] = useState('Head')
  const [demoTexts, setDemoTexts] = useState({ Head: '', Heart: '', Hand: '', Help: '' })

  const currentIdx = DEMO_STEPS.indexOf(demoStep)
  const isLast = currentIdx === DEMO_STEPS.length - 1

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* ─── HERO ─── */}
      <section className="hero-section">
        <div className="hero-text">
          <span className="section-tag">FOR ECWA BELIEVERS</span>
          <h1>
            Your daily <em>Quiet Time</em>,<br />structured and sacred.
          </h1>
          <p>
            The ECWA 4H method — Head, Heart, Hand, Help — is a proven framework
            for engaging God's word with your whole self. Editorial Devotion gives
            you a private, distraction-free space to practise it every morning.
          </p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn-primary">Begin Your Journey</Link>
            <Link href="/explore" className="btn-outline">Learn the 4H Method</Link>
          </div>
        </div>
        <div className="hero-image">
          <Image
            src={hero}
            alt="Open Bible and pen for morning quiet time"
            priority
            placeholder="blur"
          />
          <span className="hero-badge">&ldquo;Be still, and know…&rdquo;</span>
        </div>
      </section>

      {/* ─── 4H PILLS ─── */}
      <section ref={pillarsRef} className="pillars-section reveal">
        <span className="section-tag">THE 4H FRAMEWORK</span>
        <h2>Four questions. One faithful morning.</h2>
        <p className="pillars-sub">
          Every devotional entry you write walks through four intentional steps.
          <Link href="/explore" className="pillars-more"> See how it works →</Link>
        </p>
        <div className="pillars-row">
          {pillars.map(({ step, title, sub }) => (
            <div className="pillar-pill" key={step}>
              <span className="pillar-step">{step}</span>
              <strong>{title}</strong>
              <span className="pillar-sub">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section className="demo-section">
        <div className="demo-inner">
          <div className="demo-header">
            <span className="section-tag" style={{ textAlign: 'left' }}>TRY IT NOW</span>
            <h2>See how a devotion feels</h2>
            <p>Pick up today's verse and write your first reflection. No account needed.</p>
          </div>

          <div className="demo-card">
            <div className="demo-verse">{DEMO_VERSE}</div>

            <div className="demo-tabs">
              {DEMO_STEPS.map((s, i) => (
                <button
                  key={s}
                  className={`demo-tab ${demoStep === s ? 'demo-tab--active' : ''} ${i < currentIdx ? 'demo-tab--done' : ''}`}
                  onClick={() => setDemoStep(s)}
                >
                  {i < currentIdx ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>

            <textarea
              className="demo-textarea"
              placeholder={DEMO_PROMPTS[demoStep]}
              value={demoTexts[demoStep]}
              onChange={e => setDemoTexts(prev => ({ ...prev, [demoStep]: e.target.value }))}
              rows={4}
            />

            <div className="demo-footer">
              {isLast ? (
                <Link href="/signup" className="btn-primary" style={{ border: 'none' }}>
                  Save this entry — Sign up free →
                </Link>
              ) : (
                <button
                  className="btn-primary"
                  style={{ border: 'none' }}
                  onClick={() => setDemoStep(DEMO_STEPS[currentIdx + 1])}
                >
                  Next: {DEMO_STEPS[currentIdx + 1]} →
                </button>
              )}
              <span className="demo-hint">
                Step {currentIdx + 1} of {DEMO_STEPS.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section ref={ctaRef} className="cta-section reveal">
        <h2>Thousands of Nigerian believers journal here every morning.</h2>
        <p>
          From Lagos to Kaduna, Enugu to Abuja — join a growing community
          anchoring their day in God's word before the world pulls them away.
        </p>
        <Link href="/signup" className="btn-primary btn-lg">
          Start for Free
        </Link>
      </section>
    </main>
  )
}
