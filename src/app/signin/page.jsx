"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import GoogleButton from "@/components/GoogleButton"

function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 350) // wait for fade-out before clearing
    }, 5000)
    return () => clearTimeout(timerRef.current)
  }, [onDone])

  return (
    <div className={`auth-toast auth-toast--error ${visible ? 'auth-toast--in' : 'auth-toast--out'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>Incorrect email or password. Please try again.</span>
      <button className="auth-toast-close" onClick={() => { setVisible(false); setTimeout(onDone, 350) }} aria-label="Dismiss">✕</button>
      <div className="auth-toast-bar" />
    </div>
  )
}

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [toastKey, setToastKey] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()

  const showError = () => setToastKey(Date.now())

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      showError()
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      showError()
    }
  }

  return (
    <div className="auth-page">
      {/* Top bar */}
      <header className="auth-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem' }}>
        <Link href="/" className="auth-brand" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '1.15rem' }}>
          4H Devotional
        </Link>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#5C3D2E',
            background: 'rgba(92, 61, 46, 0.08)',
            border: '1px solid rgba(92, 61, 46, 0.15)',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          ← Back to Home
        </Link>
      </header>

      {/* Decorative background shape */}
      <div className="auth-bg-shape auth-bg-shape--top" />

      {/* Main content */}
      <main className="signin-main">
        <div className="auth-card">
          {/* Icon */}
          <div className="auth-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M12 6v7" />
              <path d="M15 9l-3-3-3 3" />
            </svg>
          </div>

          <h1>Return to Selah</h1>
          <p className="auth-subtitle">
            Continue your 4H journey: Head, Heart, Hand, Help.
          </p>

          <GoogleButton onClick={handleGoogle} />

          <div className="auth-divider">
            <span>Or continue with email</span>
          </div>

          {toastKey && <Toast key={toastKey} message="" onDone={() => setToastKey(null)} />}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <div className="auth-input-wrap">
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
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
                  required
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
        <p>© {new Date().getFullYear()} Editorial Devotion. A Sanctuary for Selah.</p>
      </footer>

      {/* Bottom-right decoration */}
      <div className="auth-bg-shape auth-bg-shape--bottom" />
    </div>
  )
}
