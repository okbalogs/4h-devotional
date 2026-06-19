"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Key, Mail } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape--top"></div>
      <div className="auth-bg-shape auth-bg-shape--bottom"></div>

      <header className="auth-header">
        <Link href="/" className="auth-brand">
          <em>Editorial Devotion</em>
        </Link>
      </header>

      <main className="signin-main">
        <div className="auth-card" style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="auth-icon">
             <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--clr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)', fontSize: '1.4rem'}}>
               <Key size={24} />
             </div>
          </div>
          <h1>Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form className="auth-form" onSubmit={handleReset}>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-error" style={{ background: '#eaf5eb', color: '#2b7a3b' }}>Check your email for the reset link!</div>}
            
            <div className="auth-field">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon auth-input-icon--left flex items-center justify-center"><Mail size={16} /></span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="auth-input--has-left-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading || success} style={{ marginTop: '10px' }}>
              {loading ? "Sending..." : <>Send Reset Link <span>→</span></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--clr-text-muted)' }}>Remember your password?</span>{" "}
             <Link href="/signin" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
