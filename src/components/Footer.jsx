import Link from "next/link"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-desktop">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Editorial Devotion</h3>
            <p>© {new Date().getFullYear()} ECWA Media Corp. Designed for Christ.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>GET STARTED</h4>
              <Link href="/signup">Start Devotion</Link>
              <Link href="/signin">Sign In</Link>
            </div>
            <div className="footer-col">
              <h4>LEGAL</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-mobile">
        <div className="footer-mobile-brand">
          <span className="footer-mobile-cross">✦</span>
          <h3>Editorial Devotion</h3>
          <p>Your daily quiet time with God</p>
        </div>
        <Link href="/signup" className="footer-mobile-cta">Begin Your Devotion</Link>
        <div className="footer-mobile-bottom">
          <Link href="/privacy">Privacy</Link>
          <span className="footer-mobile-dot">·</span>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="footer-mobile-copy">© {new Date().getFullYear()} ECWA Media Corp.</p>
      </div>
    </footer>
  )
}
