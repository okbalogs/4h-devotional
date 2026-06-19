import Link from "next/link"
import { BookOpen, GraduationCap, Handshake, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* ── Desktop footer ── */}
      <div className="footer-desktop">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Editorial Devotion</h3>
            <p>
              © {new Date().getFullYear()} ECWA Media Corp. Designed for Christ.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>4H DAILY SHELF</h4>
              <Link href="/explore">Explore Method</Link>
              <Link href="/signup">Start Devotion</Link>
            </div>
            <div className="footer-col">
              <h4>CLASSES</h4>
              <Link href="/courses">All Courses</Link>
              <Link href="/instructors">Instructors</Link>
            </div>
            <div className="footer-col">
              <h4>COMMUNITY</h4>
              <Link href="/fellowship">Fellowship</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      {/* ── Mobile footer ── */}
      <div className="footer-mobile">
        <div className="footer-mobile-brand">
          <span className="footer-mobile-cross">✦</span>
          <h3>Editorial Devotion</h3>
          <p>Your daily quiet time with God</p>
        </div>

        <div className="footer-mobile-nav">
          <Link href="/explore" className="footer-mobile-link">
            <span className="footer-mobile-link-icon flex items-center justify-center"><BookOpen size={16} /></span>
            Explore
          </Link>
          <Link href="/courses" className="footer-mobile-link">
            <span className="footer-mobile-link-icon flex items-center justify-center"><GraduationCap size={16} /></span>
            Courses
          </Link>
          <Link href="/fellowship" className="footer-mobile-link">
            <span className="footer-mobile-link-icon flex items-center justify-center"><Handshake size={16} /></span>
            Fellowship
          </Link>
          <Link href="/support" className="footer-mobile-link">
            <span className="footer-mobile-link-icon flex items-center justify-center"><MessageCircle size={16} /></span>
            Support
          </Link>
        </div>

        <Link href="/signup" className="footer-mobile-cta">
          Begin Your Devotion
        </Link>

        <div className="footer-mobile-bottom">
          <Link href="/privacy">Privacy</Link>
          <span className="footer-mobile-dot">·</span>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="footer-mobile-copy">
          © {new Date().getFullYear()} ECWA Media Corp.
        </p>
      </div>
    </footer>
  )
}
