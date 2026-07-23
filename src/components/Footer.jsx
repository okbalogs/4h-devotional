import Link from "next/link"

const PRIMARY = '#5C3D2E'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(0,0,0,0.06)',
      padding: '3rem 1.5rem',
      marginTop: '2rem',
      fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
    }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Top section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {/* Brand */}
          <div style={{ maxWidth: '20rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.025em', textDecoration: 'none', color: 'inherit', marginBottom: '1rem' }}>
              4H Devotional
            </Link>
            <p style={{ color: '#8a877f', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your daily quiet time with God. A beautifully tailored, distraction-free space to engage with God's word using the ECWA 4H framework.
            </p>
            <p style={{ color: '#a09890', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.8 }}>
              © {new Date().getFullYear()} ECWA Media Corp.<br />Designed for Christ.
            </p>
          </div>

          {/* Links columns */}
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'inherit' }}>Get Started</h4>
              <Link href="/signup" style={{ fontSize: '0.875rem', color: '#8a877f', textDecoration: 'none', transition: 'color 0.2s' }}>Start Devotion</Link>
              <Link href="/signin" style={{ fontSize: '0.875rem', color: '#8a877f', textDecoration: 'none', transition: 'color 0.2s' }}>Sign In</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'inherit' }}>Legal</h4>
              <Link href="/privacy" style={{ fontSize: '0.875rem', color: '#8a877f', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: '0.875rem', color: '#8a877f', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link>
              <Link href="/support" style={{ fontSize: '0.875rem', color: '#8a877f', textDecoration: 'none', transition: 'color 0.2s' }}>Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
