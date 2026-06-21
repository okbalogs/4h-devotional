"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import GoogleButton from "@/components/GoogleButton"
import { Heart, BookDashed, Eye, EyeOff } from "lucide-react"
import hero from "../../assets/images/hero.png"

function PasswordStrength({ password }) {
  const checks = useMemo(() => [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
  ], [password])

  const metCount = checks.filter(c => c.met).length

  return (
    <div className="pw-strength">
      <div className="pw-strength-bar">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`pw-strength-segment${i < metCount ? " filled" : ""}${metCount === checks.length ? " strong" : ""}`}
          />
        ))}
      </div>
      <span className="pw-strength-label">
        {checks.map(c => (
          <span key={c.label} style={{ marginRight: 10, color: c.met ? '#2b7a3b' : undefined }}>
            {c.met ? "✓" : "○"} {c.label}
          </span>
        ))}
      </span>
    </div>
  )
}

export default function SignUp() {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signup, loginWithGoogle } = useAuth()

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signup(email, password, fullName)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      {/* Top bar */}
      <header className="auth-header">
        <Link href="/" className="auth-brand">
          <em>Editorial Devotion</em>
        </Link>
      </header>

      {/* Decorative background shape */}
      <div className="auth-bg-shape auth-bg-shape--top" />

      {/* Main content — split layout */}
      <main className="signup-main">
        {/* Left panel */}
        <div className="signup-left">
          <h1>
            <em>A Sanctuary for Selah.</em>
          </h1>
          <p>
            Step into a dedicated space designed for the 4H journey:{" "}
            <em>
              <strong>Head, Heart, Hand, and Help.</strong>
            </em>
          </p>

          <div className="signup-features">
            <div className="signup-feature">
              <span className="signup-feature-icon flex items-center justify-center"><Heart size={20} className="text-[var(--clr-primary-hover)]" /></span>
              <div>
                <strong>Spiritual Discipline</strong>
                <p>Consistent tracking of your daily walk with God.</p>
              </div>
            </div>
            <div className="signup-feature">
              <span className="signup-feature-icon flex items-center justify-center"><BookDashed size={20} className="text-[var(--clr-primary)]" /></span>
              <div>
                <strong>Journaled Reflections</strong>
                <p>
                  Preserve your insights and prayers in a digital archive.
                </p>
              </div>
            </div>
          </div>

          <div className="signup-hero-image">
            <Image
              src={hero}
              alt="Open Bible"
              placeholder="blur"
              width={420}
              height={280}
              style={{ objectFit: "cover", borderRadius: "16px" }}
            />
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-card signup-card">
          <span className="signup-badge">NEW JOURNEY</span>
          <h2>Create Your Account</h2>
          <p className="auth-subtitle">
            Begin your meditative devotion experience today.
          </p>

          <GoogleButton onClick={handleGoogle} />

          <div className="auth-divider">
            <span>Or sign up with email</span>
          </div>

          <form className="auth-form" onSubmit={handleSignup}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label htmlFor="fullname">FULL NAME</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon auth-input-icon--left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  className="auth-input--has-left-icon"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">EMAIL ADDRESS</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon auth-input-icon--left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  required
                  className="auth-input--has-left-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field-row">
              <div className="auth-field">
                <label htmlFor="signup-pw">PASSWORD</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon auth-input-icon--left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="signup-pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="auth-input--has-left-icon"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="auth-input-icon auth-input-icon--right flex items-center justify-center" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-pw">CONFIRM</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon auth-input-icon--left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <input
                    id="confirm-pw"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="auth-input--has-left-icon"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className="auth-input-icon auth-input-icon--right flex items-center justify-center" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : <>Create Account <span>→</span></>}
            </button>
          </form>


          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/signin">Sign In</Link>
          </p>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="auth-footer">
        <div className="auth-footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </div>
        <p>© {new Date().getFullYear()} Editorial Devotion. A Sanctuary for Selah.</p>
      </footer>

      {/* Bottom-right decoration */}
      <div className="auth-bg-shape auth-bg-shape--bottom" />
    </div>
  )
}
