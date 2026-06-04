import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Editorial Devotion protects your personal data and devotional entries.',
}

export default function PrivacyPolicy() {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="public-page legal-page">
      <h1>Privacy Policy</h1>
      
      <div className="legal-content">
        <p><strong>Effective Date: {formattedDate}</strong></p>
        
        <p>Your privacy is important to us. It is Editorial Devotion&apos;s policy to respect your privacy regarding any information we may collect from you across our application and network.</p>

        <h2>1. Information We Collect</h2>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. This includes:</p>
        <ul>
          <li><strong>Account Credentials:</strong> Your name and email address provided during authentication.</li>
          <li><strong>Devotional Data:</strong> Devotional logs, including Head, Heart, Hand, Help entries, scripture references, and personal notes.</li>
          <li><strong>Usage Data:</strong> Anonymized interaction history to improve application performance and usability.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information to deliver and optimize our service. Specifically, we use it to:</p>
        <ul>
          <li>Provide and maintain your personalized devotional tracker.</li>
          <li>Authenticate your identity and secure your account access via Supabase.</li>
          <li>Synchronize and backup your entries across multiple devices.</li>
          <li>Deliver support and resolve technical difficulties when requested.</li>
        </ul>

        <h2>3. Data Storage &amp; Security</h2>
        <p>All data is stored securely using industry-standard infrastructure. Your devotional entries are tied to your authenticated user account, and access is strictly restricted through Row Level Security (RLS) policies. We implement administrative and technical measures designed to protect your data from loss, unauthorized access, or modification.</p>

        <h2>4. Cookies &amp; Local Storage</h2>
        <p>We use cookies and browser local storage to improve your experience. This includes saving draft entries locally (to prevent loss of data in case of unexpected disconnects) and preserving session authentication tokens.</p>

        <h2>5. Data Retention</h2>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. You have the right to request deletion of your account and all associated devotional entries at any time.</p>

        <h2>6. Nigerian Data Protection Regulations (NDPR)</h2>
        <p>As an organization operating within the ECWA context and serving believers in Nigeria and globally, we strive to adhere to the principles of the Nigerian Data Protection Regulation (NDPR). We process your data lawfully, transparently, and with respect to your privacy rights.</p>

        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information stored with us. You can modify your account details directly inside the application settings, or request full account deletion via our support page.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about how we handle user data and personal information, feel free to contact us through our <Link href="/support" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Support Page</Link>.</p>

        <p className="legal-back">
          <Link href="/">← Return to Home</Link>
        </p>
      </div>
    </main>
  )
}
