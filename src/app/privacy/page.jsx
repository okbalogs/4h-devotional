import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#9d4f14', marginBottom: '40px' }}>Privacy Policy</h1>
      
      <div style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p><strong>Effective Date: {new Date().toLocaleDateString('en-US')}</strong></p>
        
        <p>Your privacy is important to us. It is Editorial Devotion&apos;s policy to respect your privacy regarding any information we may collect from you across our application and network.</p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3d2a1a', marginTop: '20px' }}>Information We Collect</h2>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we&apos;re collecting it and how it will be used. This includes your email address via Supabase authentication, and any devotional logs you encrypt in our system.</p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3d2a1a', marginTop: '20px' }}>Data Storage</h2>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we&apos;ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

        <p style={{ marginTop: '40px' }}>
          <Link href="/" style={{ color: '#9d4f14', fontWeight: 600 }}>← Return to Home</Link>
        </p>
      </div>
    </main>
  );
}
