"use client"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
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
          <em>ECWA Devotions</em>
        </Link>
        <button className="auth-help-btn" aria-label="Help">?</button>
      </header>

      {/* Decorative background shape */}
      <div className="auth-bg-shape auth-bg-shape--top" />

      {/* Main content */}
      <main className="signin-main">
        <div className="auth-card">
          {/* Icon */}
          <div className="auth-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9d4f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M12 6v7" />
              <path d="M15 9l-3-3-3 3" />
            </svg>
          </div>

          <h1>Return to Selah</h1>
          <p className="auth-subtitle">
            Continue your 4H journey: Hear, Heed, Hold, Help.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <div className="auth-input-wrap">
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label htmlFor="password">PASSWORD</label>
                <Link href="/forgot-password" className="auth-forgot">
                  Forgot Password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-input-icon auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing In..." : <>Sign In <span>→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Or join with</span>
          </div>

          {/* Social buttons */}
          <div className="auth-social-row">
            <button type="button" className="auth-social-btn" onClick={handleGoogle}>
              <span className="auth-social-icon auth-social-icon--google" />
              Google
            </button>
            <button type="button" className="auth-social-btn">
              <span className="auth-social-icon auth-social-icon--outlook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              Outlook
            </button>
          </div>

          <p className="auth-switch" style={{ marginTop: '30px' }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign Up</Link>
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
        <p>© 2024 ECWA Devotional. A Sanctuary for Selah.</p>
      </footer>

      {/* Bottom-right decoration */}
      <div className="auth-bg-shape auth-bg-shape--bottom" />
    </div>
  )
}
