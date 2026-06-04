import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Editorial Devotion — your 4H quiet time companion.',
}

export default function TermsOfService() {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="public-page legal-page">
      <h1>Terms of Service</h1>
      
      <div className="legal-content">
        <p><strong>Last Updated: {formattedDate}</strong></p>
        
        <p>By accessing the Editorial Devotion application, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

        <h2>1. Terms &amp; Conditions</h2>
        <p>These terms govern your access and use of Editorial Devotion. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily download or access the materials on Editorial Devotion for personal, non-commercial spiritual growth and transitory viewing only. Under this license you may not:</p>
        <ul>
          <li>Modify or copy the proprietary application software code.</li>
          <li>Use the materials for any commercial purpose or public display.</li>
          <li>Attempt to decompile or reverse engineer any software contained on the platform.</li>
          <li>Remove any copyright or other proprietary notations from the materials.</li>
        </ul>

        <h2>3. Account Responsibilities</h2>
        <p>To access certain features of the application, you must create a secure user account. You are solely responsible for maintaining the confidentiality of your account credentials (email and password) and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account.</p>

        <h2>4. Content Ownership &amp; Privacy</h2>
        <p>You retain full ownership rights to all text, logs, and reflections you input into the devotional tracker. Editorial Devotion does not claim ownership over your personal entries. Your content is treated as confidential and protected in accordance with our Privacy Policy.</p>

        <h2>5. Disclaimer</h2>
        <p>The materials on the Editorial Devotion app are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, or fitness for a particular purpose.</p>

        <h2>6. Limitation of Liability</h2>
        <p>In no event shall Editorial Devotion or its parish administrators be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform.</p>

        <h2>7. Account Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in malicious activity, or disrupt the platform services. You may delete your account and remove all data at any time via settings.</p>

        <h2>8. Changes to Terms</h2>
        <p>Editorial Devotion may revise these terms of service for its application at any time without notice. By using this application, you are agreeing to be bound by the then-current version of these terms.</p>

        <p className="legal-back">
          <Link href="/">← Return to Home</Link>
        </p>
      </div>
    </main>
  )
}
