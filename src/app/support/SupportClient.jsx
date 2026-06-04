'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupportClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <main className="public-page public-page-centered">
        <div className="support-form-card">
          <div className="support-success">
            <div className="support-success-icon">💌</div>
            <h3>Ticket Submitted Successfully</h3>
            <p>Thank you for reaching out, {name || 'there'}. Our team will review your message and respond within 24 hours.</p>
            <div className="public-page-back" style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary" style={{ display: 'inline-block' }}>
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="public-page public-page-centered">
      <div className="public-page-icon">💌</div>
      <h1>How can we help?</h1>
      <p className="public-page-intro">
        If you are experiencing issues with your account, have billing questions, or just want to share a testimony, our parish support team is here.
      </p>

      <form onSubmit={handleSubmit} className="support-form-card">
        <div className="support-field">
          <label htmlFor="support-name" className="support-label">Your Name</label>
          <input
            id="support-name"
            type="text"
            required
            className="support-input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="support-field">
          <label htmlFor="support-email" className="support-label">Your Email</label>
          <input
            id="support-email"
            type="email"
            required
            className="support-input"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="support-field">
          <label htmlFor="support-category" className="support-label">Topic</label>
          <select
            id="support-category"
            required
            className="support-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">General Inquiry</option>
            <option value="technical">Technical Support</option>
            <option value="billing">Billing & Membership</option>
            <option value="testimony">Feedback & Testimony</option>
          </select>
        </div>

        <div className="support-field">
          <label htmlFor="support-message" className="support-label">How can we assist?</label>
          <textarea
            id="support-message"
            required
            className="support-textarea"
            placeholder="Describe your issue or feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', border: 'none' }}>
          {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
        </button>
      </form>

      <div className="public-page-back">
        <Link href="/">← Return to Homepage</Link>
      </div>
    </main>
  )
}
