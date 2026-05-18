'use client'
import { useState } from 'react'
import Link from 'next/link'

const courses = [
  {
    tag: 'Foundations',
    title: 'Introduction to the 4H Quiet Time Method',
    instructor: 'ECWA Discipleship Team',
    duration: '4 lessons · 60 min',
    desc: 'A step-by-step introduction to Head, Heart, Hand, and Help. Ideal for new believers and anyone who has never had a structured quiet time before.',
    free: true,
  },
  {
    tag: 'Old Testament',
    title: 'Understanding the Pentateuch',
    instructor: 'Rev. Daniel Musa',
    duration: '8 lessons · 3 hrs',
    desc: 'Trace the covenant story from Genesis to Deuteronomy. Learn how to read the law as a Nigerian Christian today — its demands, its grace, and its fulfilment in Christ.',
    free: false,
  },
  {
    tag: 'New Testament',
    title: "Paul's Letters to the Early Church",
    instructor: 'Dr. Grace Nwosu',
    duration: '10 lessons · 4 hrs',
    desc: 'Walk through Romans, Galatians, Ephesians, and Philippians with a focus on how Paul applies the Gospel to everyday community life — a message as relevant in Abuja as it was in Corinth.',
    free: false,
  },
  {
    tag: 'Apologetics',
    title: 'Navigating Faith in Modern Nigeria',
    instructor: 'Prof. Emmanuel Afolabi',
    duration: '6 lessons · 2.5 hrs',
    desc: 'Engage with the hard questions: prosperity theology, syncretism, cultural pressure, and secularism. Learn how to hold your faith confidently without defensiveness.',
    free: false,
  },
  {
    tag: 'Prayer',
    title: 'From Devotion to Intercession',
    instructor: 'ECWA Women\'s Ministry',
    duration: '5 lessons · 90 min',
    desc: 'How your daily quiet time naturally leads into a life of prayer for others. Practical guidance on interceding for your household, your church, and your nation.',
    free: true,
  },
  {
    tag: 'Hermeneutics',
    title: 'How to Read the Bible Well',
    instructor: 'Dr. Samuel Okafor',
    duration: '7 lessons · 2.5 hrs',
    desc: 'Context, genre, grammar, and application. A practical course on reading scripture faithfully — so that your 4H entries are grounded in what the text actually says.',
    free: false,
  },
]

export default function Courses() {
  const [toast, setToast] = useState(null)

  const handleView = (title) => {
    setToast(`"${title}" is coming soon.`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <main>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#3d2a1a', color: '#fdf6ec', padding: '12px 24px',
          borderRadius: '24px', fontSize: '0.9rem', fontWeight: 500,
          zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
      {/* ─── HEADER ─── */}
      <section
        className="hero-section"
        style={{ gridTemplateColumns: '1fr', textAlign: 'center', paddingBottom: '40px' }}
      >
        <div className="hero-text" style={{ margin: '0 auto', maxWidth: '640px' }}>
          <span className="section-tag">LEARN</span>
          <h1 style={{ fontSize: '3rem' }}>
            Go deeper into <em>the Word.</em>
          </h1>
          <p>
            Short courses from ECWA teachers, theologians, and ministry leaders —
            designed to sharpen your understanding of scripture and strengthen
            your daily devotional life.
          </p>
        </div>
      </section>

      {/* ─── COURSE GRID ─── */}
      <section style={{ padding: '20px 60px 80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {courses.map(({ tag, title, instructor, duration, desc, free }) => (
              <div
                key={title}
                style={{
                  background: 'var(--clr-card)', borderRadius: '16px', padding: '30px',
                  boxShadow: '0 4px 20px rgba(157,79,20,0.07)',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  border: '1px solid var(--clr-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                      color: 'var(--clr-primary)', background: 'var(--clr-cream)',
                      padding: '4px 10px', borderRadius: '20px',
                      border: '1px solid var(--clr-border)',
                    }}
                  >
                    {tag}
                  </span>
                  {free && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2b7a3b', background: '#e6f4ea', padding: '4px 10px', borderRadius: '20px' }}>
                      FREE
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--clr-dark)', lineHeight: '1.4' }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--clr-primary)', fontWeight: 600 }}>{instructor}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', lineHeight: '1.7', flex: 1 }}>{desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--clr-border)', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{duration}</span>
                  <button
                    onClick={() => handleView(title)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--clr-primary)',
                      fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    }}
                  >
                    View Course →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <h2>Start with the free courses today.</h2>
        <p>
          Create a free account to access the introductory courses and track your
          progress as you learn.
        </p>
        <Link href="/signup" className="btn-primary btn-lg">
          Create Free Account
        </Link>
      </section>
    </main>
  )
}
