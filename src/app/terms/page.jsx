import Link from "next/link";

export default function TermsOfService() {
  return (
    <main style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#9d4f14', marginBottom: '40px' }}>Terms of Service</h1>
      
      <div style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3d2a1a' }}>1. Terms</h2>
        <p>By accessing the Editorial Devotion application, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3d2a1a', marginTop: '20px' }}>2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Editorial Devotion for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3d2a1a', marginTop: '20px' }}>3. Disclaimer</h2>
        <p>The materials on the Editorial Devotion app are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose.</p>

        <p style={{ marginTop: '40px' }}>
          <Link href="/" style={{ color: '#9d4f14', fontWeight: 600 }}>← Return to Home</Link>
        </p>
      </div>
    </main>
  );
}
