import Link from 'next/link'

export const metadata = {
  title: 'Instructors',
  description: 'Meet the ECWA teachers, theologians, and ministry leaders behind our courses.',
}

const instructors = [
  {
    name: 'Rev. Daniel Musa',
    role: 'Old Testament Scholar',
    bio: 'Rev. Musa has served in ECWA ministry for over 20 years, specialising in Pentateuch studies and covenant theology. He leads the Understanding the Pentateuch course.',
    initials: 'DM',
  },
  {
    name: 'Dr. Grace Nwosu',
    role: 'New Testament Lecturer',
    bio: 'Dr. Nwosu holds a PhD in Pauline Theology from ECWA Theological Seminary, Jos. She teaches our course on Paul\'s Letters to the Early Church.',
    initials: 'GN',
  },
  {
    name: 'Prof. Emmanuel Afolabi',
    role: 'Apologetics & Philosophy',
    bio: 'Prof. Afolabi addresses the intersection of faith and contemporary Nigerian culture. His course on Navigating Faith in Modern Nigeria equips believers for hard questions.',
    initials: 'EA',
  },
  {
    name: 'Dr. Samuel Okafor',
    role: 'Hermeneutics Specialist',
    bio: 'Dr. Okafor teaches practical Bible reading methods. His How to Read the Bible Well course ensures your 4H entries are grounded in faithful exegesis.',
    initials: 'SO',
  },
  {
    name: 'Pastor Deborah Yakubu',
    role: 'Prayer & Discipleship',
    bio: 'Pastor Yakubu leads ECWA Women\'s Ministry prayer initiatives. She brings decades of experience in intercessory prayer and spiritual formation.',
    initials: 'DY',
  },
  {
    name: 'Rev. Caleb Adamu',
    role: 'Discipleship Training',
    bio: 'Rev. Adamu coordinates the ECWA Discipleship Team and developed the introductory 4H Quiet Time Method course for new believers.',
    initials: 'CA',
  },
]

export default function Instructors() {
  return (
    <main className="public-page">
      <div className="public-page-centered" style={{ marginBottom: '60px' }}>
        <span className="section-tag">TEACHERS</span>
        <h1>Our Instructors</h1>
        <p className="public-page-intro">
          Learn from faithful men and women who have dedicated their lives to the exposition of Scripture and the growth of the church.
        </p>
      </div>

      <div style={{ padding: '0 60px 80px' }}>
        <div className="instructors-grid">
          {instructors.map((inst) => (
            <div key={inst.name} className="instructor-card">
              <div className="instructor-avatar">
                {inst.initials}
              </div>
              <h3>{inst.name}</h3>
              <p className="instructor-role">{inst.role}</p>
              <p className="instructor-bio">{inst.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <h2>Grow under their guidance.</h2>
        <p>
          Enrol in any of our short courses taught by these instructors to enrich your spiritual disciplines.
        </p>
        <Link href="/courses" className="btn-primary btn-lg">
          Browse Courses
        </Link>
      </section>
    </main>
  )
}
