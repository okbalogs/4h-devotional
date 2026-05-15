import Link from 'next/link'
import Image from 'next/image'
import hero from "../assets/images/hero.png"

export default function Landing() {
  const framework = [
    {
      step: "01",
      title: "Head",
      description:
        "What does God say? Listen to the scripture closely, identifying the main truths and key messages.",
      color: "#f5e6d3",
      link: "/explore#hear",
    },
    {
      step: "02",
      title: "Heart",
      description:
        "Let the word penetrate your heart. Reflect on the emotions it stirs and the conviction it brings.",
      color: "#f5e6d3",
      link: "/explore#heart",
    },
    {
      step: "03",
      title: "Hand",
      description:
        "Think about what you've read. What truths have you learned? How does this change your perspective?",
      color: "#f5e6d3",
      link: "/explore#head",
    },
    {
      step: "04",
      title: "Help",
      description:
        "Put it into practice. What action steps will you take to apply the word to your life and extend to others?",
      color: "#9d4f14",
      link: "/explore#help",
    },
  ]

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            A Sanctuary for your <em>Daily Selah</em>
          </h1>
          <p>
            Engage with God through the ECWA 4H Quiet time format:{" "}
            <strong>Hear, Heart, Head, Help</strong>. A digital parchment
            for your spiritual journey.
          </p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn-primary">
              Start Your Journey
            </Link>
            <Link href="/explore" className="btn-outline">
              Explore the 4H Method
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <Image
            src={hero}
            alt="Bible and coffee — quiet time"
            priority
            placeholder="blur"
          />
          <span className="hero-badge">&ldquo;Be still, and know…&rdquo;</span>
        </div>
      </section>

      {/* ─── 4H FRAMEWORK ─── */}
      <section className="framework-section">
        <span className="section-tag">THE METHOD</span>
        <h2>The ECWA 4H Framework</h2>
        <div className="framework-divider" />

        <div className="framework-grid">
          {framework.map((item) => (
            <Link
              href={item.link}
              key={item.step}
              className={`framework-card ${
                item.step === "04" ? "framework-card--accent" : ""
              }`}
            >
              <span className="framework-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="framework-link">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURE HIGHLIGHTS ─── */}
      <section className="features-section">
        <div className="features-top">
          <div className="feature-card feature-card--wide">
            <div className="feature-card-text">
              <h3>Consistent Growth</h3>
              <p>
                Our personalized devotional plans and daily reminders help you
                cultivate a rhythm of consistency with the Bible.
              </p>
            </div>
            <div className="feature-card-image">
              <Image
                src="/growth-icon.png"
                alt="Growth illustration"
                width={160}
                height={160}
              />
            </div>
          </div>

          <div className="feature-card feature-card--dark">
            <div className="feature-card-text">
              <h3>Spiritual Archives</h3>
              <p>
                Every reflection you write is saved. Revisit your devotional
                history at any time to see how far you&apos;ve come.
              </p>
              <Link href="/signup" className="feature-link">
                Learn More →
              </Link>
            </div>
            <div className="feature-card-image">
              <Image
                src="/archives-icon.png"
                alt="Archives illustration"
                width={120}
                height={120}
              />
            </div>
          </div>
        </div>

        <div className="feature-card feature-card--full">
          <div className="feature-card-avatar">
            <Image
              src="/community-icon.png"
              alt="Community"
              width={80}
              height={80}
              className="community-avatar"
            />
          </div>
          <div className="feature-card-text">
            <h3>Community Connection</h3>
            <p>
              Share insights, encourage others, and join group devotionals that
              build genuine Christian fellowship in your local ECWA community.
            </p>
          </div>
          <Link href="/signup" className="feature-link-btn">
            Learn More →
          </Link>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="testimonial-section">
        <div className="testimonial-quote-icon">❝</div>
        <blockquote>
          &ldquo;This app has transformed my morning quiet time into a deep
          conversation with God. The 4H structure brings clarity I never had
          before.&rdquo;
        </blockquote>
        <div className="testimonial-author">
          <Image
            src="/testimonial-avatar.png"
            alt="Sarah Adesola"
            width={56}
            height={56}
            className="testimonial-avatar"
          />
          <div>
            <strong>Sarah Adesola</strong>
            <span>ECWA Member, Lagos</span>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <h2>Ready to step inside?</h2>
        <p>
          Begin your journey today and experience the depth of scripture like
          never before. Your digital sanctuary awaits.
        </p>
        <Link href="/signup" className="btn-primary btn-lg">
          Enter the Sanctuary
        </Link>
      </section>
    </main>
  )
}
