import Link from 'next/link'
import { BookOpen, Heart, Hand, Handshake, Calendar, Folder, WifiOff } from 'lucide-react'

export const metadata = {
  title: 'Explore the 4H Method',
  description: 'Discover the 4H devotional framework — Head, Heart, Hand, Help — a structured approach to daily scripture engagement.',
}

const steps = [
  {
    icon: <BookOpen size={24} />,
    step: 'STEP ONE',
    title: 'Head',
    subtitle: 'What does God say?',
    body: `Approach the scripture with your mind fully engaged. Observe the context, the characters, the commands, and the promises. Resist the urge to jump to application — first, simply receive the text as it is written. What is the author saying, and to whom? What does this passage reveal about the nature of God?`,
    accent: false,
  },
  {
    icon: <Heart size={24} />,
    step: 'STEP TWO',
    title: 'Heart',
    subtitle: 'How does it convict my heart?',
    body: `Knowledge without conviction is dead orthodoxy. In this step, let the word press against your interior life. What emotions does this passage stir? What sin is exposed? What anxiety is addressed? What promise reassures you? Allow the Holy Spirit room to minister before you move on.`,
    accent: false,
  },
  {
    icon: <Hand size={24} />,
    step: 'STEP THREE',
    title: 'Hand',
    subtitle: 'What will I do with this today?',
    body: `Faith without works is dead. This is the step most people skip — and it is the reason many devout Christians are unchanged by years of Bible reading. Write one concrete, time-bound action you will take today because of what you have read. Not a vague resolution. One specific thing.`,
    accent: true,
  },
  {
    icon: <Handshake size={24} />,
    step: 'STEP FOUR',
    title: 'Help',
    subtitle: 'Who can I serve with this truth?',
    body: `The Gospel is not designed to stop with you. Think of one person in your life — a colleague, a neighbour, a younger believer in your church — who needs to hear what God fed you this morning. The discipline of outward application keeps devotion from becoming spiritual self-indulgence.`,
    accent: false,
  },
]

const features = [
  {
    icon: <Calendar size={24} className="text-[#9d4f14]" />,
    title: 'A verse chosen for your journey',
    body: 'Each day you receive a scripture matched to how long you have been walking with God — not random, not generic. Your journey day determines your reading.',
  },
  {
    icon: <BookOpen size={24} className="text-[#9d4f14]" />,
    title: 'Your preferred Bible translation',
    body: 'Choose KJV, WEB, or ASV. Your preference is saved and applied across every daily verse and new entry automatically.',
  },
  {
    icon: <Folder size={24} className="text-[#9d4f14]" />,
    title: 'A permanent spiritual archive',
    body: 'Every entry you write is stored privately in your account. Return to any past reflection in History and trace how God has been speaking to you over months and years.',
  },
  {
    icon: <WifiOff size={24} className="text-[#9d4f14]" />,
    title: 'Works without internet',
    body: 'Wrote your devotion on the bus without data? No problem. Entries are saved offline and synced to your account the moment you reconnect.',
  },
]

export default function Explore() {
  return (
    <main>
      {/* ─── HEADER ─── */}
      <section className="hero-section" style={{ gridTemplateColumns: '1fr', textAlign: 'center', paddingBottom: '40px' }}>
        <div className="hero-text" style={{ margin: '0 auto', maxWidth: '680px' }}>
          <span className="section-tag">THE PHILOSOPHY</span>
          <h1 style={{ fontSize: '3.2rem' }}>
            The <em>4H</em> Framework
          </h1>
          <p>
            A structured, intentional approach to daily devotion — designed to move
            you beyond merely reading the word into digesting and acting upon it.
            Developed within ECWA and practised by millions of African believers.
          </p>
        </div>
      </section>

      {/* ─── FOUR STEPS ─── */}
      <section className="framework-section" style={{ paddingTop: 0 }}>
        <div className="framework-grid" style={{ gap: '28px' }}>
          {steps.map(({ icon, step, title, subtitle, body, accent }) => (
            <div
              key={step}
              className={`framework-card${accent ? ' framework-card--accent' : ''}`}
              style={{ minHeight: '340px' }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: accent ? 'rgba(255,255,255,0.18)' : 'var(--clr-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  marginBottom: '20px',
                  boxShadow: accent ? 'none' : '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                {icon}
              </div>
              <span
                className="framework-step"
                style={accent ? { color: 'rgba(255,255,255,0.7)' } : {}}
              >
                {step}
              </span>
              <h3 style={{ fontSize: '1.9rem' }}>{title}</h3>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontStyle: 'italic',
                  marginBottom: '12px',
                  color: accent ? 'rgba(255,255,255,0.7)' : 'var(--clr-primary)',
                }}
              >
                {subtitle}
              </p>
              <p style={{ fontSize: '0.97rem', lineHeight: '1.75', color: accent ? 'rgba(255,255,255,0.9)' : undefined }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY IT WORKS ─── */}
      <section className="explore-why-section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span className="section-tag">WHY IT WORKS</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--clr-dark)', margin: '16px 0 20px' }}>
            Built for the way Nigerian believers live
          </h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '700px', marginBottom: '56px' }}>
            Many of us grew up in homes where morning devotion was a real, daily practice —
            not a performance, but a genuine first conversation with God before the day began.
            The 4H method gives that practice a spine. It prevents quiet time from drifting into
            passive Bible reading and keeps it anchored to transformation: what you know,
            what you feel, what you will do, and who you will reach.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {features.map(({ icon, title, body }) => (
              <div key={title} className="explore-feature-card">
                <div style={{ fontSize: '1.6rem', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-dark)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-muted)', lineHeight: '1.7' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <h2>Ready to start?</h2>
        <p>
          Create your free account and begin your first 4H entry today.
          No subscription required to get started.
        </p>
        <Link href="/signup" className="btn-primary btn-lg">
          Begin Your Journey
        </Link>
      </section>
    </main>
  )
}
