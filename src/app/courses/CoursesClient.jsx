'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Clock, BookOpen } from 'lucide-react'

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
    instructor: 'Pastor Deborah Yakubu',
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

const categories = ['All', 'Foundations', 'Old Testament', 'New Testament', 'Apologetics', 'Prayer', 'Hermeneutics']

const getInstructorInitials = (name) => {
  if (name === 'ECWA Discipleship Team') return 'ED'
  if (name === 'Rev. Daniel Musa') return 'DM'
  if (name === 'Dr. Grace Nwosu') return 'GN'
  if (name === 'Prof. Emmanuel Afolabi') return 'EA'
  if (name === 'Pastor Deborah Yakubu') return 'DY'
  if (name === 'Dr. Samuel Okafor') return 'SO'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function CoursesClient() {
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const handleView = (title) => {
    setToast(`"${title}" is coming soon.`)
    setTimeout(() => setToast(null), 3000)
  }

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = activeFilter === 'All' || course.tag === activeFilter
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--clr-dark)', color: 'var(--clr-cream)', padding: '14px 28px',
          borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600,
          zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap', border: '1px solid var(--clr-border)',
          animation: 'fadeIn 0.2s ease',
        }}>
          ✨ {toast}
        </div>
      )}
      
      {/* ─── HEADER ─── */}
      <section className="hero-section" style={{ gridTemplateColumns: '1fr', textAlign: 'center', paddingBottom: '20px' }}>
        <div className="hero-text" style={{ margin: '0 auto', maxWidth: '680px' }}>
          <span className="section-tag">LEARN</span>
          <h1 style={{ fontSize: '3.2rem', marginBottom: '16px' }}>
            Go deeper into <em>the Word.</em>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--clr-text-muted)', lineHeight: '1.7' }}>
            Short courses from ECWA teachers, theologians, and ministry leaders —
            designed to sharpen your understanding of scripture and strengthen
            your daily devotional life.
          </p>
        </div>
      </section>

      {/* ─── CONTROLS (SEARCH & FILTERS) ─── */}
      <div className="course-controls">
        <div className="course-search-container">
          <span className="course-search-icon flex items-center justify-center"><Search size={16} /></span>
          <input
            type="text"
            className="course-search-input"
            placeholder="Search courses, instructors, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="course-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`course-filter-pill ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── COURSE GRID ─── */}
      <section style={{ padding: '0 60px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {filteredCourses.length > 0 ? (
            <div className="courses-grid">
              {filteredCourses.map(({ tag, title, instructor, duration, desc, free }) => (
                <div key={title} className="course-card">
                  <div className="course-tag-row">
                    <span className="course-tag">{tag}</span>
                    {free ? (
                      <span className="course-free-badge">FREE</span>
                    ) : (
                      <span className="course-coming-soon">COMING SOON</span>
                    )}
                  </div>
                  <h3>{title}</h3>
                  <div className="course-instructor-block">
                    <div className="course-instructor-avatar">
                      {getInstructorInitials(instructor)}
                    </div>
                    <p className="course-instructor">{instructor}</p>
                  </div>
                  <p className="course-desc">{desc}</p>
                  <div className="course-footer">
                    <span className="course-duration flex items-center gap-1"><Clock size={14} /> {duration}</span>
                    <button onClick={() => handleView(title)} className="course-view-btn">
                      View Course <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'var(--clr-card)',
              borderRadius: '20px',
              border: '1.5px dashed var(--clr-border)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              <div className="flex justify-center mb-4"><BookOpen size={48} className="text-[var(--clr-primary)]" /></div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--clr-dark)', marginBottom: '8px' }}>No Courses Found</h3>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.92rem', margin: 0 }}>
                We couldn't find any courses matching your search criteria. Try modifying your search keywords or choosing a different category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section" style={{ marginTop: '40px' }}>
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
