import Link from "next/link"

export default function Explore() {
  return (
    <main>
      <section className="hero-section" style={{ textAlign: 'center', gridTemplateColumns: '1fr', paddingBottom: '40px' }}>
        <div className="hero-text" style={{ margin: '0 auto' }}>
          <span className="section-tag" style={{ marginBottom: '16px' }}>The Philosophy</span>
          <h1 style={{ fontSize: '3.8rem' }}>The <em>4H</em> Method</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
            A structured, intentional approach to Daily Devotion. Moving beyond merely reading the word, into digesting and acting upon it.
          </p>
        </div>
      </section>

      <section className="framework-section" style={{ paddingTop: '0', paddingBottom: '100px' }}>
        <div className="framework-grid" style={{ gap: '30px' }}>
          
          <div className="framework-card" style={{ minHeight: '320px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '20px', color: '#9d4f14', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>⚙️</div>
            <span className="framework-step">STEP ONE</span>
            <h3 style={{ fontSize: '1.8rem' }}>Hear (Head)</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>
              What does God say? In this step, we approach the scripture intellectually. We observe the context, the characters, the commands, and the core promises. We distill the absolute truth of the passage before doing anything else.
            </p>
          </div>

          <div className="framework-card" style={{ minHeight: '320px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '20px', color: '#9d4f14', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>🤎</div>
            <span className="framework-step">STEP TWO</span>
            <h3 style={{ fontSize: '1.8rem' }}>Heed (Heart)</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>
              Knowledge without conviction is dead orthodoxy. Here, we let the word penetrate. What emotions does this stir? What sins are exposed? What fears are calmed? We allow the Holy Spirit to minister to our internal posture.
            </p>
          </div>

          <div className="framework-card framework-card--accent" style={{ minHeight: '320px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>✋</div>
            <span className="framework-step" style={{ color: 'rgba(255,255,255,0.8)' }}>STEP THREE</span>
            <h3 style={{ fontSize: '1.8rem' }}>Hold (Hands)</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
              Faith without works is dead. What action steps will you take today because of this truth? This is where devotion moves from the theoretical into the practical reality of your daily schedule and habits.
            </p>
          </div>

          <div className="framework-card" style={{ minHeight: '320px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '20px', color: '#9d4f14', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>🤲</div>
            <span className="framework-step">STEP FOUR</span>
            <h3 style={{ fontSize: '1.8rem' }}>Help (Others)</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>
              The Gospel is designed to flow through you, not just to you. Who in your sphere of influence needs to hear this truth? How can you serve others based on what God has fed you today?
            </p>
          </div>

        </div>

        <div style={{ marginTop: '80px', background: '#fdf6ec', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#3d2a1a', marginBottom: '16px' }}>Ready to begin?</h2>
          <p style={{ color: '#7a6555', maxWidth: '500px', margin: '0 auto 30px', fontSize: '1.05rem' }}>
            Join thousands of believers journaling their journey using the 4H framework every single morning.
          </p>
          <Link href="/signup" className="btn-primary btn-lg">
            Start Your Sandbox
          </Link>
        </div>
      </section>
    </main>
  )
}
