"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/today'), 2000)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape--top" />
      <header className="auth-header">
        <Link href="/" className="auth-brand"><em>ECWA Devotions</em></Link>
      </header>

      <main className="signin-main">
        <div className="auth-card">
          <div className="auth-icon">
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fdf6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9d4f14', fontSize: '1.4rem' }}>
              🔐
            </div>
          </div>
          <h1>Set New Password</h1>
          <p className="auth-subtitle">Choose a strong new password for your account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            {success && (
              <div className="auth-error" style={{ background: '#eaf5eb', color: '#2b7a3b' }}>
                Password updated! Redirecting...
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="new-pw">NEW PASSWORD</label>
              <div className="auth-input-wrap">
                <input
                  id="new-pw"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={success}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-pw">CONFIRM PASSWORD</label>
              <div className="auth-input-wrap">
                <input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={success}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading || success}>
              {loading ? 'Saving...' : <>Update Password <span>→</span></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#7a6555' }}>
            Remember your password?{' '}
            <Link href="/signin" style={{ color: '#9d4f14', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </main>
      <div className="auth-bg-shape auth-bg-shape--bottom" />
    </div>
  )
}
